const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

// Look for Eco-Pure Moisturizer sheet
const sheetNames = workbook.SheetNames;
console.log('Looking for Eco-Pure Moisturizer sheet...\n');
const ecoSheets = sheetNames.filter(name => name.toLowerCase().includes('eco'));
console.log('Sheets containing "eco":', ecoSheets);

// Also look for moisturizer
const moistSheets = sheetNames.filter(name => name.toLowerCase().includes('moistur'));
console.log('Sheets containing "moistur":', moistSheets);