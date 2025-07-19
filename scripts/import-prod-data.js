// Import production data script
const fs = require('fs');
const { Pool } = require('pg');

async function importData(filename) {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
  });

  try {
    // Read the exported data
    const dataStr = fs.readFileSync(filename || 'prod-data-export-2025-07-18.json', 'utf8');
    const data = JSON.parse(dataStr);
    
    console.log(`📁 Importing data from: ${filename || 'prod-data-export-2025-07-18.json'}`);
    console.log(`📅 Export timestamp: ${data.timestamp}\n`);
    
    const client = await pool.connect();
    
    try {
      // Start transaction
      await client.query('BEGIN');
      
      // Clear existing data
      console.log('🗑️  Clearing existing data...');
      await client.query('DELETE FROM formula_ingredients');
      await client.query('DELETE FROM formulas');
      await client.query('DELETE FROM ingredients');
      
      // Reset sequences
      await client.query("SELECT setval('formulas_id_seq', 1, false)");
      await client.query("SELECT setval('ingredients_id_seq', 1, false)");
      await client.query("SELECT setval('formula_ingredients_id_seq', 1, false)");
      
      // Import ingredients
      console.log(`📦 Importing ${data.ingredients.length} ingredients...`);
      for (const ingredient of data.ingredients) {
        await client.query(`
          INSERT INTO ingredients (id, name, inci_name, supplier_code, category, created_date)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          ingredient.id,
          ingredient.name,
          ingredient.inci_name,
          ingredient.supplier_code,
          ingredient.category,
          ingredient.created_date
        ]);
      }
      
      // Import formulas
      console.log(`🧪 Importing ${data.formulas.length} formulas...`);
      for (const formula of data.formulas) {
        await client.query(`
          INSERT INTO formulas (id, name, version, status, review_reasons, created_date, updated_date)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
        `, [
          formula.id,
          formula.name,
          formula.version,
          formula.status,
          formula.review_reasons,
          formula.created_date,
          formula.updated_date
        ]);
      }
      
      // Import formula_ingredients
      console.log(`🔗 Importing ${data.formula_ingredients.length} formula-ingredient relationships...`);
      for (const fi of data.formula_ingredients) {
        await client.query(`
          INSERT INTO formula_ingredients (id, formula_id, ingredient_id, percentage, created_date)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          fi.id,
          fi.formula_id,
          fi.ingredient_id,
          fi.percentage,
          fi.created_date
        ]);
      }
      
      // Update sequences to continue from imported IDs
      await client.query("SELECT setval('formulas_id_seq', (SELECT MAX(id) FROM formulas))");
      await client.query("SELECT setval('ingredients_id_seq', (SELECT MAX(id) FROM ingredients))");
      await client.query("SELECT setval('formula_ingredients_id_seq', (SELECT MAX(id) FROM formula_ingredients))");
      
      // Commit transaction
      await client.query('COMMIT');
      
      console.log('\n✅ Import completed successfully!');
      
      // Verify counts
      const formulaCount = await client.query('SELECT COUNT(*) FROM formulas');
      const ingredientCount = await client.query('SELECT COUNT(*) FROM ingredients');
      const fiCount = await client.query('SELECT COUNT(*) FROM formula_ingredients');
      
      console.log(`\n📊 Database now contains:`);
      console.log(`   - ${formulaCount.rows[0].count} formulas`);
      console.log(`   - ${ingredientCount.rows[0].count} ingredients`);
      console.log(`   - ${fiCount.rows[0].count} formula-ingredient relationships`);
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('❌ Import error:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

if (require.main === module) {
  const filename = process.argv[2];
  importData(filename);
}

module.exports = { importData };