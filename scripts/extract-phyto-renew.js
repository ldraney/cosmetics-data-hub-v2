const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

// Look for Phyto-Renew Night Serum sheet
const sheetNames = workbook.SheetNames;
console.log('Looking for Phyto-Renew Night Serum sheet...\n');
const phytoSheets = sheetNames.filter(name => name.toLowerCase().includes('phyto'));
console.log('Sheets containing "phyto":', phytoSheets);

// Also look for renew or night serum
const renewSheets = sheetNames.filter(name => name.toLowerCase().includes('renew'));
console.log('Sheets containing "renew":', renewSheets);