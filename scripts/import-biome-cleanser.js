const XLSX = require('xlsx');
const { Pool } = require('pg');

const localPool = new Pool({
  connectionString: 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

async function importBiomeCleanser() {
  const client = await localPool.connect();
  
  try {
    // Read Excel sheet for Biome Restoration Cream Cleanser
    const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
    const sheet = workbook.Sheets['(2) Biome Restoration Cream Cle'];
    const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
    
    console.log('Biome Restoration Cream Cleanser - First 30 rows:\n');
    for (let i = 0; i < Math.min(30, data.length); i++) {
      const row = data[i] || [];
      if (row.length > 0) {
        console.log(`Row ${i + 1}: ${row.slice(0, 6).map(cell => cell || '').join(' | ')}`);
      }
    }
    
    // Extract basic info for import
    const productName = data[0] ? data[0][1] : 'Biome Restoration Cream Cleanser';
    console.log(`\nProduct name: ${productName}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    client.release();
    await localPool.end();
  }
}

importBiomeCleanser();