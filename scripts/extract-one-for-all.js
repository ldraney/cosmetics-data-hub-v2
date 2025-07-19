const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
const sheet = workbook.Sheets['(70) One-for-All Skin Hydration'];
if (!sheet) {
  console.log('❌ Sheet not found. Available sheets with "One" or "Hydration":');
  workbook.SheetNames.filter(name => 
    name.toLowerCase().includes('one') || 
    name.toLowerCase().includes('hydration')
  ).forEach(name => console.log(`  - ${name}`));
  process.exit(1);
}

const data = XLSX.utils.sheet_to_json(sheet, {header: 1});

console.log('Looking for ingredients in One-for-All Skin Hydration Cream...\n');

console.log('First 20 rows of data:');
for (let i = 0; i < Math.min(20, data.length); i++) {
  const row = data[i] || [];
  console.log(`Row ${i + 1}: ${row.slice(0, 6).map(cell => cell || '').join(' | ')}`);
}

let total = 0;
let ingredients = [];

console.log('\n\nExtracting ingredients:');
for (let i = 0; i < data.length; i++) {
  const row = data[i] || [];
  
  if (row[1] && row[4] !== undefined && typeof row[4] === 'number') {
    if (row[1] === 'Ingredients' || (row[0] && row[0].match(/^[A-Z]'?$/))) continue;
    
    const ingredientName = row[1].toString();
    if (ingredientName.toLowerCase().includes('irene') || 
        ingredientName.toLowerCase().includes('mitch') ||
        ingredientName.toLowerCase().includes('hardip') ||
        ingredientName.toLowerCase().includes('provides') ||
        ingredientName.toLowerCase().includes('creates') ||
        ingredientName.toLowerCase().includes('combine') ||
        ingredientName.toLowerCase().includes('add') ||
        ingredientName.toLowerCase().includes('heat') ||
        ingredientName.toLowerCase().includes('stir')) {
      continue;
    }
    
    // Don't multiply by 100 if the number is already > 10 (likely already a percentage)
    let percentage = row[4];
    if (percentage < 10) {
      percentage = percentage * 100;
    }
    
    if (percentage > 0) {
      ingredients.push({ name: ingredientName, percentage });
      total += percentage;
    }
  }
}

console.log('Ingredients found:');
ingredients.forEach(ing => {
  console.log(`  ${ing.name}: ${ing.percentage}%`);
});
console.log(`\nTotal: ${total.toFixed(2)}%`);