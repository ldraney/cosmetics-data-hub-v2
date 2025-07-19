const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

// Look for Anti-Pollution Serum sheet
const sheetNames = workbook.SheetNames;
console.log('Looking for Anti-Pollution Serum sheet...\n');
const pollutionSheets = sheetNames.filter(name => name.toLowerCase().includes('pollution') || name.toLowerCase().includes('anti'));
console.log('Sheets containing "pollution" or "anti":', pollutionSheets);