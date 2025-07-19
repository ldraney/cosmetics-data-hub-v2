const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
const sheet = workbook.Sheets['(14) Caffeine Eye Cream PEL-CEC'];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1});

console.log('Looking for ingredients in Caffeine Eye Cream...\n');
let total = 0;
let ingredients = [];

for (let i = 0; i < data.length; i++) {
  const row = data[i] || [];
  // Column B has ingredient names, Column E has percentages
  if (row[1] && row[4] !== undefined && typeof row[4] === 'number') {
    // Skip if it's a header or phase marker
    if (row[1] === 'Ingredients' || (row[0] && row[0].match(/^[A-Z]'?$/))) continue;
    
    // Skip task notes (they're usually in column M and have certain keywords)
    const ingredientName = row[1].toString();
    if (ingredientName.toLowerCase().includes('irene') || 
        ingredientName.toLowerCase().includes('mitch') ||
        ingredientName.toLowerCase().includes('hardip') ||
        ingredientName.toLowerCase().includes('provides') ||
        ingredientName.toLowerCase().includes('creates')) {
      continue;
    }
    
    const percentage = row[4] * 100; // Convert decimal to percentage
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