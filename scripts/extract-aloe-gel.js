const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

// Look for Aloe Vera Gel sheet
const sheetNames = workbook.SheetNames;
console.log('Looking for Aloe Vera Gel sheet...\n');
const aloeSheets = sheetNames.filter(name => name.toLowerCase().includes('aloe'));
console.log('Sheets containing "aloe":', aloeSheets);

if (aloeSheets.length > 0) {
  const sheet = workbook.Sheets[aloeSheets[0]];
  const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
  
  console.log(`\n${aloeSheets[0]} - First 35 rows:\n`);
  for (let i = 0; i < Math.min(35, data.length); i++) {
    const row = data[i] || [];
    if (row.length > 0) {
      console.log(`Row ${i + 1}: ${row.slice(0, 6).map(cell => cell || '').join(' | ')}`);
    }
  }
} else {
  console.log('No sheets found with "aloe" in the name. All sheet names:');
  sheetNames.forEach((name, i) => console.log(`${i + 1}. ${name}`));
}