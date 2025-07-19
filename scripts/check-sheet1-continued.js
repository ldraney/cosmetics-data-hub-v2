const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

const firstSheetName = workbook.SheetNames[0];
const sheet = workbook.Sheets[firstSheetName];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1});

console.log('First sheet content - Rows 51-100:\n');
for (let i = 50; i < Math.min(100, data.length); i++) {
  const row = data[i] || [];
  if (row.length > 0) {
    console.log(`Row ${i + 1}: ${row.slice(0, 8).map(cell => cell || '').join(' | ')}`);
  }
}

// Count total formulas on sheet 1
let formulaCount = 0;
for (let i = 7; i < data.length; i++) { // Start from row 8 (index 7)
  const row = data[i] || [];
  if (row[0] && row[0].toString().match(/^\(\d+\)/)) {
    formulaCount++;
  }
}
console.log(`\nTotal formulas found on sheet 1: ${formulaCount}`);

// Also show total number of sheets
console.log(`Total sheets in workbook: ${workbook.SheetNames.length}`);
console.log('All sheet names:');
workbook.SheetNames.forEach((name, i) => console.log(`${i + 1}. ${name}`));