const XLSX = require('xlsx');
const readline = require('readline');
const fs = require('fs');

const EXCEL_FILE_PATH = '/Users/earthharbor/Downloads/Pure Earth Labs Finalized Formula.xlsx';

class FastFormulaProcessor {
  constructor() {
    this.workbook = null;
    this.currentSheetIndex = 7; // Start from sheet 8 (index 7) since we did sheet 7
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.sqlStatements = [];
    this.processedFormulas = [];
  }

  async start() {
    try {
      console.log('⚡ Fast Formula Processor\n');
      console.log('Loading Excel file...');
      
      this.workbook = XLSX.readFile(EXCEL_FILE_PATH);
      
      // Load existing processing log
      if (fs.existsSync('formula-processing-log.md')) {
        console.log('📋 Loading previous progress...\n');
      }
      
      await this.processNextFormula();
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      this.rl.close();
    }
  }

  async processNextFormula() {
    if (this.currentSheetIndex >= this.workbook.SheetNames.length) {
      console.log('\n🎉 All formulas processed!');
      this.rl.close();
      return;
    }

    const sheetName = this.workbook.SheetNames[this.currentSheetIndex];
    const sheet = this.workbook.Sheets[sheetName];
    
    console.log(`\n${'='.repeat(60)}`);
    console.log(`📊 SHEET ${this.currentSheetIndex + 1}: ${sheetName}`);
    console.log(`${'='.repeat(60)}\n`);
    
    // Extract data
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    // Quick extraction
    const formula = await this.extractFormula(data, sheetName);
    
    if (formula) {
      // Show what we found
      console.log(`\n✅ EXTRACTED FORMULA: ${formula.name}`);
      console.log(`📝 Formula ID: ${formula.id || 'NOT FOUND'}`);
      console.log(`\n📊 INGREDIENTS (${formula.ingredients.length}):`);
      
      let total = 0;
      formula.ingredients.forEach((ing, index) => {
        const inci = ing.inci ? ` [INCI: ${ing.inci}]` : '';
        console.log(`  ${index + 1}. ${ing.name}: ${ing.percentage}%${inci}`);
        total += ing.percentage;
      });
      
      console.log(`\n📊 TOTAL: ${total.toFixed(2)}%`);
      
      if (total >= 99.5 && total <= 100.5) {
        console.log('✅ Total percentage looks good!');
      } else {
        console.log('⚠️  Total percentage needs review!');
      }
      
      // Quick approval
      const approve = await this.question('\n✅ Approve this formula? (y/n/skip): ');
      
      if (approve.toLowerCase() === 'y') {
        await this.generateSQL(formula);
        console.log('✅ SQL generated!');
      } else if (approve.toLowerCase() === 'skip') {
        console.log('⏭️  Skipped');
      } else {
        console.log('❌ Not approved - need manual review');
      }
    } else {
      console.log('\n⚠️  Could not extract formula automatically');
      const skip = await this.question('Skip to next? (y/n): ');
      if (skip.toLowerCase() !== 'y') {
        // Manual extraction if needed
        await this.manualExtraction(data, sheetName);
      }
    }
    
    // Move to next
    this.currentSheetIndex++;
    await this.processNextFormula();
  }

  async extractFormula(data, sheetName) {
    const formula = {
      name: '',
      id: '',
      ingredients: []
    };
    
    // Look for formula name and ID
    for (let i = 0; i < Math.min(10, data.length); i++) {
      const row = data[i];
      if (row[0] && row[0].toString().includes('Product Name')) {
        formula.name = row[1] ? row[1].toString().trim() : sheetName;
      }
      if (row[0] && row[0].toString().includes('Formula Number')) {
        formula.id = row[1] ? row[1].toString().trim() : '';
      }
    }
    
    // If no name found, use sheet name
    if (!formula.name) {
      formula.name = sheetName.replace(/^\(\d+\)\s*/, '').trim();
    }
    
    // Look for ingredients
    let inIngredientSection = false;
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      // Check if we're at the ingredients header
      if (row.some(cell => cell && cell.toString().toLowerCase().includes('ingredients'))) {
        inIngredientSection = true;
        continue;
      }
      
      if (!inIngredientSection) continue;
      
      // Stop if we hit empty rows
      if (!row.some(cell => cell && cell.toString().trim())) {
        continue;
      }
      
      // Extract ingredient data
      let name = '';
      let inci = '';
      let percentage = 0;
      
      // Common patterns:
      // [Phase] [Ingredient] [INCI] [Function] [% w/w] [Amount]
      // or [Ingredient] [INCI] [...] [decimal percentage]
      
      if (row.length >= 3) {
        // Skip phase labels
        const firstCol = row[0] ? row[0].toString().trim() : '';
        if (/^[A-D]'?$/.test(firstCol) || firstCol.length > 50) {
          // This is a phase label or instruction, check next column
          name = row[1] ? row[1].toString().trim() : '';
          inci = row[2] ? row[2].toString().trim() : '';
        } else if (firstCol && firstCol.length > 1) {
          name = firstCol;
          inci = row[1] ? row[1].toString().trim() : '';
        }
        
        // Look for percentage (decimal or with %)
        for (let j = 2; j < row.length; j++) {
          const cell = row[j];
          
          if (typeof cell === 'number' && cell > 0 && cell < 1) {
            percentage = cell * 100;
            break;
          } else if (typeof cell === 'number' && cell >= 1 && cell <= 100) {
            percentage = cell;
            break;
          } else if (cell && typeof cell === 'string') {
            const match = cell.match(/(\d+\.?\d*)\s*%/);
            if (match) {
              percentage = parseFloat(match[1]);
              break;
            }
          }
        }
      }
      
      // Add ingredient if valid
      if (name && percentage > 0 && name.length < 50 && !/mix|add|combine|phase/i.test(name)) {
        formula.ingredients.push({
          name: name,
          inci: inci,
          percentage: percentage
        });
      }
    }
    
    return formula.ingredients.length > 0 ? formula : null;
  }

  async generateSQL(formula) {
    const filename = `sql-updates/${String(this.currentSheetIndex).padStart(3, '0')}-${formula.name.toLowerCase().replace(/\s+/g, '-')}.sql`;
    
    let sql = `-- Formula: ${formula.name}\n`;
    sql += `-- Formula ID: ${formula.id}\n`;
    sql += `-- Total: ${formula.ingredients.reduce((sum, ing) => sum + ing.percentage, 0).toFixed(2)}%\n\n`;
    
    // Update formula status
    sql += `-- Update formula status\n`;
    sql += `UPDATE formulas \n`;
    sql += `SET status = 'approved',\n`;
    sql += `    review_reasons = NULL,\n`;
    sql += `    updated_date = CURRENT_TIMESTAMP\n`;
    sql += `WHERE name = '${formula.name}';\n\n`;
    
    // Insert missing ingredients
    sql += `-- Insert any missing ingredients\n`;
    formula.ingredients.forEach(ing => {
      sql += `INSERT INTO ingredients (name, inci_name) \n`;
      sql += `VALUES ('${ing.name}', '${ing.inci || ''}')\n`;
      sql += `ON CONFLICT (name) DO UPDATE SET inci_name = EXCLUDED.inci_name\n`;
      sql += `WHERE ingredients.inci_name IS NULL OR ingredients.inci_name = '';\n\n`;
    });
    
    // Update percentages
    sql += `-- Update ingredient percentages\n`;
    formula.ingredients.forEach(ing => {
      sql += `UPDATE formula_ingredients \n`;
      sql += `SET percentage = ${ing.percentage}\n`;
      sql += `WHERE formula_id = (SELECT id FROM formulas WHERE name = '${formula.name}')\n`;
      sql += `  AND ingredient_id = (SELECT id FROM ingredients WHERE name = '${ing.name}');\n\n`;
    });
    
    fs.writeFileSync(filename, sql);
    
    // Update log
    this.updateLog(formula);
  }

  updateLog(formula) {
    const logEntry = `\n### ${this.currentSheetIndex - 6}. ${formula.name}\n`;
    const content = `- **Sheet**: ${this.currentSheetIndex + 1} - ${this.workbook.SheetNames[this.currentSheetIndex]}\n` +
                   `- **Formula ID**: ${formula.id}\n` +
                   `- **Status**: ✅ Approved\n` +
                   `- **Total**: ${formula.ingredients.reduce((sum, ing) => sum + ing.percentage, 0).toFixed(2)}%\n` +
                   `- **Ingredients**: ${formula.ingredients.length}\n\n`;
    
    fs.appendFileSync('formula-processing-log.md', logEntry + content);
  }

  async manualExtraction(data, sheetName) {
    console.log('\n🔧 Manual extraction mode...');
    // Show data and allow manual entry
    // ... implementation for edge cases
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Start processing
if (require.main === module) {
  const processor = new FastFormulaProcessor();
  processor.start();
}