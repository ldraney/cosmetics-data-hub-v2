const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
const sheet = workbook.Sheets['(58)Cream Mask'];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1});

console.log('(58)Cream Mask - Full formula:\n');
for (let i = 0; i < Math.min(40, data.length); i++) {
  const row = data[i] || [];
  if (row.length > 0) {
    console.log(`Row ${i + 1}: ${row.slice(0, 6).map(cell => cell || '').join(' | ')}`);
  }
}