const XLSX = require('xlsx');

const EXCEL_FILE_PATH = '/Users/earthharbor/Downloads/Pure Earth Labs Finalized Formula.xlsx';

function showSheetRaw(sheetIndex) {
  const workbook = XLSX.readFile(EXCEL_FILE_PATH);
  const sheetName = workbook.SheetNames[sheetIndex];
  const sheet = workbook.Sheets[sheetName];
  
  console.log(`\n=== SHEET ${sheetIndex + 1}: ${sheetName} ===\n`);
  
  const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  
  console.log('📋 ALL DATA (showing all non-empty rows):\n');
  
  data.forEach((row, index) => {
    if (row.some(cell => cell && cell.toString().trim())) {
      console.log(`Row ${index + 1}:`);
      row.forEach((cell, colIndex) => {
        if (cell && cell.toString().trim()) {
          console.log(`  Col ${String.fromCharCode(65 + colIndex)}: ${cell}`);
        }
      });
      console.log('');
    }
  });
}

// Run for sheet 8 (index 7)
showSheetRaw(7);