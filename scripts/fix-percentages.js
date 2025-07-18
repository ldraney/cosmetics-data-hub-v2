// Script to fix formula percentages from Excel data
const fs = require('fs');

function parseExcelData(excelPaste) {
  // Parse the pasted Excel data and return structured data
  const lines = excelPaste.trim().split('\n');
  const formulas = [];
  
  let currentFormula = null;
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    
    // Check if this is a formula header (usually in caps or has "v" for version)
    if (trimmed.includes('v') || trimmed.toUpperCase() === trimmed) {
      // Save previous formula if exists
      if (currentFormula) {
        formulas.push(currentFormula);
      }
      
      // Start new formula
      currentFormula = {
        name: trimmed,
        ingredients: []
      };
    } else {
      // This should be an ingredient line
      if (currentFormula) {
        // Try to parse ingredient line - look for percentage at the end
        const parts = trimmed.split('\t').filter(p => p.trim());
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const percentage = parseFloat(parts[parts.length - 1].replace('%', ''));
          
          if (!isNaN(percentage)) {
            currentFormula.ingredients.push({
              name,
              percentage
            });
          }
        }
      }
    }
  }
  
  // Don't forget the last formula
  if (currentFormula) {
    formulas.push(currentFormula);
  }
  
  return formulas;
}

function generateUpdateStatements(formulaName, correctIngredients) {
  console.log(`\n=== Fixing: ${formulaName} ===`);
  console.log('Correct ingredients:');
  correctIngredients.forEach(ing => {
    console.log(`  ${ing.name}: ${ing.percentage}%`);
  });
  
  const total = correctIngredients.reduce((sum, ing) => sum + ing.percentage, 0);
  console.log(`Total: ${total.toFixed(2)}%`);
  
  console.log('\n-- SQL Update Statements:');
  
  correctIngredients.forEach(ing => {
    console.log(`
UPDATE formula_ingredients 
SET percentage = ${ing.percentage}
WHERE formula_id = (SELECT id FROM formulas WHERE name = '${formulaName}')
  AND ingredient_id = (SELECT id FROM ingredients WHERE name = '${ing.name}');`);
  });
  
  return correctIngredients;
}

function fixFormulasInteractive() {
  console.log('🔧 Formula Percentage Fix Tool');
  console.log('============================\n');
  
  console.log('📋 Formulas needing review (from production):');
  console.log(`
(35)Himalayan Sea Salt Body Scrub  - ID: 17 - Total: 135%
2-in-1 Baby Body Wash/Shampoo - ID: 26 - Total: 209%
ALOE AND SNOW MUSHROOM HAND CREAM Hand Cream - ID: 22 - Total: 298%
Aloe Vera Gel - ID: 32 - Total: 248.5%
Aloe Vera Spray - ID: 34 - Total: 154.45%
Anti-Pollution Serum - ID: 43 - Total: 189.1%
Baby Body Lotion/ EveryAge - ID: 12 - Total: 347.6%
Balancing Gel Hydrator - ID: 18 - Total: 100.63%
BarrierBoost Ceramide Serum - ID: 36 - Total: 520.7%
Black Sand Detox Scrub - ID: 16 - Total: 200%
Body Lotion - ID: 50 - Total: 108.89999999999999%
Charcoal Clay Face Mask - ID: 57 - Total: 104.48%
Conditioning Gel Cleanser  - ID: 7 - Total: 99.49999999999999%
Cream Mask - ID: 37 - Total: 280%
Detangler Spray Conditioner - ID: 21 - Total: 372.25%
Eco-Pure Moisturizer - ID: 33 - Total: 199%
Foaming Hand Wash - ID: 30 - Total: 268.3%
Hand and Body Lotion - ID: 55 - Total: 94.1%
Hyaluronic Acid Serum - ID: 31 - Total: 377.2%
Hydrating Serum - ID: 40 - Total: 247.5%
Hydration Moisturizer (for face) - ID: 23 - Total: 105.4%
Marine-Love Refining Mask - ID: 14 - Total: 200%
Milky Cleanser- change to Vitamin Rich Soothing Milky Cleanser OR Ultra mild fortifying cleanser - ID: 8 - Total: 65.3%
Niacinamide Serum - ID: 28 - Total: 317.8%
Night Moisturizer - ID: 41 - Total: 609.85%
Nurturing Balm Cream - ID: 13 - Total: 307.79999999999995%
Nurturing Sea-Retinol Serum - ID: 48 - Total: 303.94%
One-for-All Skin Hydration Cream- WITH stable vitamin C - ID: 49 - Total: 585%
Phyto-Renew Night Serum - ID: 25 - Total: 196.3%
Plant-Based Gel Cleanser - ID: 47 - Total: 233.65%
Pore Minimizing Cream with 5% Niacinamide - ID: 19 - Total: 347.5%
Replenish Body Oil - ID: 24 - Total: 179.2%
Spirulina Cream Mask - ID: 11 - Total: 72.14999999999999%
Superfruit Radiance Balm - ID: 46 - Total: 258.29999999999995%
Support & Clarity Serum - ID: 27 - Total: 119.8%
Wholesome Detox Reset Serum - ID: 44 - Total: 298%
  `);
  
  console.log('\n📝 To fix these formulas:');
  console.log('1. Paste Excel data for a formula below');
  console.log('2. I\'ll generate SQL update statements');
  console.log('3. We\'ll collect all fixes and apply them to production');
  console.log('\nExample Excel format:');
  console.log('Formula Name v1.0');
  console.log('Ingredient 1\t25.5%');
  console.log('Ingredient 2\t74.5%');
  console.log('\nReady when you are!');
}

module.exports = {
  parseExcelData,
  generateUpdateStatements,
  fixFormulasInteractive
};

// If running directly
if (require.main === module) {
  fixFormulasInteractive();
}