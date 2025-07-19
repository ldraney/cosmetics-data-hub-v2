const XLSX = require('xlsx');
const fs = require('fs');

async function extractAllIngredients() {
  try {
    const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
    const allIngredients = new Set();
    const ingredientData = [];
    
    console.log('🔍 Scanning all Excel sheets for ingredients...\n');
    
    // Skip the first few sheets (tracking, templates, etc.)
    const formulaSheets = workbook.SheetNames.filter(name => 
      name.match(/^\(\d+\)/) || name.includes('PEL-') || name.includes('Formula')
    );
    
    console.log(`Found ${formulaSheets.length} formula sheets to scan:\n`);
    
    let totalIngredientsFound = 0;
    
    for (const sheetName of formulaSheets) {
      try {
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
        
        let sheetIngredients = 0;
        
        // Look for ingredient rows (usually start around row 7-10)
        for (let i = 5; i < Math.min(50, data.length); i++) {
          const row = data[i] || [];
          
          // Skip header rows and procedure rows
          if (row[0] && typeof row[0] === 'string') {
            const cellText = row[0].toString().trim();
            
            // Skip obvious non-ingredient rows
            if (cellText.toLowerCase().includes('ingredients') ||
                cellText.toLowerCase().includes('procedure') ||
                cellText.toLowerCase().includes('phase') ||
                cellText.toLowerCase().includes('combine') ||
                cellText.toLowerCase().includes('add') ||
                cellText.toLowerCase().includes('heat') ||
                cellText.toLowerCase().includes('stir') ||
                cellText.toLowerCase().includes('homogenize') ||
                cellText.toLowerCase().includes('cool') ||
                cellText.toLowerCase().includes('properties') ||
                cellText.toLowerCase().includes('appearance') ||
                cellText.toLowerCase().includes('odor') ||
                cellText.toLowerCase().includes('coa') ||
                cellText.toLowerCase().includes('benchmarks') ||
                cellText.toLowerCase().includes('total') ||
                cellText === 'A' || cellText === 'B' || cellText === 'C' || cellText === 'D' ||
                cellText === "A'" || cellText === "B'" || cellText === "C'" ||
                !cellText || cellText.length < 2) {
              continue;
            }
            
            // Check if this looks like an ingredient (has a percentage in column 3 or 4)
            const percentage1 = row[3];
            const percentage2 = row[4];
            
            if ((percentage1 && typeof percentage1 === 'number' && percentage1 > 0 && percentage1 <= 100) ||
                (percentage2 && typeof percentage2 === 'number' && percentage2 > 0 && percentage2 <= 100)) {
              
              const ingredientName = cellText;
              
              if (!allIngredients.has(ingredientName)) {
                allIngredients.add(ingredientName);
                
                // Try to get INCI name from column 1 (index 1)
                const inciName = row[1] ? row[1].toString().trim() : '';
                const functionDesc = row[2] ? row[2].toString().trim() : '';
                const percentage = percentage1 || percentage2;
                
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
    
    fs.writeFileSync('extracted-ingredients.json', JSON.stringify(output, null, 2));
    console.log(`\n💾 Saved all ingredient data to: extracted-ingredients.json`);
    
    // Show first 20 ingredients as preview
    console.log(`\n📋 First 20 ingredients preview:`);
    ingredientData.slice(0, 20).forEach((ing, i) => {
      console.log(`${i + 1}. ${ing.name}${ing.inci ? ` (${ing.inci})` : ''}`);
    });
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
  }
}

extractAllIngredients();