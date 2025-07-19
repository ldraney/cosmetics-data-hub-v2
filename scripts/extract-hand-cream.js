const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
const sheet = workbook.Sheets['(40)AllSkin Hand Cream MWD-011'];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1});

console.log('AllSkin Hand Cream - First 35 rows:\n');
for (let i = 0; i < Math.min(35, data.length); i++) {
  const row = data[i] || [];
  if (row.length > 0) {
    console.log(`Row ${i + 1}: ${row.slice(0, 6).map(cell => cell || '').join(' | ')}`);
  }
}