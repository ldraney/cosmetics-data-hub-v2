// Export production data script
const fs = require('fs');
const { Pool } = require('pg');

async function exportData() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    console.log('🔍 Exporting production data...\n');
    
    // Export formulas
    const formulasResult = await pool.query(`
      SELECT id, name, version, status, review_reasons, created_date, updated_date
      FROM formulas
      ORDER BY id
    `);
    
    // Export ingredients
    const ingredientsResult = await pool.query(`
      SELECT id, name, inci_name, supplier_code, category, created_date
      FROM ingredients
      ORDER BY id
    `);
    
    // Export formula_ingredients
    const formulaIngredientsResult = await pool.query(`
      SELECT id, formula_id, ingredient_id, percentage, created_date
      FROM formula_ingredients
      ORDER BY formula_id, ingredient_id
    `);
    
    // Create export data
    const exportData = {
      timestamp: new Date().toISOString(),
      formulas: formulasResult.rows,
      ingredients: ingredientsResult.rows,
      formula_ingredients: formulaIngredientsResult.rows,
    };
    
    // Write to file
    const filename = `prod-data-export-${new Date().toISOString().split('T')[0]}.json`;
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));
    
    console.log(`✅ Exported ${formulasResult.rows.length} formulas`);
    console.log(`✅ Exported ${ingredientsResult.rows.length} ingredients`);
    console.log(`✅ Exported ${formulaIngredientsResult.rows.length} formula-ingredient relationships`);
    console.log(`📁 Saved to: ${filename}\n`);
    
    // Also create a summary of formulas needing review
    const formulasWithIngredients = [];
    
    for (const formula of formulasResult.rows) {
      const ingredients = formulaIngredientsResult.rows
        .filter(fi => fi.formula_id === formula.id)
        .map(fi => {
          const ingredient = ingredientsResult.rows.find(i => i.id === fi.ingredient_id);
          return {
            name: ingredient?.name || 'Unknown',
            inci_name: ingredient?.inci_name || '',
            percentage: parseFloat(fi.percentage)
          };
        });
      
      const totalPercentage = ingredients.reduce((sum, ing) => sum + ing.percentage, 0);
      
      if (totalPercentage < 99.5 || totalPercentage > 100.5 || formula.status === 'needs_review') {
        formulasWithIngredients.push({
          ...formula,
          ingredients,
          total_percentage: totalPercentage
        });
      }
    }
    
    if (formulasWithIngredients.length > 0) {
      console.log(`⚠️  ${formulasWithIngredients.length} formulas need review:\n`);
      
      formulasWithIngredients.forEach((formula, index) => {
        console.log(`${index + 1}. ${formula.name} (v${formula.version}) - ID: ${formula.id}`);
        console.log(`   Total: ${formula.total_percentage.toFixed(2)}%`);
        console.log(`   Status: ${formula.status}`);
        if (formula.review_reasons) {
          console.log(`   Reasons: ${formula.review_reasons.join(', ')}`);
        }
        console.log('');
      });
    } else {
      console.log('🎉 No formulas need review!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  exportData();
}

module.exports = { exportData };