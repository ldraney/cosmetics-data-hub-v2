const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

// Look for mask sheets
const sheetNames = workbook.SheetNames;
console.log('All sheets containing "mask":\n');
const maskSheets = sheetNames.filter(name => name.toLowerCase().includes('mask'));
maskSheets.forEach(sheet => console.log(sheet));