const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

// Look for Replenish Body Oil sheet
const sheetNames = workbook.SheetNames;
console.log('Looking for Replenish Body Oil sheet...\n');
const bodyOilSheets = sheetNames.filter(name => name.toLowerCase().includes('replenish') || (name.toLowerCase().includes('body') && name.toLowerCase().includes('oil')));
console.log('Sheets containing "replenish" or "body oil":', bodyOilSheets);