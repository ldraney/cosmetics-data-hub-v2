// Create prioritized list of formulas needing percentage fixes
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

async function prioritizePercentageFixes() {
  const client = await pool.connect();
  
  try {
    console.log('🎯 Creating prioritized list of percentage fixes needed...\n');
    
    const result = await client.query(`
      SELECT 
        f.id,
        f.name,
        ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
        COUNT(fi.id) as ingredient_count,
        f.status,
        f.review_reasons
      FROM formulas f
      LEFT JOIN formula_ingredients fi ON f.id = fi.formula_id
      GROUP BY f.id, f.name, f.status, f.review_reasons
      ORDER BY 
        CASE 
          WHEN SUM(fi.percentage) > 200 THEN 1  -- Extreme overages first
          WHEN SUM(fi.percentage) < 95 THEN 2   -- Significant underages
          WHEN SUM(fi.percentage) > 105 THEN 3  -- Moderate overages
          ELSE 4                                -- Close to 100%
        END,
        ABS(100 - SUM(fi.percentage)) DESC      -- Then by how far from 100%
    `);
    
    console.log('📊 PRIORITIZED PERCENTAGE FIXES:');
    console.log('=================================\n');
    
    const priorities = {
      critical: [],
      high: [],
      medium: [],
      low: []
    };
    
    result.rows.forEach((formula, index) => {
      const total = parseFloat(formula.total_percentage) || 0;
      const diff = Math.abs(100 - total);
      
      let priority;
      if (total > 200) {
        priority = 'critical';
      } else if (total < 95 || total > 110) {
        priority = 'high';
      } else if (diff > 2) {
        priority = 'medium';
      } else {
        priority = 'low';
      }
      
      priorities[priority].push({
        rank: index + 1,
        id: formula.id,
        name: formula.name,
        total: total,
        diff: diff,
        ingredientCount: formula.ingredient_count,
        status: formula.status
      });
    });
    
    // Display by priority
    Object.entries(priorities).forEach(([level, formulas]) => {
      if (formulas.length === 0) return;
      
      const emoji = {
        critical: '🚨',
        high: '⚠️',
        medium: '🔶',
        low: '✅'
      };
      
      console.log(`${emoji[level]} ${level.toUpperCase()} PRIORITY (${formulas.length} formulas):`);
      console.log('----------------------------------------');
      
      formulas.slice(0, level === 'critical' ? 10 : 5).forEach(f => {
        console.log(`${f.rank}. ${f.name} (ID: ${f.id})`);
        console.log(`   Total: ${f.total}% | Diff: ${f.diff.toFixed(2)}% | Ingredients: ${f.ingredientCount}`);
        console.log('');
      });
      
      if (formulas.length > (level === 'critical' ? 10 : 5)) {
        console.log(`   ... and ${formulas.length - (level === 'critical' ? 10 : 5)} more\n`);
      }
    });
    
    // Create fix command list
    console.log('🛠️  SUGGESTED FIX ORDER:');
    console.log('========================');
    console.log('Run these commands to fix the most critical formulas:\n');
    
    const criticalAndHigh = [...priorities.critical, ...priorities.high].slice(0, 10);
    criticalAndHigh.forEach(f => {
      console.log(`node scripts/interactive-formula-review.js --formula-id ${f.id}  # ${f.name} (${f.total}%)`);
    });
    
    console.log('\n💡 TIP: Start with the critical priority formulas first!');
    console.log('Each fix will require you to update percentages manually based on Excel data.');
    
  } finally {
    client.release();
    await pool.end();
  }
}

if (require.main === module) {
  prioritizePercentageFixes();
}

module.exports = { prioritizePercentageFixes };