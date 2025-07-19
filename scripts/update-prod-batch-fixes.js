// Update production with batch of formula fixes
const { Pool } = require('pg');

const prodPool = new Pool({
  connectionString: process.env.PROD_DATABASE_URL,
});

const localPool = new Pool({
  connectionString: process.env.LOCAL_DATABASE_URL || 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

async function updateProdBatchFixes() {
  const prodClient = await prodPool.connect();
  const localClient = await localPool.connect();
  
  try {
    console.log('🔄 Updating production with batch formula fixes...\n');
    
    // Formulas to update (ID: Name) - FINAL BATCH 5: All remaining critical formulas
    const formulasToUpdate = {
      30: 'Foaming Hand Wash',
      46: 'Superfruit Radiance Balm', 
      27: 'Aloe Vera Gel',
      39: 'Hydrating Serum',
      17: 'Plant-Based Gel Cleanser',
      35: 'Anti-Pollution Serum',
      26: 'Replenish Body Oil'
    };
    
    await prodClient.query('BEGIN');
    
    for (const [formulaId, formulaName] of Object.entries(formulasToUpdate)) {
      console.log(`📋 Processing: ${formulaName} (ID: ${formulaId})`);
      
      // Get corrected local data
      const localData = await localClient.query(`
        SELECT fi.ingredient_id, fi.percentage, i.name as ingredient_name
        FROM formula_ingredients fi
        JOIN ingredients i ON fi.ingredient_id = i.id
        WHERE fi.formula_id = $1
        ORDER BY fi.percentage DESC
      `, [formulaId]);
      
      if (localData.rows.length === 0) {
        console.log(`  ⚠️  No local data found for formula ${formulaId}`);
        continue;
      }
      
      // Get current production state
      const prodCurrent = await prodClient.query(`
        SELECT ROUND(SUM(fi.percentage)::numeric, 2) as current_total,
               COUNT(fi.id) as current_count
        FROM formula_ingredients fi
        WHERE fi.formula_id = $1
      `, [formulaId]);
      
      const localTotal = localData.rows.reduce((sum, ing) => sum + parseFloat(ing.percentage), 0);
      
      console.log(`  Before: ${prodCurrent.rows[0].current_total}% (${prodCurrent.rows[0].current_count} ingredients)`);
      console.log(`  After:  ${localTotal.toFixed(2)}% (${localData.rows.length} ingredients)`);
      
      // Clear production formula ingredients
      await prodClient.query('DELETE FROM formula_ingredients WHERE formula_id = $1', [formulaId]);
      
      // Insert corrected ingredients
      for (const ingredient of localData.rows) {
        await prodClient.query(`
          INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage, created_date)
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        `, [formulaId, ingredient.ingredient_id, ingredient.percentage]);
      }
      
      // Update formula status
      await prodClient.query(`
        UPDATE formulas 
        SET status = 'approved', 
            review_reasons = NULL,
            updated_date = CURRENT_TIMESTAMP 
        WHERE id = $1
      `, [formulaId]);
      
      console.log(`  ✅ Updated successfully\n`);
    }
    
    // Show summary
    console.log('📊 BATCH UPDATE SUMMARY:');
    console.log('========================');
    for (const [formulaId, formulaName] of Object.entries(formulasToUpdate)) {
      const result = await prodClient.query(`
        SELECT ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
               COUNT(fi.id) as ingredient_count
        FROM formula_ingredients fi
        WHERE fi.formula_id = $1
      `, [formulaId]);
      
      console.log(`${formulaName}: ${result.rows[0].total_percentage}% (${result.rows[0].ingredient_count} ingredients)`);
    }
    
    if (process.env.CONFIRM === 'true') {
      await prodClient.query('COMMIT');
      console.log('\n🎉 Production batch update completed successfully!');
    } else {
      await prodClient.query('ROLLBACK');
      console.log('\n❌ Transaction rolled back (add CONFIRM=true to apply)');
      console.log('To apply: CONFIRM=true PROD_DATABASE_URL="..." node scripts/update-prod-batch-fixes.js');
    }
    
  } catch (error) {
    await prodClient.query('ROLLBACK');
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    prodClient.release();
    localClient.release();
    await prodPool.end();
    await localPool.end();
  }
}

if (require.main === module) {
  if (!process.env.PROD_DATABASE_URL) {
    console.error('❌ PROD_DATABASE_URL environment variable is required');
    process.exit(1);
  }
  
  updateProdBatchFixes();
}

module.exports = { updateProdBatchFixes };