import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Get all formulas with ingredients and check for review issues
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

    const formulasWithIssues = result.rows.map(formula => {
      const ingredients = JSON.parse(JSON.stringify(formula.ingredients));
      const totalPercentage = ingredients.reduce((sum: number, ing: any) => sum + parseFloat(ing.percentage), 0);
      const issues = [];

      // Check total percentage
      if (totalPercentage < 99.5 || totalPercentage > 100.5) {
        issues.push(`Total percentage: ${totalPercentage.toFixed(2)}% (should be 99.5-100.5%)`);
      }

      // Check for duplicate ingredients
      const ingredientNames = ingredients.map((ing: any) => ing.ingredient_name.toLowerCase());
      const duplicates = ingredientNames.filter((name: string, index: number) => 
        ingredientNames.indexOf(name) !== index
      );
      if (duplicates.length > 0) {
        issues.push(`Duplicate ingredients: ${[...new Set(duplicates)].join(', ')}`);
      }

      // Check for zero percentages
      const zeroPercentages = ingredients.filter((ing: any) => parseFloat(ing.percentage) === 0);
      if (zeroPercentages.length > 0) {
        issues.push(`Zero percentage ingredients: ${zeroPercentages.map((ing: any) => ing.ingredient_name).join(', ')}`);
      }

      return {
        ...formula,
        calculated_issues: issues,
        total_percentage: totalPercentage,
        needs_review: issues.length > 0
      };
    });

    return NextResponse.json(formulasWithIssues);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to analyze formulas' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, formula_ids } = await request.json();
    
    if (action === 'mark_for_review') {
      // Update formulas to needs_review status with calculated issues
      const result = await pool.query(`
        SELECT 
          f.id,
          f.name,
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
        WHERE f.id = ANY($1)
        GROUP BY f.id, f.name
      `, [formula_ids]);

      const updates = [];
      for (const formula of result.rows) {
        const ingredients = JSON.parse(JSON.stringify(formula.ingredients));
        const totalPercentage = ingredients.reduce((sum: number, ing: any) => sum + parseFloat(ing.percentage), 0);
        const issues = [];

        // Calculate issues
        if (totalPercentage < 99.5 || totalPercentage > 100.5) {
          issues.push(`Total percentage: ${totalPercentage.toFixed(2)}% (should be 99.5-100.5%)`);
        }

        const ingredientNames = ingredients.map((ing: any) => ing.ingredient_name.toLowerCase());
        const duplicates = ingredientNames.filter((name: string, index: number) => 
          ingredientNames.indexOf(name) !== index
        );
        if (duplicates.length > 0) {
          issues.push(`Duplicate ingredients: ${[...new Set(duplicates)].join(', ')}`);
        }

        const zeroPercentages = ingredients.filter((ing: any) => parseFloat(ing.percentage) === 0);
        if (zeroPercentages.length > 0) {
          issues.push(`Zero percentage ingredients: ${zeroPercentages.map((ing: any) => ing.ingredient_name).join(', ')}`);
        }

        if (issues.length > 0) {
          updates.push({
            id: formula.id,
            issues: issues
          });
        }
      }

      // Update formulas with issues
      for (const update of updates) {
        await pool.query(`
          UPDATE formulas 
          SET status = 'needs_review', 
              review_reasons = $1,
              updated_date = CURRENT_TIMESTAMP
          WHERE id = $2
        `, [update.issues, update.id]);
      }

      return NextResponse.json({ 
        message: `Updated ${updates.length} formulas for review`,
        updated_formulas: updates
      });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to update formulas' }, { status: 500 });
  }
}