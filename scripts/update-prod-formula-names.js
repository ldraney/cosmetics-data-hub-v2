// Script to update production database with cleaned formula names
const { Pool } = require('pg');

// Production database connection
const prodPool = new Pool({
  connectionString: process.env.PROD_DATABASE_URL,
});

// Local database connection
const localPool = new Pool({
  connectionString: process.env.LOCAL_DATABASE_URL || 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

async function updateProductionFormulaNames() {
  const prodClient = await prodPool.connect();
  const localClient = await localPool.connect();
  
  try {
    console.log('🔄 Fetching cleaned formula names from local database...\n');
    
    // Get all formulas from local database
    const localFormulas = await localClient.query('SELECT id, name FROM formulas ORDER BY id');
    
    // Start transaction on production
    await prodClient.query('BEGIN');
    
    let updatedCount = 0;
    const updates = [];
    
    for (const formula of localFormulas.rows) {
      // Get current production name
      const prodResult = await prodClient.query('SELECT name FROM formulas WHERE id = $1', [formula.id]);
      
      if (prodResult.rows.length > 0 && prodResult.rows[0].name !== formula.name) {
        console.log(`📝 Updating formula ${formula.id}:`);
        console.log(`   From: "${prodResult.rows[0].name}"`);
        console.log(`   To:   "${formula.name}"`);
        
        updates.push({
          id: formula.id,
          oldName: prodResult.rows[0].name,
          newName: formula.name
        });
        
        // Update production database
        await prodClient.query(
          'UPDATE formulas SET name = $1, updated_date = CURRENT_TIMESTAMP WHERE id = $2',
          [formula.name, formula.id]
        );
        
        updatedCount++;
      }
    }
    
    if (updatedCount === 0) {
      console.log('✅ No updates needed - production names already match local names');
      await prodClient.query('ROLLBACK');
      return;
    }
    
    // Show summary before committing
    console.log(`\n📊 Summary: ${updatedCount} formula names will be updated`);
    console.log('\n🔍 Review changes:');
    updates.forEach(u => {
      console.log(`   ID ${u.id}: "${u.oldName}" → "${u.newName}"`);
    });
    
    // Ask for confirmation
    console.log('\n⚠️  This will update the PRODUCTION database!');
    console.log('Please review the changes above.');
    console.log('\nTo commit these changes, run:');
    console.log('  CONFIRM=true PROD_DATABASE_URL="postgres://..." node scripts/update-prod-formula-names.js');
    
    if (process.env.CONFIRM === 'true') {
      await prodClient.query('COMMIT');
      console.log('\n✅ Production database updated successfully!');
    } else {
      await prodClient.query('ROLLBACK');
      console.log('\n❌ Transaction rolled back (no changes made)');
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
    console.error('Usage: PROD_DATABASE_URL="postgres://..." node scripts/update-prod-formula-names.js');
    process.exit(1);
  }
  
  updateProductionFormulaNames();
}

module.exports = { updateProductionFormulaNames };