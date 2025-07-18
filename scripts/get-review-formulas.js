// Simple script to get formulas needing review
const { Pool } = require('pg');

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/cosmetics_db',
});

async function getReviewFormulas() {
  try {
    console.log('🔍 Fetching formulas that need review...\n');
    
    // Get all formulas with ingredients and calculate issues
    const result = await pool.query(`
      SELECT 
        f.id,
        f.name,
        f.version,
        f.status,
        f.review_reasons,
        COALESCE(
          json_agg(
            json_build_object(
              'ingredient_name', i.name,
              'percentage', fi.percentage
            ) ORDER BY fi.percentage DESC
          ) FILTER (WHERE i.id IS NOT NULL),
          '[]'
        ) as ingredients
      FROM formulas f
      LEFT JOIN formula_ingredients fi ON f.id = fi.formula_id
      LEFT JOIN ingredients i ON fi.ingredient_id = i.id
      GROUP BY f.id, f.name, f.version, f.status, f.review_reasons
      ORDER BY f.name
    `);

    if (result.rows.length === 0) {
      console.log('❌ No formulas found in database');
      return;
    }

    console.log(`📊 Found ${result.rows.length} total formulas`);

    // Process each formula to identify issues
    const formulasWithIssues = [];
    
    for (const formula of result.rows) {
      const ingredients = formula.ingredients;
      const totalPercentage = ingredients.reduce((sum, ing) => sum + parseFloat(ing.percentage), 0);
      const issues = [];

      // Check total percentage
      if (totalPercentage < 99.5 || totalPercentage > 100.5) {
        issues.push(`Total percentage: ${totalPercentage.toFixed(2)}% (should be 99.5-100.5%)`);
      }

      // Check for duplicate ingredients
      const ingredientNames = ingredients.map(ing => ing.ingredient_name.toLowerCase());
      const duplicates = ingredientNames.filter((name, index) => 
        ingredientNames.indexOf(name) !== index
      );
      if (duplicates.length > 0) {
        issues.push(`Duplicate ingredients: ${[...new Set(duplicates)].join(', ')}`);
      }

      // Check for zero percentages
      const zeroPercentages = ingredients.filter(ing => parseFloat(ing.percentage) === 0);
      if (zeroPercentages.length > 0) {
        issues.push(`Zero percentage ingredients: ${zeroPercentages.map(ing => ing.ingredient_name).join(', ')}`);
      }

      if (issues.length > 0 || formula.status === 'needs_review') {
        formulasWithIssues.push({
          ...formula,
          calculated_issues: issues,
          total_percentage: totalPercentage,
          needs_review: true
        });
      }
    }

    if (formulasWithIssues.length === 0) {
      console.log('\n🎉 No formulas need review!');
      return;
    }

    console.log(`\n📋 ${formulasWithIssues.length} formulas need review:\n`);
    
    formulasWithIssues.forEach((formula, index) => {
      console.log(`${index + 1}. ${formula.name} (v${formula.version})`);
      console.log(`   ID: ${formula.id}`);
      console.log(`   Status: ${formula.status}`);
      console.log(`   Total: ${formula.total_percentage?.toFixed(2)}%`);
      console.log(`   Issues:`);
      formula.calculated_issues?.forEach(issue => {
        console.log(`     • ${issue}`);
      });
      if (formula.review_reasons && formula.review_reasons.length > 0) {
        console.log(`   Stored reasons:`);
        formula.review_reasons.forEach(reason => {
          console.log(`     • ${reason}`);
        });
      }
      console.log('');
    });
    
    return formulasWithIssues;
    
  } catch (error) {
    console.error('❌ Database error:', error.message);
    console.log('\n💡 Make sure your database is running and DATABASE_URL is set correctly');
  } finally {
    await pool.end();
  }
}

// If running directly
if (require.main === module) {
  getReviewFormulas();
}

module.exports = { getReviewFormulas };