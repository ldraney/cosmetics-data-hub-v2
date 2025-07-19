const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

// Look for Black Sand Detox Scrub sheet
const sheetNames = workbook.SheetNames;
console.log('Looking for Black Sand Detox Scrub sheet...\n');
const blackSandSheets = sheetNames.filter(name => name.toLowerCase().includes('black') || (name.toLowerCase().includes('sand') && name.toLowerCase().includes('scrub')));
console.log('Sheets containing "black" or "sand scrub":', blackSandSheets);

// Also look for detox
const detoxSheets = sheetNames.filter(name => name.toLowerCase().includes('detox'));
console.log('Sheets containing "detox":', detoxSheets);