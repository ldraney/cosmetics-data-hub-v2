const XLSX = require('xlsx');

// Check the actual Excel data for Aloe Vera Gel
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
const sheet = workbook.Sheets['(53)Aloe Vera Gel PEL-AVG-001'];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1});

console.log('=== RAW EXCEL DATA - Aloe Vera Gel ===\n');
for (let i = 0; i < Math.min(20, data.length); i++) {
  const row = data[i] || [];
  if (row.length > 0) {
    console.log(`Row ${i + 1}: ${row.slice(0, 6).map(cell => cell || '').join(' | ')}`);
  }
}