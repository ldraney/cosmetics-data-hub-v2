// Final script to fix formula percentages from Excel
const XLSX = require('xlsx');
const { Pool } = require('pg');
const path = require('path');
const fs = require('fs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

function extractCorrectPercentages(sheet, sheetName) {
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
  
  // Find product name
  let productName = null;
  for (let i = 0; i < Math.min(10, data.length); i++) {
    const row = data[i] || [];
    if (row[0] === 'Product Name' && row[1]) {
      productName = row[1];
      break;
    }
  }
  
  if (!productName) return null;
  
  const ingredients = [];
  let total = 0;
  
  for (let i = 0; i < data.length; i++) {
    const row = data[i] || [];
    
    // Column B has ingredient names, Column E has percentages
    if (row[1] && row[4] !== undefined && typeof row[4] === 'number') {
      // Skip headers
      if (row[1] === 'Ingredients') continue;
      
      // Skip phase markers (single letters like A, B, C)
      if (row[0] && row[0].match(/^[A-Z]'?$/)) continue;
      
      // Skip task notes
      const ingredientName = row[1].toString();
      if (ingredientName.toLowerCase().includes('irene') || 
          ingredientName.toLowerCase().includes('mitch') ||
          ingredientName.toLowerCase().includes('hardip') ||
          ingredientName.toLowerCase().includes('provides') ||
          ingredientName.toLowerCase().includes('creates') ||
          ingredientName.toLowerCase().includes('add') ||
          ingredientName.toLowerCase().includes('mix') ||
          ingredientName.toLowerCase().includes('heat') ||
          ingredientName.toLowerCase().includes('combine')) {
        continue;
      }
      
      const percentage = row[4] * 100; // Convert decimal to percentage
      if (percentage > 0) {
        ingredients.push({ 
          name: ingredientName.trim(), 
          percentage: parseFloat(percentage.toFixed(4))
        });
        total += percentage;
      }
    }
  }
  
  return {
    sheetName,
    productName,
    ingredients,
    total: parseFloat(total.toFixed(2))
  };
}

async function fixFormulaPercentages() {
  const excelPath = path.join(process.env.HOME, 'Downloads', 'Pure Earth Labs Finalized Formula.xlsx');
  const workbook = XLSX.readFile(excelPath);
  
  console.log('🔧 Fixing formula percentages from Excel data...\n');
  
  // Get formula sheets
  const formulaSheets = workbook.SheetNames.filter(name => 
    name.match(/^\(\d+\)/) && !name.includes('TEMPLATE')
  );
  
  const client = await pool.connect();
  const fixes = [];
  
  try {
    await client.query('BEGIN');
    
    for (const sheetName of formulaSheets) {
      const sheet = workbook.Sheets[sheetName];
      const extracted = extractCorrectPercentages(sheet, sheetName);
      
      if (!extracted || extracted.ingredients.length === 0) continue;
      
      // Find matching database formula by name similarity
      const nameVariations = [
        extracted.productName,
        extracted.productName.replace(/[^a-zA-Z0-9\s]/g, ''),
        extracted.productName.split(' ').slice(0, 3).join(' ')
      ];
      
      let dbFormula = null;
      for (const variation of nameVariations) {
        const result = await client.query(`
          SELECT id, name FROM formulas 
          WHERE LOWER(name) LIKE LOWER($1) 
          LIMIT 1
        `, [`%${variation}%`]);
        
        if (result.rows.length > 0) {
          dbFormula = result.rows[0];
          break;
        }
      }
      
      if (!dbFormula) {
        console.log(`❓ No match found for: ${extracted.productName}`);
        continue;
      }
      
      // Get current database percentages
      const currentIngredients = await client.query(`
        SELECT fi.id, i.name, fi.percentage 
        FROM formula_ingredients fi
        JOIN ingredients i ON fi.ingredient_id = i.id
        WHERE fi.formula_id = $1
        ORDER BY fi.percentage DESC
      `, [dbFormula.id]);
      
      const currentTotal = currentIngredients.rows.reduce((sum, ing) => sum + parseFloat(ing.percentage), 0);
      
      console.log(`📋 ${dbFormula.name} (ID: ${dbFormula.id})`);
      console.log(`   Current DB: ${currentTotal.toFixed(2)}% (${currentIngredients.rows.length} ingredients)`);
      console.log(`   Excel: ${extracted.total}% (${extracted.ingredients.length} ingredients)`);
      
      const diff = Math.abs(currentTotal - extracted.total);
      if (diff > 0.5) {
        console.log(`   ⚠️  Difference: ${diff.toFixed(2)}% - NEEDS FIXING`);
        
        fixes.push({
          formulaId: dbFormula.id,
          formulaName: dbFormula.name,
          currentTotal,
          correctTotal: extracted.total,
          excelIngredients: extracted.ingredients
        });
        
        // Show sample ingredients
        console.log(`   Sample Excel ingredients:`);
        extracted.ingredients.slice(0, 3).forEach(ing => {
          console.log(`     - ${ing.name}: ${ing.percentage}%`);
        });
      } else {
        console.log(`   ✅ Already correct!`);
      }
      console.log('');
    }
    
    await client.query('ROLLBACK'); // Don't commit yet
    
    // Save the fixes for review
    if (fixes.length > 0) {
      fs.writeFileSync('percentage-fixes.json', JSON.stringify(fixes, null, 2));
      console.log(`\n💾 Found ${fixes.length} formulas needing percentage fixes`);
      console.log('📁 Saved to percentage-fixes.json for review');
      console.log('\nTo apply fixes, run: node scripts/apply-percentage-fixes.js');
    } else {
      console.log('\n✅ All formulas have correct percentages!');
    }
    
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  fixFormulaPercentages();
}

module.exports = { extractCorrectPercentages };