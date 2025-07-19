const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

// Get the first sheet (index 0)
const firstSheetName = workbook.SheetNames[0];
console.log(`First sheet name: ${firstSheetName}\n`);

const sheet = workbook.Sheets[firstSheetName];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1});

console.log('First sheet content - First 50 rows:\n');
for (let i = 0; i < Math.min(50, data.length); i++) {
  const row = data[i] || [];
  if (row.length > 0) {
    console.log(`Row ${i + 1}: ${row.slice(0, 8).map(cell => cell || '').join(' | ')}`);
  }
}