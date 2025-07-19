const XLSX = require('xlsx');
const fs = require('fs');

async function extractAllIngredients() {
  try {
    const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
    const allIngredients = new Set();
    const ingredientData = [];
    
    console.log('🔍 Scanning all Excel sheets for ingredients...\n');
    
    // Get all formula sheets (numbered ones from 1-88)
    const formulaSheets = workbook.SheetNames.filter(name => 
      name.match(/^\(\d+\)/) && !name.includes('TEMPLATE')
    );
    
    console.log(`Found ${formulaSheets.length} formula sheets to scan:\n`);
    
    let totalIngredientsFound = 0;
    
    for (const sheetName of formulaSheets) {
      try {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
        
        let sheetIngredients = 0;
        
        // Look for ingredient rows (start after "Ingredients" header, usually row 7-8)
        let startRow = -1;
        for (let i = 0; i < 15; i++) {
          const row = data[i] || [];
          if (row[1] && row[1].toString().toLowerCase().includes('ingredients')) {
            startRow = i + 1;
            break;
          }
        }
        
        if (startRow === -1) continue; // No ingredients header found
        
        // Extract ingredients from startRow onwards
        for (let i = startRow; i < Math.min(startRow + 30, data.length); i++) {
          const row = data[i] || [];
          
          // Check if this is an ingredient row (has ingredient name in column 1 and percentage in column 4)
          const ingredientName = row[1] ? row[1].toString().trim() : '';
          const percentage = row[4];
          
          if (ingredientName && 
              typeof percentage === 'number' && 
              percentage > 0 && 
              percentage <= 100 &&
              !ingredientName.toLowerCase().includes('combine') &&
              !ingredientName.toLowerCase().includes('add') &&
              !ingredientName.toLowerCase().includes('heat') &&
              !ingredientName.toLowerCase().includes('stir') &&
              !ingredientName.toLowerCase().includes('procedure') &&
              !ingredientName.toLowerCase().includes('ingredients') &&
              !ingredientName.toLowerCase().includes('phase') &&
              ingredientName.length > 2) {
            
            if (!allIngredients.has(ingredientName)) {
              allIngredients.add(ingredientName);
              
              // Get INCI name from column 2 (index 2)
              const inciName = row[2] ? row[2].toString().trim() : '';
              const functionDesc = row[3] ? row[3].toString().trim() : '';
              
              ingredientData.push({
                name: ingredientName,
                inci: inciName,
                function: functionDesc,
                percentage: percentage,
                sourceSheet: sheetName
              });
              
              sheetIngredients++;
              totalIngredientsFound++;
            }
          }
          
          // Stop if we hit a procedure or empty section
          if (ingredientName.toLowerCase().includes('procedure') ||
              ingredientName.toLowerCase().includes('combine') ||
              ingredientName.toLowerCase().includes('coa') ||
              (row.length === 0 && i > startRow + 5)) {
            break;
          }
        }
        
        if (sheetIngredients > 0) {
          console.log(`✅ ${sheetName}: ${sheetIngredients} ingredients`);
        }
        
      } catch (error) {
        console.log(`❌ Error processing ${sheetName}: ${error.message}`);
      }
    }
    
    console.log(`\n🎯 TOTAL UNIQUE INGREDIENTS FOUND: ${allIngredients.size}`);
    console.log(`📊 Total ingredient instances: ${totalIngredientsFound}`);
    
    // Save to file for review
    const output = {
      summary: {
        totalUniqueIngredients: allIngredients.size,
        totalInstances: totalIngredientsFound,
        sheetsProcessed: formulaSheets.length
      },
      ingredients: ingredientData.sort((a, b) => a.name.localeCompare(b.name))
    };
    
    fs.writeFileSync('extracted-ingredients-complete.json', JSON.stringify(output, null, 2));
    console.log(`\n💾 Saved all ingredient data to: extracted-ingredients-complete.json`);
    
    // Show first 30 ingredients as preview
    console.log(`\n📋 First 30 ingredients preview:`);
    ingredientData.slice(0, 30).forEach((ing, i) => {
      console.log(`${i + 1}. "${ing.name}"${ing.inci ? ` (${ing.inci})` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

extractAllIngredients();