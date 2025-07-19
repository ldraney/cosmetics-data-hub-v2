const XLSX = require('xlsx');
const { Pool } = require('pg');

const localPool = new Pool({
  connectionString: 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

// List of remaining formulas to import (based on our earlier analysis)
const remainingFormulas = [
  '(16) Everyday Day Moisturizer PEL-MDM-001',
  '(17) Feather Light Day Moisturizer PEL-LDM-001', 
  '(18) Regenerative Moisturizer',
  '(19) Light EcoGentle Moisturizer AA-006',
  '(20) Baby Barrier Balm Cream Balm-V2-015 w/out campo and scent',
  '(28) Wholesome Cacao Vitamin C Mask CMP-003',
  '(32)Hydrating Body Serum HYA-004-04',
  '(47)Peptide Serum Pep-001',
  '(73)Hair Regrowth Treatment',
  '(76)AbAmerica - Tallow Body Butter - HGL-TBB-001',
  '(78) BHA Cleansing Gel',
  '(79) Lip Mask',
  '(82) roll-on deodorant',
  '(83) Himalayan Salt Scrub',
  '(84) Liquid Hand Soap',
  '(85) Hand and Body Lotion',
  '(86) Brikell Multi-Enzyme Glyce',
  '(87) Mineralizing Glow Mist',
  '(88) Charcoal Clay Face Mask'
];

async function importRemainingFormulas() {
  const client = await localPool.connect();
  
  try {
    console.log(`🚀 Importing remaining ${remainingFormulas.length} formulas...\\n`);
    
    const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
    
    let imported = 0;
    let failed = 0;
    
    for (const formulaIdentifier of remainingFormulas) {
      try {
        // Find the corresponding sheet
        const sheetName = workbook.SheetNames.find(name => 
          name.includes(formulaIdentifier.split(' ')[0]) || 
          name.toLowerCase().includes(formulaIdentifier.toLowerCase())
        );
        
        if (!sheetName) {
          console.log(`❌ Sheet not found for: ${formulaIdentifier}`);
          failed++;
          continue;
        }
        
        console.log(`🔄 Importing from sheet: ${sheetName}...`);
        
        const sheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
        
        // Extract product name from sheet
        let productName = formulaIdentifier.replace(/^\(\d+\)\s*/, '').trim();
        for (let i = 0; i < 5; i++) {
          const row = data[i] || [];
          if (row[0] && row[0].toString().toLowerCase().includes('product name') && row[1]) {
            productName = row[1].toString().trim();
            break;
          }
        }
        
        // Check if formula already exists
        const existingCheck = await client.query('SELECT id FROM formulas WHERE name = $1', [productName]);
        if (existingCheck.rows.length > 0) {
          console.log(`  ⚠️  Formula already exists: ${productName}`);
          continue;
        }
        
        await client.query('BEGIN');
        
        // Insert formula
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
        
        for (let i = startRow; i < Math.min(startRow + 40, data.length); i++) {
          const row = data[i] || [];
          const ingredientName = row[1] ? row[1].toString().trim() : '';
          let percentage = row[4];
          
          // Handle percentage in different columns or formats
          if (!percentage || typeof percentage !== 'number') {
            percentage = row[3]; // Try column 3
          }
          if (!percentage || typeof percentage !== 'number') {
            percentage = row[5]; // Try column 5
          }
          
          if (ingredientName && 
              typeof percentage === 'number' && 
              percentage > 0 && 
              percentage <= 100 &&
              !ingredientName.toLowerCase().includes('combine') &&
              !ingredientName.toLowerCase().includes('add') &&
              !ingredientName.toLowerCase().includes('heat') &&
              !ingredientName.toLowerCase().includes('procedure') &&
              !ingredientName.toLowerCase().includes('total') &&
              ingredientName.length > 2) {
            
            // Find exact ingredient match first
            let ingredientResult = await client.query(`
              SELECT id FROM ingredients WHERE name = $1
            `, [ingredientName]);
            
            // If not found, try fuzzy matching
            if (ingredientResult.rows.length === 0) {
              ingredientResult = await client.query(`
                SELECT id FROM ingredients WHERE name ILIKE $1 LIMIT 1
              `, [`%${ingredientName.split(' ')[0]}%`]);
            }
            
            if (ingredientResult.rows.length > 0) {
              const ingredientId = ingredientResult.rows[0].id;
              
              await client.query(`
                INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage, created_date)
                VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
              `, [formulaId, ingredientId, percentage]);
              
              ingredientCount++;
              totalPercentage += percentage;
            } else {
              console.log(`    ⚠️  Ingredient not found: "${ingredientName}"`);
            }
          }
          
          // Stop at procedure section
          if (ingredientName.toLowerCase().includes('procedure') ||
              ingredientName.toLowerCase().includes('coa') ||
              (row.length === 0 && i > startRow + 10)) {
            break;
          }
        }
        
        await client.query('COMMIT');
        
        console.log(`    ✅ ${productName}: ${ingredientCount} ingredients, ${totalPercentage.toFixed(2)}% total`);
        imported++;
        
      } catch (error) {
        await client.query('ROLLBACK');
        console.log(`    ❌ Failed: ${error.message}`);
        failed++;
      }
    }
    
    console.log(`\\n🎉 BATCH IMPORT COMPLETE!`);
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

importRemainingFormulas();