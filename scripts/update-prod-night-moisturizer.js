// Update production with Night Moisturizer fix
const { Pool } = require('pg');

const prodPool = new Pool({
  connectionString: process.env.PROD_DATABASE_URL,
});

const localPool = new Pool({
  connectionString: process.env.LOCAL_DATABASE_URL || 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

async function updateProdNightMoisturizer() {
  const prodClient = await prodPool.connect();
  const localClient = await localPool.connect();
  
  try {
    console.log('🔄 Updating production Night Moisturizer (ID: 41)...\n');
    
    // Get corrected local data
    const localData = await localClient.query(`
      SELECT fi.ingredient_id, fi.percentage, i.name as ingredient_name
      FROM formula_ingredients fi
      JOIN ingredients i ON fi.ingredient_id = i.id
      WHERE fi.formula_id = 41
      ORDER BY fi.percentage DESC
    `);
    
    console.log(`✅ Found ${localData.rows.length} corrected ingredients in local database`);
    console.log('📋 Local ingredients:');
    localData.rows.forEach(ing => {
      console.log(`   ${ing.ingredient_name}: ${ing.percentage}%`);
    });
    
    const localTotal = localData.rows.reduce((sum, ing) => sum + parseFloat(ing.percentage), 0);
    console.log(`\n📊 Local total: ${localTotal.toFixed(2)}%`);
    
    // Start production transaction
    await prodClient.query('BEGIN');
    
    // Get current production state
    const prodCurrent = await prodClient.query(`
      SELECT ROUND(SUM(fi.percentage)::numeric, 2) as current_total,
             COUNT(fi.id) as current_count
      FROM formula_ingredients fi
      WHERE fi.formula_id = 41
    `);
    
    console.log(`\n🔍 Production before fix: ${prodCurrent.rows[0].current_total}% (${prodCurrent.rows[0].current_count} ingredients)`);
    
    // Clear production formula ingredients
    await prodClient.query('DELETE FROM formula_ingredients WHERE formula_id = 41');
    
    // Insert corrected ingredients
    for (const ingredient of localData.rows) {
      await prodClient.query(`
        INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage, created_date)
        VALUES (41, $1, $2, CURRENT_TIMESTAMP)
      `, [ingredient.ingredient_id, ingredient.percentage]);
    }
    
    // Update formula status
    await prodClient.query(`
      UPDATE formulas 
      SET status = 'approved', 
          review_reasons = NULL,
          updated_date = CURRENT_TIMESTAMP 
      WHERE id = 41
    `);
    
    // Verify the fix
    const prodAfter = await prodClient.query(`
      SELECT ROUND(SUM(fi.percentage)::numeric, 2) as new_total,
             COUNT(fi.id) as new_count
      FROM formula_ingredients fi
      WHERE fi.formula_id = 41
    `);
    
    console.log(`\n✅ Production after fix: ${prodAfter.rows[0].new_total}% (${prodAfter.rows[0].new_count} ingredients)`);
    
    if (process.env.CONFIRM === 'true') {
      await prodClient.query('COMMIT');
      console.log('\n🎉 Production Night Moisturizer updated successfully!');
    } else {
      await prodClient.query('ROLLBACK');
      console.log('\n❌ Transaction rolled back (add CONFIRM=true to apply)');
      console.log('To apply: CONFIRM=true PROD_DATABASE_URL="..." node scripts/update-prod-night-moisturizer.js');
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
  
  updateProdNightMoisturizer();
}

module.exports = { updateProdNightMoisturizer };