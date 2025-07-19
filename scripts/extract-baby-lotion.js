const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
const sheet = workbook.Sheets['(29)Baby Body Lotion EveryAge B'];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1});

console.log('Baby Body Lotion EveryAge - First 30 rows:\n');
for (let i = 0; i < Math.min(30, data.length); i++) {
  const row = data[i] || [];
  if (row.length > 0) {
    console.log(`Row ${i + 1}: ${row.slice(0, 6).map(cell => cell || '').join(' | ')}`);
  }
}