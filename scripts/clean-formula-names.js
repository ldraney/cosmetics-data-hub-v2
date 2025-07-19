// Script to clean up formula names based on Excel master list
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

// Mapping from current database names to clean Excel names
const nameMapping = {
  'Fortifying Cream Cleanser': 'Fortifying Cream Cleanser',
  'All-Skin Cleansing Oil': 'All-Skin Cleansing Oil',
  'Soothing Face Oil': 'Soothing Face Oil',
  'Anti-Aging Face Oil': 'Anti-Aging Face Oil',
  'Caffeine Eye Cream': 'Caffeine Eye Cream',
  'Body Wash': 'Body Wash',
  'Conditioning Gel Cleanser': 'Gel Cleanser',
  'Milky Cleanser- change to Vitamin Rich Soothing Milky Cleanser OR Ultra mild fortifying cleanser': 'Milky Cleanser',
  'Simple Multi-purpose Gel Cleanser': 'Foaming Gel Cleanser',
  'Face Scrub': 'Face Scrub',
  'Spirulina Cream Mask': 'Spirulina Cream Mask',
  'Baby Body Lotion/ EveryAge': 'Baby Body Lotion/ EveryAge',
  'Nurturing Balm Cream': 'Nurturing Balm Cream',
  'Marine-Love Refining Mask': 'Marine-Love Refining Mask',
  'Nurturing and Hydrating Serum': 'Nurturing Hydra-Plumping Serum',
  'Black Sand Detox Scrub': 'Black Sand Detox Scrub',
  '(35)Himalayan Sea Salt Body Scrub': 'Coconut Sugar Scrub',
  'Balancing Gel Hydrator': 'Balancing Gel Hydrator',
  'Pore Minimizing Cream with 5% Niacinamide': 'Pore minimizing cream with 5% niacinamide',
  'Ethical Mask & Spot Treatment': 'Ethical Mask & Spot Treatment',
  'Detangler Spray Conditioner': 'Detangler Spray Conditioner',
  'ALOE AND SNOW MUSHROOM HAND CREAM Hand Cream': 'AllSkin Hand Cream',
  'Hydration Moisturizer (for face)': 'Hydration Moisturizer',
  'Replenish Body Oil': 'Replenish Body Oil',
  'Phyto-Renew Night Serum': 'Phyto-Renew Night Serum',
  '2-in-1 Baby Body Wash/Shampoo': '2-in-1 Baby Body Wash/Shampoo',
  'Support & Clarity Serum': 'Support & Clarity Serum',
  'Niacinamide Serum': 'Niacinamide Serum',
  'Baby Bubble Bath': 'Baby Bubble Bath',
  'Foaming Hand Wash': 'Foaming Hand Wash',
  'Hyaluronic Acid Serum': 'Hyaluronic Acid Serum',
  'Aloe Vera Gel': 'Aloe Vera Gel',
  'Eco-Pure Moisturizer': 'Eco-Pure Moisturizer',
  'Aloe Vera Spray': 'Aloe Vera Spray',
  '(Needs new name for Lip Balm)': '(Needs new name for Lip Balm)',
  'BarrierBoost Ceramide Serum': 'BarrierBoost Ceramide Serum',
  'Cream Mask': 'Clay Mask',
  'Body Cream': 'Body Cream',
  'Face Balm': 'Blue Tansy Face Balm',
  'Hydrating Serum': 'Hydrating Serum',
  'Night Moisturizer': 'Night Moisturizer',
  'Hair Texturizing Salt Spray': 'Hair Texturizing Salt Spray',
  'Anti-Pollution Serum': 'Anti-Pollution Serum',
  'Wholesome Detox Reset Serum': 'Wholesome Detox Reset Serum',
  'Plant-Powered Hair Finishing Oil': 'Plant-Powered Hair Finishing Oil',
  'Superfruit Radiance Balm': 'Superfruit Radiance Balm',
  'Plant-Based Gel Cleanser': 'Plant-Based Gel Cleanser',
  'Nurturing Sea-Retinol Serum': 'Nurturing Sea-Retinol Serum',
  'One-for-All Skin Hydration Cream- WITH stable vitamin C': 'One-for-All Skin Hydration Cream',
  'Body Lotion': 'Body Lotion',
  'Vitamin C Oil Serum': 'Vitamin C Oil Serum',
  'Bees Wax Lip Balm': 'Bees Wax Lip Balm',
  'DeodorantRollOn': 'Roll-on Deodorant',
  'Coconut Sugar Scrub': 'Coconut Sugar Scrub',
  'Hand and Body Lotion': 'Hand and Body Lotion',
  'Brikell Multi-Enzyme Glycerin Extract': 'Brikell Multi-Enzyme Glycerin Extract',
  'Charcoal Clay Face Mask': 'Charcoal Clay Face Mask'
};

async function cleanFormulaNames() {
  const client = await pool.connect();
  
  try {
    console.log('🧹 Starting formula name cleanup...\n');
    
    // Start transaction
    await client.query('BEGIN');
    
    let updatedCount = 0;
    let notFoundCount = 0;
    const notFoundNames = [];
    
    // Get all formulas
    const result = await client.query('SELECT id, name FROM formulas ORDER BY id');
    
    for (const formula of result.rows) {
      const cleanName = nameMapping[formula.name];
      
      if (cleanName && cleanName !== formula.name) {
        console.log(`✨ Updating: "${formula.name}" → "${cleanName}"`);
        await client.query(
          'UPDATE formulas SET name = $1 WHERE id = $2',
          [cleanName, formula.id]
        );
        updatedCount++;
      } else if (!cleanName) {
        notFoundNames.push(formula.name);
        notFoundCount++;
      }
    }
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log(`\n✅ Updated ${updatedCount} formula names`);
    
    if (notFoundCount > 0) {
      console.log(`\n⚠️  ${notFoundCount} formulas not found in mapping:`);
      notFoundNames.forEach(name => console.log(`   - ${name}`));
    }
    
    // Show current formula names
    console.log('\n📋 Current formula names in database:');
    const currentFormulas = await client.query('SELECT id, name FROM formulas ORDER BY id LIMIT 20');
    currentFormulas.rows.forEach(f => {
      console.log(`   ${f.id}. ${f.name}`);
    });
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error:', error);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  cleanFormulaNames();
}

module.exports = { cleanFormulaNames };