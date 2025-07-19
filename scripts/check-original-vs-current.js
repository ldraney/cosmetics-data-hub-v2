const XLSX = require('xlsx');
const { Pool } = require('pg');

const localPool = new Pool({
  connectionString: 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

async function compareFormulaData() {
  const client = await localPool.connect();
  
  try {
    // Let's check "Aloe Vera Gel" - compare Excel vs Database
    console.log('=== ALOE VERA GEL COMPARISON ===\n');
    
    // Get from Excel
    const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
    const sheet = workbook.Sheets['(53)Aloe Vera Gel PEL-AVG-001'];
    const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
    
    console.log('EXCEL DATA:');
    for (let i = 7; i < 18; i++) { // Ingredient rows
      const row = data[i] || [];
      if (row.length > 0 && row[0] && row[3]) {
        console.log(`${row[0]}: ${row[3]}%`);
      }
    }
    
    // Get from Database
    const dbData = await client.query(`
      SELECT i.name, fi.percentage
      FROM formula_ingredients fi
      JOIN ingredients i ON fi.ingredient_id = i.id
      JOIN formulas f ON fi.formula_id = f.id
      WHERE f.name ILIKE '%aloe%vera%gel%'
      ORDER BY fi.percentage DESC
    `);
    
    console.log('\nDATABASE DATA:');
    dbData.rows.forEach(row => {
      console.log(`${row.name}: ${row.percentage}%`);
    });
    
    const dbTotal = dbData.rows.reduce((sum, row) => sum + parseFloat(row.percentage), 0);
    console.log(`\nDatabase total: ${dbTotal.toFixed(2)}%`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await localPool.end();
  }
}

compareFormulaData();