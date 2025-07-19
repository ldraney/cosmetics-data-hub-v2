const XLSX = require('xlsx');
const { Pool } = require('pg');
const fs = require('fs');

const localPool = new Pool({
  connectionString: 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

async function importAllMissingFormulas() {
  const client = await localPool.connect();
  
  try {
    console.log('🔍 Identifying missing formulas...\n');
    
    // Get existing formula names from database
    const existingFormulas = await client.query('SELECT name FROM formulas ORDER BY name');
    const existingNames = new Set(existingFormulas.rows.map(row => row.name.toLowerCase().trim()));
    
    console.log(`📊 Database has ${existingNames.size} existing formulas\n`);
    
    // Read Excel sheet 1 to get all available formulas
    const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
    const trackingSheet = workbook.Sheets['finalization tracking'];
    const trackingData = XLSX.utils.sheet_to_json(trackingSheet, {header: 1});
    
    const missingFormulas = [];
    
    // Parse Excel formulas (starting from row 8, index 7)
    for (let i = 7; i < trackingData.length; i++) {
      const row = trackingData[i] || [];
      if (row[0] && row[0].toString().match(/^\(\d+\)/)) {
        const formulaName = row[0].toString().trim();
        const productName = formulaName.replace(/^\(\d+\)\s*/, '').trim();
        
        // Skip duplicates and deletes mentioned in Excel
        if (productName.includes('REPEAT') || productName.includes('DELETE') || 
            productName.includes('DUPLICATE') || productName.includes('REMOVE')) {
          continue;
        }
        
        // Check if this formula exists in database
        const exists = Array.from(existingNames).some(dbName => 
          dbName.includes(productName.toLowerCase()) || 
          productName.toLowerCase().includes(dbName)
        );
        
        if (!exists) {
          // Find corresponding sheet
          const sheetName = workbook.SheetNames.find(name => 
            name.includes(formulaName.split(' ')[0]) || 
            name.toLowerCase().includes(productName.toLowerCase().split(' ')[0])
          );
          
          if (sheetName) {
            missingFormulas.push({
              excelName: formulaName,
              productName: productName,
              sheetName: sheetName
            });
          }
        }
      }
    }
    
    console.log(`🆕 Found ${missingFormulas.length} missing formulas to import:\\n`);
    
    let imported = 0;
    let failed = 0;
    
    for (const formula of missingFormulas.slice(0, 10)) { // Start with first 10
      try {
        console.log(`🔄 Importing: ${formula.productName}...`);
        
        // Read formula sheet
        const sheet = workbook.Sheets[formula.sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
        
        // Extract product name from sheet
        let productName = formula.productName;
        for (let i = 0; i < 5; i++) {
          const row = data[i] || [];
          if (row[0] && row[0].toString().toLowerCase().includes('product name') && row[1]) {
            productName = row[1].toString().trim();
            break;
          }
        }
        
        // Insert formula
        await client.query('BEGIN');
        
        const formulaResult = await client.query(`
          INSERT INTO formulas (name, status, created_date)
          VALUES ($1, 'approved', CURRENT_TIMESTAMP)
          RETURNING id
        `, [productName]);
        
        const formulaId = formulaResult.rows[0].id;
        
        // Find ingredients section
        let startRow = -1;
        for (let i = 0; i < 15; i++) {
          const row = data[i] || [];
          if (row[1] && row[1].toString().toLowerCase().includes('ingredients')) {
            startRow = i + 1;
            break;
          }
        }
        
        if (startRow === -1) {
          throw new Error('No ingredients section found');
        }
        
        // Extract and insert ingredients
        let ingredientCount = 0;
        let totalPercentage = 0;
        
        for (let i = startRow; i < Math.min(startRow + 30, data.length); i++) {
          const row = data[i] || [];
          const ingredientName = row[1] ? row[1].toString().trim() : '';
          const percentage = row[4];
          
          if (ingredientName && 
              typeof percentage === 'number' && 
              percentage > 0 && 
              percentage <= 100 &&
              !ingredientName.toLowerCase().includes('combine') &&
              !ingredientName.toLowerCase().includes('add') &&
              !ingredientName.toLowerCase().includes('heat') &&
              !ingredientName.toLowerCase().includes('procedure') &&
              ingredientName.length > 2) {
            
            // Find ingredient in database
            const ingredientResult = await client.query(`
              SELECT id FROM ingredients WHERE name = $1
            `, [ingredientName]);
            
            if (ingredientResult.rows.length > 0) {
              const ingredientId = ingredientResult.rows[0].id;
              
              await client.query(`
                INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage, created_date)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
              `, [formulaId, ingredientId, percentage]);
              
              ingredientCount++;
              totalPercentage += percentage;
            } else {
              console.log(`  ⚠️  Ingredient not found: "${ingredientName}"`);
            }
          }
          
          // Stop if we hit procedure section
          if (ingredientName.toLowerCase().includes('procedure') ||
              ingredientName.toLowerCase().includes('combine') ||
              (row.length === 0 && i > startRow + 5)) {
            break;
          }
        }
        
        await client.query('COMMIT');
        
        console.log(`  ✅ Imported: ${ingredientCount} ingredients, ${totalPercentage.toFixed(2)}% total`);
        imported++;
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.log(`  ❌ Failed to import ${formula.productName}: ${error.message}`);
        failed++;
      }
    }
    
    console.log(`\\n🎉 Import Summary:`);
    console.log(`✅ Successfully imported: ${imported} formulas`);
    console.log(`❌ Failed: ${failed} formulas`);
    
    // Final count
    const finalCount = await client.query('SELECT COUNT(*) as count FROM formulas');
    console.log(`📊 Total formulas in database: ${finalCount.rows[0].count}`);
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Fatal error:', error);
  } finally {
    client.release();
    await localPool.end();
  }
}

importAllMissingFormulas();