const XLSX = require('xlsx');

// Extract Every-Skin Hydration Toner data
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
const sheet = workbook.Sheets['(9) Every-Skin Hydration Toner '];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1});

console.log('(9) Every-Skin Hydration Toner - Formula data:\n');
for (let i = 0; i < Math.min(25, data.length); i++) {
  const row = data[i] || [];
  if (row.length > 0) {
    console.log(`Row ${i + 1}: ${row.slice(0, 6).map(cell => cell || '').join(' | ')}`);
  }
}

// Extract ingredients and percentages
const ingredients = [];
let totalPercentage = 0;

for (let i = 8; i < data.length; i++) { // Start from ingredient rows
  const row = data[i] || [];
  if (row[0] && row[3] && typeof row[3] === 'number') { // Has ingredient and percentage
    const ingredient = row[0].toString().trim();
    const percentage = parseFloat(row[3]);
    
    if (ingredient && !ingredient.toLowerCase().includes('combine') && 
        !ingredient.toLowerCase().includes('procedure') && percentage > 0) {
      ingredients.push({ ingredient, percentage });
      totalPercentage += percentage;
    }
  }
}

console.log('\nExtracted ingredients:');
ingredients.forEach(ing => console.log(`${ing.ingredient}: ${ing.percentage}%`));
console.log(`\nTotal: ${totalPercentage}%`);