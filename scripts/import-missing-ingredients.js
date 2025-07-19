const fs = require('fs');
const { Pool } = require('pg');

const localPool = new Pool({
  connectionString: 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

async function importMissingIngredients() {
  const client = await localPool.connect();
  
  try {
    console.log('🔍 Loading extracted ingredients...\n');
    
    // Load the extracted ingredients
    const extractedData = JSON.parse(fs.readFileSync('extracted-ingredients-complete.json', 'utf8'));
    const excelIngredients = extractedData.ingredients;
    
    console.log(`📊 Found ${excelIngredients.length} ingredients from Excel\n`);
    
    // Get existing ingredients from database
    const existingResult = await client.query('SELECT name FROM ingredients');
    const existingNames = new Set(existingResult.rows.map(row => row.name.toLowerCase().trim()));
    
    console.log(`📊 Found ${existingNames.size} existing ingredients in database\n`);
    
    // Find missing ingredients
    const missingIngredients = [];
    const duplicateIngredients = new Set();
    
    for (const ingredient of excelIngredients) {
      const normalizedName = ingredient.name.toLowerCase().trim();
      
      if (!existingNames.has(normalizedName) && !duplicateIngredients.has(normalizedName)) {
        missingIngredients.push(ingredient);
        duplicateIngredients.add(normalizedName);
      }
    }
    
    console.log(`🆕 Found ${missingIngredients.length} NEW ingredients to import\n`);
    
    if (missingIngredients.length === 0) {
      console.log('✅ All ingredients already exist in database!');
      return;
    }
    
    console.log('📋 First 20 missing ingredients:');
    missingIngredients.slice(0, 20).forEach((ing, i) => {
      console.log(`${i + 1}. "${ing.name}"${ing.inci ? ` (${ing.inci})` : ''}`);
    });
    
    console.log('\n🚀 Starting import...\n');
    
    // Import missing ingredients in batches
    const batchSize = 50;
    let imported = 0;
    
    for (let i = 0; i < missingIngredients.length; i += batchSize) {
      const batch = missingIngredients.slice(i, i + batchSize);
      
      await client.query('BEGIN');
      
      for (const ingredient of batch) {
        try {
          await client.query(`
            INSERT INTO ingredients (name, created_date)
            VALUES ($1, CURRENT_TIMESTAMP)
            ON CONFLICT (name) DO NOTHING
          `, [ingredient.name]);
          
          imported++;
          
          if (imported % 10 === 0) {
            console.log(`✅ Imported ${imported}/${missingIngredients.length} ingredients...`);
          }
          
        } catch (error) {
          console.log(`❌ Error importing "${ingredient.name}": ${error.message}`);
        }
      }
      
      await client.query('COMMIT');
    }
    
    console.log(`\n🎉 Successfully imported ${imported} new ingredients!`);
    
    // Verify final count
    const finalResult = await client.query('SELECT COUNT(*) as count FROM ingredients');
    console.log(`📊 Total ingredients in database: ${finalResult.rows[0].count}`);
    
    // Save import summary
    const summary = {
      beforeImport: existingNames.size,
      excelIngredients: excelIngredients.length,
      newIngredients: missingIngredients.length,
      imported: imported,
      afterImport: parseInt(finalResult.rows[0].count),
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync('ingredient-import-summary.json', JSON.stringify(summary, null, 2));
    console.log(`💾 Saved import summary to: ingredient-import-summary.json`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Fatal error:', error);
  } finally {
    client.release();
    await localPool.end();
  }
}

importMissingIngredients();