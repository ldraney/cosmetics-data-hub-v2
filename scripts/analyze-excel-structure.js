// Script to analyze Excel structure across different formula tabs
const XLSX = require('xlsx');
const path = require('path');

function analyzeExcelStructure(filePath) {
  const workbook = XLSX.readFile(filePath);
  
  console.log('📊 Analyzing Excel file structure...\n');
  
  // Get all sheet names that look like formula sheets
  const formulaSheets = workbook.SheetNames.filter(name => 
    name.match(/^\(\d+\)/) || // Starts with (number)
    name.includes('PEL-') ||   // Contains formula code
    (name.length < 50 && !name.includes('TEMPLATE') && !name.includes('tracking'))
  );
  
  console.log(`Found ${formulaSheets.length} potential formula sheets\n`);
  
  const structures = new Map();
  
  // Analyze first 5 sheets to understand patterns
  formulaSheets.slice(0, 5).forEach(sheetName => {
    console.log(`\n=== Analyzing: ${sheetName} ===`);
    
    const sheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
    
    // Find key information
    let productName = null;
    let formulaNumber = null;
    let ingredientStartRow = null;
    let percentageColumn = null;
    
    // Scan first 20 rows for structure
    for (let i = 0; i < Math.min(20, data.length); i++) {
      const row = data[i] || [];
      
      // Look for product name
      if (row[0] === 'Product Name' && row[1]) {
        productName = row[1];
        console.log(`  Product Name: ${productName} (row ${i + 1})`);
      }
      
      // Look for formula number
      if (row[0] === 'Formula Number' && row[1]) {
        formulaNumber = row[1];
        console.log(`  Formula Number: ${formulaNumber} (row ${i + 1})`);
      }
      
      // Look for ingredient header row
      if (row.includes('Ingredients') && row.includes('% w/w')) {
        ingredientStartRow = i + 1;
        percentageColumn = row.indexOf('% w/w');
        console.log(`  Ingredients start at row ${i + 2}, percentage in column ${String.fromCharCode(65 + percentageColumn)}`);
      }
    }
    
    // Analyze ingredient data structure
    if (ingredientStartRow !== null) {
      const ingredients = [];
      let totalPercentage = 0;
      
      for (let i = ingredientStartRow; i < data.length; i++) {
        const row = data[i] || [];
        
        // Skip empty rows or phase change rows
        if (!row[1] || typeof row[1] !== 'string' || row[1].length < 2) continue;
        
        // Stop at procedure or notes
        if (row[0] && (row[0].includes('Procedure') || row[0].includes('Note'))) break;
        
        const ingredientName = row[1];
        const percentage = parseFloat(row[percentageColumn]);
        
        if (ingredientName && !isNaN(percentage)) {
          ingredients.push({ name: ingredientName, percentage });
          totalPercentage += percentage;
        }
      }
      
      console.log(`  Found ${ingredients.length} ingredients`);
      console.log(`  Total percentage: ${totalPercentage.toFixed(2)}%`);
      
      // Show first 3 ingredients as example
      console.log(`  Sample ingredients:`);
      ingredients.slice(0, 3).forEach(ing => {
        console.log(`    - ${ing.name}: ${ing.percentage}%`);
      });
    }
    
    // Store structure info
    structures.set(sheetName, {
      productName,
      formulaNumber,
      ingredientStartRow,
      percentageColumn
    });
  });
  
  // Analyze patterns
  console.log('\n\n📋 STRUCTURE ANALYSIS SUMMARY:');
  console.log('================================');
  
  const columnLetters = new Set();
  structures.forEach(s => {
    if (s.percentageColumn !== null) {
      columnLetters.add(String.fromCharCode(65 + s.percentageColumn));
    }
  });
  
  console.log(`Percentage columns found: ${Array.from(columnLetters).join(', ')}`);
  console.log('\nRecommended approach:');
  console.log('1. Look for "Product Name" in column A to identify formula');
  console.log('2. Find header row with "Ingredients" and "% w/w"');
  console.log('3. Extract ingredients starting from next row');
  console.log('4. Stop at empty rows or procedure sections');
  console.log('5. Handle phase markers (A, B, C) by skipping them');
  
  return structures;
}

if (require.main === module) {
  const excelPath = path.join(process.env.HOME, 'Downloads', 'Pure Earth Labs Finalized Formula.xlsx');
  analyzeExcelStructure(excelPath);
}

module.exports = { analyzeExcelStructure };