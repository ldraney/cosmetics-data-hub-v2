const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

// Look for Clay Mask sheet
const sheetNames = workbook.SheetNames;
console.log('Looking for Clay Mask sheet...\n');
const claySheets = sheetNames.filter(name => name.toLowerCase().includes('clay'));
console.log('Sheets containing "clay":', claySheets);