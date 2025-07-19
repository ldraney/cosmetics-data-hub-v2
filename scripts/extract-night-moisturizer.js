const XLSX = require('xlsx');
const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
const sheet = workbook.Sheets['(62) Night Moisturizer'];
const data = XLSX.utils.sheet_to_json(sheet, {header: 1});

console.log('Looking for ingredients in (62) Night Moisturizer...\n');
let total = 0;
let ingredients = [];

console.log('First 20 rows of data:');
for (let i = 0; i < Math.min(20, data.length); i++) {
  const row = data[i] || [];
  console.log(`Row ${i + 1}: ${row.slice(0, 6).map(cell => cell || '').join(' | ')}`);
}

console.log('\n\nExtracting ingredients:');
for (let i = 0; i < data.length; i++) {
  const row = data[i] || [];
  // Column B has ingredient names, Column E has percentages
  if (row[1] && row[4] !== undefined && typeof row[4] === 'number') {
    // Skip if it's a header or phase marker
    if (row[1] === 'Ingredients' || (row[0] && row[0].match(/^[A-Z]'?$/))) continue;
    
    // Skip task notes
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