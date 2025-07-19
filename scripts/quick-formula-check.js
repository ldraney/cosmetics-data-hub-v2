const XLSX = require('xlsx');

const EXCEL_FILE_PATH = '/Users/earthharbor/Downloads/Pure Earth Labs Finalized Formula.xlsx';

function checkFormula(sheetIndex) {
  try {
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const sheetName = workbook.SheetNames[sheetIndex];
    const sheet = workbook.Sheets[sheetName];
    
    console.log(`\n=== SHEET ${sheetIndex + 1}: ${sheetName} ===`);
    
    // Extract data from sheet
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    // Show raw data
    console.log('\n📋 Raw sheet data (first 20 rows):');
    data.slice(0, 20).forEach((row, index) => {
      if (row.some(cell => cell && cell.toString().trim())) {
        const rowData = row.slice(0, 6).map(cell => 
          cell ? cell.toString().substring(0, 30) : ''
        ).join(' | ');
        console.log(`  ${index + 1}: ${rowData}`);
      }
    });
    
    // Try to extract ingredients
    const ingredients = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (!row || !row.some(cell => cell && cell.toString().trim())) {
        continue;
      }
      
      let ingredientName = '';
      let percentage = 0;
      
      // Look for ingredient name and percentage in the same row
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        
        if (cell && typeof cell === 'string') {
          // Check for percentage pattern
          const percentageMatch = cell.match(/(\d+\.?\d*)\s*%/);
          if (percentageMatch) {
            percentage = parseFloat(percentageMatch[1]);
            
            // Look for ingredient name in earlier columns
            for (let k = 0; k < j; k++) {
              if (row[k] && typeof row[k] === 'string' && row[k].trim()) {
                ingredientName = row[k].trim();
                break;
              }
            }
          }
        }
        
        // Check for numeric percentage
        if (typeof cell === 'number' && cell > 0 && cell <= 100) {
          percentage = cell;
          
          // Look for ingredient name in earlier columns
          for (let k = 0; k < j; k++) {
            if (row[k] && typeof row[k] === 'string' && row[k].trim()) {
              ingredientName = row[k].trim();
              break;
            }
          }
        }
      }
      
      // If we found both name and percentage, add to ingredients
      if (ingredientName && percentage > 0) {
        // Check if this ingredient already exists (avoid duplicates)
        const existing = ingredients.find(ing => 
          ing.name.toLowerCase() === ingredientName.toLowerCase()
        );
        
        if (!existing) {
          ingredients.push({
            name: ingredientName,
            percentage: percentage
          });
        }
      }
    }
    
    if (ingredients.length > 0) {
      console.log('\n🔍 EXTRACTED INGREDIENTS:');
      ingredients.forEach((ing, index) => {
        console.log(`  ${index + 1}. ${ing.name}: ${ing.percentage}%`);
      });
      
      const total = ingredients.reduce((sum, ing) => sum + ing.percentage, 0);
      console.log(`\n📊 Total: ${total.toFixed(2)}%`);
      
      if (total >= 99.5 && total <= 100.5) {
        console.log('✅ Total looks good!');
      } else {
        console.log('⚠️  Total percentage is outside normal range');
      }
      
      return { sheetName, ingredients, total };
    } else {
      console.log('\n⚠️  No ingredients found in this sheet');
      return null;
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    return null;
  }
}

function main() {
  const sheetIndex = parseInt(process.argv[2]) || 6; // Default to sheet 7 (first real formula)
  
  console.log('🔧 Quick Formula Check Tool\n');
  console.log(`Checking sheet ${sheetIndex + 1}...`);
  
  const result = checkFormula(sheetIndex);
  
  if (result) {
    console.log(`\n✅ Found formula: ${result.sheetName}`);
    console.log(`📊 ${result.ingredients.length} ingredients, ${result.total.toFixed(2)}% total`);
  } else {
    console.log('\n❌ No valid formula found');
  }
}

if (require.main === module) {
  main();
}