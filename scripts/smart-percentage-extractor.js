// Smart formula percentage extractor that handles various formats
const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

function smartPercentageParser(value, allValues) {
  if (value === null || value === undefined || value === '') return null;
  
  let percentage;
  
  if (typeof value === 'number') {
    percentage = value;
  } else if (typeof value === 'string') {
    // Remove % sign and parse
    percentage = parseFloat(value.replace('%', '').trim());
  } else {
    return null;
  }
  
  if (isNaN(percentage)) return null;
  
  // Smart detection: if all values in this column are < 2, they're likely decimals
  const numericValues = allValues.filter(v => {
    const num = typeof v === 'number' ? v : parseFloat(String(v).replace('%', ''));
    return !isNaN(num);
  }).map(v => typeof v === 'number' ? v : parseFloat(String(v).replace('%', '')));
  
  const maxValue = Math.max(...numericValues);
  
  // If max value is less than 2, assume all values are in decimal format
  if (maxValue < 2 && percentage < 2) {
    percentage = percentage * 100;
  }
  
  return parseFloat(percentage.toFixed(4));
}

function extractFormulaFromSheet(sheet, sheetName, verbose = false) {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  // Find product name
  let productName = null;
  let ingredientStartRow = null;
  let ingredientCol = null;
  let percentageCol = null;
  
  // Scan for structure
  for (let i = 0; i < Math.min(30, data.length); i++) {
    const row = data[i] || [];
    
    // Find product name
    if (row[0] === 'Product Name' && row[1]) {
      productName = row[1];
    }
    
    // Find ingredient header row
    for (let j = 0; j < row.length; j++) {
      if (row[j] && typeof row[j] === 'string') {
        if (row[j].toLowerCase().includes('ingredient') && !ingredientCol) {
          ingredientCol = j;
        }
        if (row[j].includes('% w/w') || row[j].includes('%w/w') || row[j] === '%') {
          percentageCol = j;
          ingredientStartRow = i + 1;
        }
      }
    }
  }
  
  if (!productName || ingredientStartRow === null || percentageCol === null) {
    if (verbose) {
      console.log(`  ❌ Could not find structure in ${sheetName}`);
    }
    return null;
  }
  
  // Collect all percentage values first for smart detection
  const allPercentages = [];
  for (let i = ingredientStartRow; i < data.length; i++) {
    const row = data[i] || [];
    if (row[percentageCol] !== undefined && row[percentageCol] !== null && row[percentageCol] !== '') {
      allPercentages.push(row[percentageCol]);
    }
  }
  
  // Extract ingredients
  const ingredients = [];
  let totalPercentage = 0;
  
  for (let i = ingredientStartRow; i < data.length; i++) {
    const row = data[i] || [];
    
    // Get ingredient name - could be in column B or after phase marker
    let ingredientName = row[ingredientCol || 1];
    
    // Skip if no ingredient name
    if (!ingredientName || ingredientName === '') continue;
    
    // Skip phase markers and procedure text
    if (typeof ingredientName === 'string') {
      const lower = ingredientName.toLowerCase();
      if (ingredientName.length === 1 || // Single letter phase markers
          lower.includes('procedure') ||
          lower.includes('combine') ||
          lower.includes('mix') ||
          lower.includes('heat') ||
          lower.includes('add')) {
        continue;
      }
    }
    
    const percentage = smartPercentageParser(row[percentageCol], allPercentages);
    
    if (ingredientName && percentage !== null && percentage > 0) {
      ingredients.push({ 
        name: ingredientName.trim(), 
        percentage
      });
      totalPercentage += percentage;
    }
  }
  
  return {
    sheetName,
    productName,
    ingredients,
    totalPercentage: parseFloat(totalPercentage.toFixed(2))
  };
}

async function analyzeAndFixPercentages() {
  const excelPath = path.join(process.env.HOME, 'Downloads', 'Pure Earth Labs Finalized Formula.xlsx');
  const workbook = XLSX.readFile(excelPath);
  
  console.log('🔍 Analyzing formula percentages with smart detection...\n');
  
  // Get formula sheets
  const formulaSheets = workbook.SheetNames.filter(name => 
    name.match(/^\(\d+\)/) && !name.includes('TEMPLATE')
  );
  
  const results = [];
  const client = await pool.connect();
  
  try {
    for (const sheetName of formulaSheets.slice(0, 20)) { // First 20 for testing
      const sheet = workbook.Sheets[sheetName];
      const extracted = extractFormulaFromSheet(sheet, sheetName);
      
      if (!extracted) continue;
      
      // Find matching database formula
      const dbResult = await client.query(`
        SELECT f.id, f.name, 
               ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage
        FROM formulas f
        LEFT JOIN formula_ingredients fi ON f.id = fi.formula_id
        WHERE f.name ILIKE $1
        GROUP BY f.id, f.name
      `, [`%${extracted.productName}%`]);
      
      if (dbResult.rows.length > 0) {
        const dbFormula = dbResult.rows[0];
        const diff = Math.abs(dbFormula.total_percentage - extracted.totalPercentage);
        
        console.log(`${sheetName}: ${extracted.productName}`);
        console.log(`  DB: ${dbFormula.total_percentage}% | Excel: ${extracted.totalPercentage}%`);
        
        if (diff > 0.5) {
          console.log(`  ⚠️  Difference: ${diff.toFixed(2)}%`);
          
          // Show first few ingredients for debugging
          console.log(`  Sample ingredients from Excel:`);
          extracted.ingredients.slice(0, 3).forEach(ing => {
            console.log(`    - ${ing.name}: ${ing.percentage}%`);
          });
          
          results.push({
            formulaId: dbFormula.id,
            formulaName: dbFormula.name,
            dbTotal: dbFormula.total_percentage,
            excelTotal: extracted.totalPercentage,
            difference: diff,
            excelIngredients: extracted.ingredients
          });
        } else {
          console.log(`  ✅ Match!`);
        }
        console.log('');
      }
    }
    
    // Save results
    if (results.length > 0) {
      fs.writeFileSync('formula-percentage-fixes.json', JSON.stringify(results, null, 2));
      console.log(`\n💾 Saved ${results.length} formulas needing fixes to formula-percentage-fixes.json`);
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  analyzeAndFixPercentages();
}

module.exports = { extractFormulaFromSheet, smartPercentageParser };