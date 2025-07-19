const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

// Look for Body Lotion sheets
const sheetNames = workbook.SheetNames;
console.log('Looking for Body Lotion sheets...\n');
const bodyLotionSheets = sheetNames.filter(name => name.toLowerCase().includes('body') && name.toLowerCase().includes('lotion'));
console.log('Sheets containing "body lotion":', bodyLotionSheets);