const XLSX = require('xlsx');
const readline = require('readline');

const EXCEL_FILE_PATH = '/Users/earthharbor/Downloads/Pure Earth Labs Finalized Formula.xlsx';

class FormulaReviewer {
  constructor() {
    this.workbook = null;
    this.currentSheetIndex = 4; // Start from sheet 5 (index 4)
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
    this.corrections = [];
  }

  async start() {
    try {
      console.log('🔧 Interactive Formula Review Tool\n');
      console.log('Loading Excel file...');
      
      this.workbook = XLSX.readFile(EXCEL_FILE_PATH);
      console.log(`📊 Found ${this.workbook.SheetNames.length} sheets total\n`);
      
      console.log('📋 Available sheets:');
      this.workbook.SheetNames.forEach((name, index) => {
        console.log(`  ${index + 1}. ${name}`);
      });
      
      console.log(`\n🚀 Starting review from sheet ${this.currentSheetIndex + 1}...\n`);
      
      await this.reviewNextSheet();
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      this.rl.close();
    }
  }

  async reviewNextSheet() {
    if (this.currentSheetIndex >= this.workbook.SheetNames.length) {
      console.log('\n🎉 Reached end of sheets!');
      await this.showSummary();
      return;
    }

    const sheetName = this.workbook.SheetNames[this.currentSheetIndex];
    const sheet = this.workbook.Sheets[sheetName];
    
    console.log(`\n=== SHEET ${this.currentSheetIndex + 1}: ${sheetName} ===`);
    
    // Extract data from sheet
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    // Show raw data first
    console.log('\n📋 Raw sheet data (first 15 rows):');
    data.slice(0, 15).forEach((row, index) => {
      if (row.some(cell => cell && cell.toString().trim())) {
        const rowData = row.slice(0, 6).map(cell => 
          cell ? cell.toString().substring(0, 25) : ''
        ).join(' | ');
        console.log(`  ${index + 1}: ${rowData}`);
      }
    });
    
    // Try to extract ingredients
    const extractedFormula = this.extractIngredientsFromSheet(data);
    
    if (extractedFormula.ingredients.length > 0) {
      console.log('\n🔍 EXTRACTED INGREDIENTS:');
      extractedFormula.ingredients.forEach((ing, index) => {
        console.log(`  ${index + 1}. ${ing.name}: ${ing.percentage}%`);
      });
      
      const total = extractedFormula.ingredients.reduce((sum, ing) => sum + ing.percentage, 0);
      console.log(`\n📊 Total: ${total.toFixed(2)}%`);
      
      // Check if this formula exists in production
      await this.checkProductionFormula(sheetName, extractedFormula);
      
    } else {
      console.log('\n⚠️  No ingredients found in this sheet');
    }
    
    // Ask what to do next
    await this.askNextAction();
  }

  extractIngredientsFromSheet(data) {
    const ingredients = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (!row || !row.some(cell => cell && cell.toString().trim())) {
        continue;
      }
      
      let ingredientName = '';
      let percentage = 0;
      
      // Look for ingredient name and percentage in the same row
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        
        if (cell && typeof cell === 'string') {
          // Check for percentage pattern
          const percentageMatch = cell.match(/(\d+\.?\d*)\s*%/);
          if (percentageMatch) {
            percentage = parseFloat(percentageMatch[1]);
            
            // Look for ingredient name in earlier columns
            for (let k = 0; k < j; k++) {
              if (row[k] && typeof row[k] === 'string' && row[k].trim()) {
                ingredientName = row[k].trim();
                break;
              }
            }
          }
          
          // If no percentage found yet, this might be an ingredient name
          if (!percentage && cell.trim() && !cell.match(/^\d+$/)) {
            ingredientName = cell.trim();
          }
        }
        
        // Check for numeric percentage
        if (typeof cell === 'number' && cell > 0 && cell <= 100) {
          percentage = cell;
          
          // Look for ingredient name in earlier columns
          for (let k = 0; k < j; k++) {
            if (row[k] && typeof row[k] === 'string' && row[k].trim()) {
              ingredientName = row[k].trim();
              break;
            }
          }
        }
      }
      
      // If we found both name and percentage, add to ingredients
      if (ingredientName && percentage > 0) {
        // Check if this ingredient already exists (avoid duplicates)
        const existing = ingredients.find(ing => 
          ing.name.toLowerCase() === ingredientName.toLowerCase()
        );
        
        if (!existing) {
          ingredients.push({
            name: ingredientName,
            percentage: percentage
          });
        }
      }
    }
    
    return { ingredients };
  }

  async checkProductionFormula(sheetName, extractedFormula) {
    console.log('\n🔍 Checking production database...');
    
    // Here we would check the production database
    // For now, let's simulate this
    console.log(`Looking for formula matching: "${sheetName}"`);
    console.log('(This will check against production database)');
  }

  async askNextAction() {
    const answer = await this.question(`
📝 What would you like to do?
  1. Accept these ingredients and move to next sheet
  2. Skip this sheet and move to next
  3. Show me more details about this sheet
  4. Stop review and show summary
  5. Go back to previous sheet
  
Your choice (1-5): `);

    switch (answer.trim()) {
      case '1':
        console.log('✅ Accepted! Moving to next sheet...');
        this.corrections.push({
          sheet: this.workbook.SheetNames[this.currentSheetIndex],
          action: 'accepted',
          ingredients: this.extractIngredientsFromSheet(
            XLSX.utils.sheet_to_json(this.workbook.Sheets[this.workbook.SheetNames[this.currentSheetIndex]], { header: 1, defval: '' })
          ).ingredients
        });
        this.currentSheetIndex++;
        await this.reviewNextSheet();
        break;
        
      case '2':
        console.log('⏭️  Skipped! Moving to next sheet...');
        this.corrections.push({
          sheet: this.workbook.SheetNames[this.currentSheetIndex],
          action: 'skipped'
        });
        this.currentSheetIndex++;
        await this.reviewNextSheet();
        break;
        
      case '3':
        console.log('🔍 Showing more details...');
        await this.showSheetDetails();
        await this.askNextAction();
        break;
        
      case '4':
        console.log('🛑 Stopping review...');
        await this.showSummary();
        break;
        
      case '5':
        if (this.currentSheetIndex > 4) {
          console.log('⬅️  Going back to previous sheet...');
          this.currentSheetIndex--;
          await this.reviewNextSheet();
        } else {
          console.log('❌ Already at first formula sheet');
          await this.askNextAction();
        }
        break;
        
      default:
        console.log('❌ Invalid choice. Please choose 1-5.');
        await this.askNextAction();
    }
  }

  async showSheetDetails() {
    const sheetName = this.workbook.SheetNames[this.currentSheetIndex];
    const sheet = this.workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    console.log(`\n📋 DETAILED VIEW - Sheet: ${sheetName}`);
    console.log('All non-empty rows:');
    
    data.forEach((row, index) => {
      if (row.some(cell => cell && cell.toString().trim())) {
        const rowData = row.map(cell => 
          cell ? cell.toString() : ''
        ).join(' | ');
        console.log(`  Row ${index + 1}: ${rowData}`);
      }
    });
  }

  async showSummary() {
    console.log('\n📊 REVIEW SUMMARY');
    console.log('==================');
    
    const accepted = this.corrections.filter(c => c.action === 'accepted');
    const skipped = this.corrections.filter(c => c.action === 'skipped');
    
    console.log(`✅ Accepted: ${accepted.length} formulas`);
    console.log(`⏭️  Skipped: ${skipped.length} formulas`);
    
    if (accepted.length > 0) {
      console.log('\n📋 Accepted formulas:');
      accepted.forEach((correction, index) => {
        const total = correction.ingredients.reduce((sum, ing) => sum + ing.percentage, 0);
        console.log(`  ${index + 1}. ${correction.sheet} (${correction.ingredients.length} ingredients, ${total.toFixed(2)}% total)`);
      });
      
      console.log('\n💾 Would you like to generate SQL update statements for these formulas?');
      const generateSQL = await this.question('Generate SQL? (y/n): ');
      
      if (generateSQL.toLowerCase() === 'y') {
        this.generateSQLUpdates(accepted);
      }
    }
    
    this.rl.close();
  }

  generateSQLUpdates(accepted) {
    console.log('\n📝 SQL UPDATE STATEMENTS:');
    console.log('==========================');
    
    accepted.forEach(correction => {
      console.log(`\n-- ${correction.sheet}`);
      correction.ingredients.forEach(ing => {
        console.log(`UPDATE formula_ingredients 
SET percentage = ${ing.percentage}
WHERE formula_id = (SELECT id FROM formulas WHERE name = '${correction.sheet}')
  AND ingredient_id = (SELECT id FROM ingredients WHERE name = '${ing.name}');`);
      });
    });
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Start the interactive review
if (require.main === module) {
  const reviewer = new FormulaReviewer();
  reviewer.start();
}