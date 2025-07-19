const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
const sheet = workbook.Sheets['(57)BarrierBoost Ceramide Serum'];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1});

console.log('BarrierBoost Ceramide Serum - First 25 rows:\n');
for (let i = 0; i < Math.min(25, data.length); i++) {
  const row = data[i] || [];
  if (row.length > 0) {
    console.log(`Row ${i + 1}: ${row.slice(0, 6).map(cell => cell || '').join(' | ')}`);
  }
}