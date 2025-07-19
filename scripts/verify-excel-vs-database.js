const XLSX = require('xlsx');
const { Pool } = require('pg');

const localPool = new Pool({
  connectionString: 'postgres://earthharbor@localhost:5432/cosmetics_data_hub_v2_local',
});

async function verifyExcelVsDatabase() {
  const client = await localPool.connect();
  
  try {
    console.log('🔍 EXCEL VS DATABASE VERIFICATION\n');
    console.log('='.repeat(50));
    
    const workbook = XLSX.readFile(process.env.HOME + '/Downloads/Pure Earth Labs Finalized Formula.xlsx');
    
    // Get 5 random formulas from database for spot checking
    const randomFormulas = await client.query(`
      SELECT id, name 
      FROM formulas 
      ORDER BY RANDOM() 
      LIMIT 5
    `);
    
    let totalChecked = 0;
    let accurateFormulas = 0;
    
    for (const formula of randomFormulas.rows) {
      console.log(`\n📋 Checking: ${formula.name}`);
      console.log('-'.repeat(40));
      
      // Get database data
      const dbData = await client.query(`
        SELECT i.name, fi.percentage
        FROM formula_ingredients fi
        JOIN ingredients i ON fi.ingredient_id = i.id
        WHERE fi.formula_id = $1
        ORDER BY fi.percentage DESC
      `, [formula.id]);
      
      const dbTotal = dbData.rows.reduce((sum, row) => sum + parseFloat(row.percentage), 0);
      const dbIngredientCount = dbData.rows.length;
      
      console.log(`DATABASE: ${dbIngredientCount} ingredients, ${dbTotal.toFixed(2)}% total`);
      
      // Find corresponding Excel sheet (best effort matching)
      const possibleSheets = workbook.SheetNames.filter(name => 
        name.toLowerCase().includes(formula.name.toLowerCase().split(' ')[0]) ||
        formula.name.toLowerCase().includes(name.toLowerCase().split(' ')[1] || '')
      );
      
      if (possibleSheets.length > 0) {
        const excelSheet = workbook.Sheets[possibleSheets[0]];
        const excelData = XLSX.utils.sheet_to_json(excelSheet, {header: 1});
        
        // Extract Excel ingredients
        let excelIngredients = 0;
        let excelTotal = 0;
        let startRow = -1;
        
        // Find ingredients section
        for (let i = 0; i < 15; i++) {
          const row = excelData[i] || [];
          if (row[1] && row[1].toString().toLowerCase().includes('ingredients')) {
            startRow = i + 1;
            break;
          }
        }
        
        if (startRow !== -1) {
          for (let i = startRow; i < Math.min(startRow + 30, excelData.length); i++) {
            const row = excelData[i] || [];
            const ingredientName = row[1] ? row[1].toString().trim() : '';
            const percentage = row[4];
            
            if (ingredientName && 
                typeof percentage === 'number' && 
                percentage > 0 && 
                percentage <= 100 &&
                !ingredientName.toLowerCase().includes('combine') &&
                !ingredientName.toLowerCase().includes('procedure') &&
                ingredientName.length > 2) {
              
              excelIngredients++;
              excelTotal += percentage;
            }
            
            if (ingredientName.toLowerCase().includes('procedure')) break;
          }
        }
        
        console.log(`EXCEL:    ${excelIngredients} ingredients, ${excelTotal.toFixed(2)}% total`);
        console.log(`SHEET:    ${possibleSheets[0]}`);
        
        // Assess accuracy
        const ingredientDiff = Math.abs(dbIngredientCount - excelIngredients);
        const percentageDiff = Math.abs(dbTotal - excelTotal);
        
        if (ingredientDiff <= 2 && percentageDiff <= 5) {
          console.log('✅ MATCH: Formula appears accurate');
          accurateFormulas++;
        } else {
          console.log('❌ MISMATCH: Significant differences detected');
          console.log(`   Ingredient difference: ${ingredientDiff}`);
          console.log(`   Percentage difference: ${percentageDiff.toFixed(2)}%`);
        }
        
      } else {
        console.log('⚠️  Excel sheet not found for comparison');
      }
      
      totalChecked++;
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('📊 VERIFICATION SUMMARY');
    console.log('='.repeat(50));
    console.log(`Formulas checked: ${totalChecked}`);
    console.log(`Accurate formulas: ${accurateFormulas}`);
    console.log(`Accuracy rate: ${((accurateFormulas / totalChecked) * 100).toFixed(1)}%`);
    
    if (accurateFormulas === totalChecked) {
      console.log('🎉 ALL FORMULAS PASSED VERIFICATION!');
    } else {
      console.log('⚠️  Some formulas may need review');
    }
    
    // Additional database-wide checks
    console.log('\n📈 DATABASE-WIDE STATISTICS');
    console.log('-'.repeat(30));
    
    const stats = await client.query(`
      SELECT 
        COUNT(*) as total_formulas,
        COUNT(CASE WHEN EXISTS (
          SELECT 1 FROM formula_ingredients fi 
          WHERE fi.formula_id = f.id 
          GROUP BY fi.formula_id 
          HAVING SUM(fi.percentage) BETWEEN 95 AND 105
        ) THEN 1 END) as well_balanced,
        ROUND(AVG((
          SELECT SUM(fi.percentage) 
          FROM formula_ingredients fi 
          WHERE fi.formula_id = f.id
        ))::numeric, 2) as avg_percentage
      FROM formulas f
    `);
    
    const stat = stats.rows[0];
    console.log(`Total formulas: ${stat.total_formulas}`);
    console.log(`Well-balanced (95-105%): ${stat.well_balanced}`);
    console.log(`Average percentage: ${stat.avg_percentage}%`);
    console.log(`Overall health: ${((stat.well_balanced / stat.total_formulas) * 100).toFixed(1)}%`);
    
  } catch (error) {
    console.error('❌ Verification error:', error);
  } finally {
    client.release();
    await localPool.end();
  }
}

verifyExcelVsDatabase();