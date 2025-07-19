const XLSX = require('xlsx');
const { Pool } = require('pg');

const localPool = new Pool({
  connectionString: 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

async function identifyMissingFormulas() {
  const client = await localPool.connect();
  
  try {
    // Get existing formula names from database
    const existingFormulas = await client.query('SELECT name FROM formulas ORDER BY name');
    const existingNames = new Set(existingFormulas.rows.map(row => row.name.toLowerCase().trim()));
    
    console.log(`Database has ${existingNames.size} formulas\n`);
    
    // Read Excel sheet 1 to get all available formulas
    const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
    const sheet = workbook.Sheets['finalization tracking'];
    const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
    
    const excelFormulas = [];
    let missingCount = 0;
    
    // Parse Excel formulas (starting from row 8, index 7)
    for (let i = 7; i < data.length; i++) {
      const row = data[i] || [];
      if (row[0] && row[0].toString().match(/^\(\d+\)/)) {
        const formulaName = row[0].toString().trim();
        const productName = formulaName.replace(/^\(\d+\)\s*/, '').trim();
        
        // Skip duplicates and deletes mentioned in Excel
        if (productName.includes('REPEAT') || productName.includes('DELETE') || 
            productName.includes('DUPLICATE') || productName.includes('REMOVE')) {
          continue;
        }
        
        excelFormulas.push(formulaName);
        
        // Check if this formula exists in database
        const exists = Array.from(existingNames).some(dbName => 
          dbName.includes(productName.toLowerCase()) || 
          productName.toLowerCase().includes(dbName)
        );
        
        if (!exists) {
          console.log(`MISSING: ${formulaName}`);
          missingCount++;
        }
      }
    }
    
    console.log(`\nEXCEL SUMMARY:`);
    console.log(`Total formulas in Excel: ${excelFormulas.length}`);
    console.log(`Missing from database: ${missingCount}`);
    console.log(`Database coverage: ${((excelFormulas.length - missingCount) / excelFormulas.length * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await localPool.end();
  }
}

identifyMissingFormulas();