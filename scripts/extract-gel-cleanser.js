const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');

// Look for Plant-Based Gel Cleanser sheet
const sheetNames = workbook.SheetNames;
console.log('Looking for Plant-Based Gel Cleanser sheet...\n');
const cleanserSheets = sheetNames.filter(name => name.toLowerCase().includes('cleanser') || name.toLowerCase().includes('gel'));
console.log('Sheets containing "cleanser" or "gel":', cleanserSheets);

// Also look for plant-based
const plantSheets = sheetNames.filter(name => name.toLowerCase().includes('plant'));
console.log('Sheets containing "plant":', plantSheets);