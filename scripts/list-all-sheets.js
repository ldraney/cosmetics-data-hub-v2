const XLSX = require('xlsx');

const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

console.log('ALL SHEET NAMES:\n');
workbook.SheetNames.forEach((name, i) => {
  console.log(`${i + 1}. "${name}"`);
});

console.log(`\nTotal sheets: ${workbook.SheetNames.length}`);

// Check a specific sheet structure
console.log('\n=== Sample sheet structure ===');
const sampleSheet = workbook.Sheets['(53)Aloe Vera Gel PEL-AVG-001'];
if (sampleSheet) {
  const data = XLSX.utils.sheet_to_json(sampleSheet, {header: 1});
  console.log('First 15 rows of Aloe Vera Gel sheet:');
  for (let i = 0; i < Math.min(15, data.length); i++) {
    const row = data[i] || [];
    console.log(`Row ${i + 1}: [${row.map(cell => `"${cell || ''}"`).slice(0, 5).join(', ')}]`);
  }
}