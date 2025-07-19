// Script to extract formula percentages from Excel file
const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

function extractFormulaFromSheet(sheet, sheetName) {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  // Find product name and formula details
  let productName = null;
  let formulaNumber = null;
  let ingredientStartRow = null;
  let percentageColumn = null;
  
  // Scan first 20 rows
  for (let i = 0; i < Math.min(20, data.length); i++) {
    const row = data[i] || [];
    
    if (row[0] === 'Product Name' && row[1]) {
      productName = row[1];
    }
    
    if (row[0] === 'Formula Number' && row[1]) {
      formulaNumber = row[1];
    }
    
    // Look for ingredient header - could be "% w/w" or "%w/w" or "%" 
    for (let j = 0; j < row.length; j++) {
      if (row[j] && typeof row[j] === 'string' && 
          (row[j].includes('% w/w') || row[j].includes('%w/w') || row[j] === '%')) {
        ingredientStartRow = i + 1;
        percentageColumn = j;
        break;
      }
    }
  }
  
  if (!productName || ingredientStartRow === null) {
    return null;
  }
  
  // Extract ingredients
  const ingredients = [];
  let totalPercentage = 0;
  
  for (let i = ingredientStartRow; i < data.length; i++) {
    const row = data[i] || [];
    
    // Skip empty rows
    if (!row[1] || row[1] === '') continue;
    
    // Stop at procedure or notes
    if (row[0] && typeof row[0] === 'string' && 
        (row[0].toLowerCase().includes('procedure') || 
         row[0].toLowerCase().includes('note') ||
         row[0].toLowerCase().includes('combine'))) {
      continue;
    }
    
    // Skip phase markers (single letters A, B, C, etc.)
    if (row[0] && row[0].length === 1 && /^[A-Z]'?$/.test(row[0])) {
      continue;
    }
    
    const ingredientName = row[1];
    let percentage = row[percentageColumn];
    
    // Handle different percentage formats
    if (typeof percentage === 'number') {
      // If it's already a number, check if it needs to be multiplied by 100
      if (percentage < 1) {
        percentage = percentage * 100; // Convert 0.04 to 4%
      }
    } else if (typeof percentage === 'string') {
      percentage = parseFloat(percentage.replace('%', ''));
    }
    
    if (ingredientName && !isNaN(percentage) && percentage > 0) {
      ingredients.push({ 
        name: ingredientName.trim(), 
        percentage: parseFloat(percentage.toFixed(4))
      });
      totalPercentage += percentage;
    }
  }
  
  return {
    sheetName,
    productName,
    formulaNumber,
    ingredients,
    totalPercentage: parseFloat(totalPercentage.toFixed(2))
  };
}

async function extractAndCompareFormulas() {
  const excelPath = path.join(process.env.HOME, 'Downloads', 'Pure Earth Labs Finalized Formula.xlsx');
  const workbook = XLSX.readFile(excelPath);
  
  console.log('📊 Extracting formulas from Excel file...\n');
  
  // Get formula sheets (numbered ones)
  const formulaSheets = workbook.SheetNames.filter(name => 
    name.match(/^\(\d+\)/) && !name.includes('TEMPLATE')
  );
  
  const extractedFormulas = [];
  
  // Extract from each sheet
  for (const sheetName of formulaSheets) {
    const sheet = workbook.Sheets[sheetName];
    const formula = extractFormulaFromSheet(sheet, sheetName);
    
    if (formula) {
      extractedFormulas.push(formula);
    }
  }
  
  console.log(`✅ Extracted ${extractedFormulas.length} formulas from Excel\n`);
  
  // Compare with database
  const client = await pool.connect();
  
  try {
    const dbFormulas = await client.query(`
      SELECT f.id, f.name, 
             ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
             COUNT(fi.id) as ingredient_count
      FROM formulas f
      LEFT JOIN formula_ingredients fi ON f.id = fi.formula_id
      GROUP BY f.id, f.name
      ORDER BY f.id
    `);
    
    console.log('📋 FORMULA PERCENTAGE COMPARISON:');
    console.log('=====================================\n');
    
    const updates = [];
    
    for (const dbFormula of dbFormulas.rows) {
      // Find matching Excel formula
      const excelFormula = extractedFormulas.find(ef => 
        ef.productName.toLowerCase().includes(dbFormula.name.toLowerCase()) ||
        dbFormula.name.toLowerCase().includes(ef.productName.toLowerCase())
      );
      
      if (excelFormula) {
        console.log(`Formula: ${dbFormula.name}`);
        console.log(`  DB Total: ${dbFormula.total_percentage}% (${dbFormula.ingredient_count} ingredients)`);
        console.log(`  Excel Total: ${excelFormula.totalPercentage}% (${excelFormula.ingredients.length} ingredients)`);
        
        if (Math.abs(dbFormula.total_percentage - excelFormula.totalPercentage) > 0.5) {
          console.log(`  ⚠️  MISMATCH - Difference: ${Math.abs(dbFormula.total_percentage - excelFormula.totalPercentage).toFixed(2)}%`);
          updates.push({
            id: dbFormula.id,
            name: dbFormula.name,
            excelData: excelFormula
          });
        } else {
          console.log(`  ✅ Match`);
        }
        console.log('');
      }
    }
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`  Total formulas in DB: ${dbFormulas.rows.length}`);
    console.log(`  Formulas found in Excel: ${extractedFormulas.length}`);
    console.log(`  Formulas needing updates: ${updates.length}`);
    
    // Save updates for next step
    if (updates.length > 0) {
      const fs = require('fs');
      fs.writeFileSync('formula-updates.json', JSON.stringify(updates, null, 2));
      console.log(`\n💾 Saved ${updates.length} formula updates to formula-updates.json`);
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  extractAndCompareFormulas();
}

module.exports = { extractFormulaFromSheet, extractAndCompareFormulas };