const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

// Look for Hydrating Serum sheet
const sheetNames = workbook.SheetNames;
console.log('Looking for Hydrating Serum sheet...\n');
const hydatingSheets = sheetNames.filter(name => name.toLowerCase().includes('hydrat'));
console.log('Sheets containing "hydrat":', hydatingSheets);

if (hydatingSheets.length > 0) {
  const sheet = workbook.Sheets[hydatingSheets[0]];
  const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
  
  console.log(`\n${hydatingSheets[0]} - First 35 rows:\n`);
  for (let i = 0; i < Math.min(35, data.length); i++) {
    const row = data[i] || [];
    if (row.length > 0) {
      console.log(`Row ${i + 1}: ${row.slice(0, 6).map(cell => cell || '').join(' | ')}`);
    }
  }
} else {
  console.log('No sheets found with "hydrat" in the name. Searching for "serum":');
  const serumSheets = sheetNames.filter(name => name.toLowerCase().includes('serum'));
  console.log('Sheets containing "serum":', serumSheets);
}