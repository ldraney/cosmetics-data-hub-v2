const XLSX = require('xlsx');
const fs = require('fs');

const EXCEL_FILE_PATH = '/Users/earthharbor/Downloads/Pure Earth Labs Finalized Formula.xlsx';

function examineExcelFile() {
  try {
    console.log('📊 Examining Excel file structure...\n');
    
    // Read the Excel file
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    
    console.log('📋 Available sheets:');
    workbook.SheetNames.forEach((sheetName, index) => {
      console.log(`  ${index + 1}. ${sheetName}`);
    });
    
    console.log('\n🔍 Examining first few sheets for formula patterns...\n');
    
    // Look at the first 10 sheets to understand the structure
    const firstTenSheets = workbook.SheetNames.slice(0, 10);
    
    firstTenSheets.forEach((sheetName, index) => {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      
      console.log(`=== Sheet ${index + 1}: ${sheetName} ===`);
      console.log('First 10 rows:');
      
      data.slice(0, 10).forEach((row, rowIndex) => {
        if (row.some(cell => cell && cell.toString().trim())) {
          console.log(`  Row ${rowIndex + 1}: ${row.slice(0, 5).map(cell => 
            cell ? cell.toString().substring(0, 30) : ''
          ).join(' | ')}`);
        }
      });
      
      console.log('');
    });
    
    return workbook;
    
  } catch (error) {
    console.error('❌ Error reading Excel file:', error.message);
    return null;
  }
}

function extractFormulasFromExcel(startSheet = 4) {
  try {
    console.log(`📊 Extracting formulas starting from sheet ${startSheet + 1}...\n`);
    
    const workbook = XLSX.readFile(EXCEL_FILE_PATH);
    const formulas = [];
    
    // Process sheets starting from the specified index
    const formulaSheets = workbook.SheetNames.slice(startSheet);
    
    formulaSheets.forEach((sheetName, index) => {
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
      
      console.log(`Processing sheet ${startSheet + index + 1}: ${sheetName}`);
      
      // Try to extract formula data from this sheet
      const formula = extractFormulaFromSheet(sheetName, data);
      
      if (formula && formula.ingredients.length > 0) {
        formulas.push(formula);
        console.log(`  ✅ Found formula: ${formula.name} (${formula.ingredients.length} ingredients)`);
      } else {
        console.log(`  ⚠️  No valid formula found`);
      }
    });
    
    console.log(`\n📋 Extracted ${formulas.length} formulas total`);
    
    // Save to JSON file for inspection
    const outputFile = 'extracted-formulas.json';
    fs.writeFileSync(outputFile, JSON.stringify(formulas, null, 2));
    console.log(`💾 Saved to ${outputFile}`);
    
    return formulas;
    
  } catch (error) {
    console.error('❌ Error extracting formulas:', error.message);
    return [];
  }
}

function extractFormulaFromSheet(sheetName, data) {
  const formula = {
    name: sheetName,
    version: '1.0',
    ingredients: []
  };
  
  // Look for ingredient data in the sheet
  for (let i = 0; i < data.length; i++) {
    const row = data[i];
    
    // Skip empty rows
    if (!row || !row.some(cell => cell && cell.toString().trim())) {
      continue;
    }
    
    // Look for rows that might contain ingredient data
    // Common patterns: [Ingredient Name, ..., Percentage]
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      if (cell && typeof cell === 'string') {
        // Check if this cell contains a percentage
        const percentageMatch = cell.match(/(\d+\.?\d*)\s*%/);
        if (percentageMatch) {
          const percentage = parseFloat(percentageMatch[1]);
          
          // Look for ingredient name in the same row (usually earlier columns)
          let ingredientName = '';
          for (let k = 0; k < j; k++) {
            if (row[k] && typeof row[k] === 'string' && row[k].trim()) {
              ingredientName = row[k].trim();
              break;
            }
          }
          
          if (ingredientName && percentage > 0) {
            formula.ingredients.push({
              name: ingredientName,
              percentage: percentage
            });
          }
        }
      }
      
      // Also check if cell is a number that might be a percentage
      if (typeof cell === 'number' && cell > 0 && cell <= 100) {
        // Look for ingredient name in the same row
        let ingredientName = '';
        for (let k = 0; k < j; k++) {
          if (row[k] && typeof row[k] === 'string' && row[k].trim()) {
            ingredientName = row[k].trim();
            break;
          }
        }
        
        if (ingredientName) {
          formula.ingredients.push({
            name: ingredientName,
            percentage: cell
          });
        }
      }
    }
  }
  
  return formula;
}

function main() {
  console.log('🔧 Excel Formula Processing Tool\n');
  
  const args = process.argv.slice(2);
  const command = args[0];
  
  switch (command) {
    case 'examine':
      examineExcelFile();
      break;
    case 'extract':
      const startSheet = parseInt(args[1]) || 4;
      extractFormulasFromExcel(startSheet);
      break;
    default:
      console.log('Usage:');
      console.log('  node scripts/process-excel.js examine    # Examine file structure');
      console.log('  node scripts/process-excel.js extract [start_sheet]  # Extract formulas (default: start from sheet 5)');
      break;
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  examineExcelFile,
  extractFormulasFromExcel,
  extractFormulaFromSheet
};