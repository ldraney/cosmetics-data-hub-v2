const XLSX = require('xlsx');
const readline = require('readline');

const EXCEL_FILE_PATH = '/Users/earthharbor/Downloads/Pure Earth Labs Finalized Formula.xlsx';

class SmartFormulaExtractor {
  constructor() {
    this.workbook = null;
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });
  }

  async start() {
    try {
      console.log('🔧 Smart Formula Extractor\n');
      console.log('Loading Excel file...');
      
      this.workbook = XLSX.readFile(EXCEL_FILE_PATH);
      console.log(`📊 Found ${this.workbook.SheetNames.length} sheets total\n`);
      
      // Start from sheet 7 (first real formula)
      await this.extractFormula(6);
      
    } catch (error) {
      console.error('❌ Error:', error.message);
      this.rl.close();
    }
  }

  async extractFormula(sheetIndex) {
    if (sheetIndex >= this.workbook.SheetNames.length) {
      console.log('\n🎉 Reached end of sheets!');
      this.rl.close();
      return;
    }

    const sheetName = this.workbook.SheetNames[sheetIndex];
    const sheet = this.workbook.Sheets[sheetName];
    
    console.log(`\n=== SHEET ${sheetIndex + 1}: ${sheetName} ===`);
    
    // Extract data from sheet
    const data = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
    
    // Show raw data first
    console.log('\n📋 Raw sheet data (first 25 rows):');
    data.slice(0, 25).forEach((row, index) => {
      if (row.some(cell => cell && cell.toString().trim())) {
        const rowData = row.slice(0, 6).map(cell => 
          cell ? cell.toString().substring(0, 35) : ''
        ).join(' | ');
        console.log(`  ${index + 1}: ${rowData}`);
      }
    });
    
    // Try multiple extraction methods
    const extractionMethods = [
      this.extractMethod1.bind(this),
      this.extractMethod2.bind(this),
      this.extractMethod3.bind(this)
    ];
    
    console.log('\n🔍 Trying different extraction methods...\n');
    
    for (let i = 0; i < extractionMethods.length; i++) {
      const method = extractionMethods[i];
      const result = method(data);
      
      if (result && result.length > 0) {
        console.log(`📊 Method ${i + 1} found ${result.length} ingredients:`);
        result.forEach((ing, index) => {
          console.log(`  ${index + 1}. ${ing.name}: ${ing.percentage}%`);
        });
        
        const total = result.reduce((sum, ing) => sum + ing.percentage, 0);
        console.log(`\n📊 Total: ${total.toFixed(2)}%`);
        
        if (total >= 99.5 && total <= 100.5) {
          console.log('✅ Total looks good!');
        } else {
          console.log('⚠️  Total percentage is outside normal range');
        }
        
        console.log('\n');
      } else {
        console.log(`❌ Method ${i + 1} found no ingredients\n`);
      }
    }
    
    // Ask user what to do
    await this.askUserChoice(sheetIndex, sheetName, data);
  }

  // Method 1: Look for decimal percentages (like 0.04 = 4%)
  extractMethod1(data) {
    const ingredients = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (!row || !row.some(cell => cell && cell.toString().trim())) {
        continue;
      }
      
      // Look for pattern: [ingredient name] [inci] [function] [decimal] [amount]
      if (row.length >= 4) {
        const name = row[0] ? row[0].toString().trim() : '';
        const percentage = row[3];
        
        // Skip if name is empty, a phase label, or process instruction
        if (!name || 
            name.length < 2 || 
            /^[A-D]'?$/.test(name) || 
            name.includes('phase') || 
            name.includes('mix') ||
            name.includes('Add') ||
            name.includes('Combine') ||
            name.length > 50) {
          continue;
        }
        
        // Check if percentage is a decimal that could be a percentage
        if (typeof percentage === 'number' && percentage > 0 && percentage < 1) {
          const percentageValue = percentage * 100;
          
          // Avoid duplicates
          const existing = ingredients.find(ing => 
            ing.name.toLowerCase() === name.toLowerCase()
          );
          
          if (!existing) {
            ingredients.push({
              name: name,
              percentage: percentageValue
            });
          }
        }
      }
    }
    
    return ingredients;
  }

  // Method 2: Look for percentage symbols (like 4%)
  extractMethod2(data) {
    const ingredients = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (!row || !row.some(cell => cell && cell.toString().trim())) {
        continue;
      }
      
      let ingredientName = '';
      let percentage = 0;
      
      // Look for percentage pattern in any cell
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        
        if (cell && typeof cell === 'string') {
          const percentageMatch = cell.match(/(\d+\.?\d*)\s*%/);
          if (percentageMatch) {
            percentage = parseFloat(percentageMatch[1]);
            
            // Look for ingredient name in earlier columns
            for (let k = 0; k < j; k++) {
              if (row[k] && typeof row[k] === 'string' && row[k].trim()) {
                const name = row[k].trim();
                if (name.length > 1 && name.length < 50 && !/^[A-D]'?$/.test(name)) {
                  ingredientName = name;
                  break;
                }
              }
            }
          }
        }
      }
      
      if (ingredientName && percentage > 0) {
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
    
    return ingredients;
  }

  // Method 3: Look for numbers that could be percentages
  extractMethod3(data) {
    const ingredients = [];
    
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      
      if (!row || !row.some(cell => cell && cell.toString().trim())) {
        continue;
      }
      
      let ingredientName = '';
      let percentage = 0;
      
      // Look for numbers that could be percentages
      for (let j = 0; j < row.length; j++) {
        const cell = row[j];
        
        if (typeof cell === 'number' && cell > 0 && cell <= 100) {
          percentage = cell;
          
          // Look for ingredient name in earlier columns
          for (let k = 0; k < j; k++) {
            if (row[k] && typeof row[k] === 'string' && row[k].trim()) {
              const name = row[k].trim();
              if (name.length > 1 && name.length < 50 && !/^[A-D]'?$/.test(name)) {
                ingredientName = name;
                break;
              }
            }
          }
        }
      }
      
      if (ingredientName && percentage > 0) {
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
    
    return ingredients;
  }

  async askUserChoice(sheetIndex, sheetName, data) {
    const answer = await this.question(`
📝 What would you like to do?
  1. Use Method 1 results (decimal * 100)
  2. Use Method 2 results (percentage symbols)
  3. Use Method 3 results (direct numbers)
  4. Skip this formula
  5. Show more details
  6. Move to next formula
  7. Manual extraction (I'll help you identify the correct ingredients)
  
Your choice (1-7): `);

    switch (answer.trim()) {
      case '1':
        await this.acceptMethod(1, sheetIndex, sheetName, data);
        break;
      case '2':
        await this.acceptMethod(2, sheetIndex, sheetName, data);
        break;
      case '3':
        await this.acceptMethod(3, sheetIndex, sheetName, data);
        break;
      case '4':
        console.log('⏭️  Skipped!');
        await this.extractFormula(sheetIndex + 1);
        break;
      case '5':
        await this.showDetails(data);
        await this.askUserChoice(sheetIndex, sheetName, data);
        break;
      case '6':
        await this.extractFormula(sheetIndex + 1);
        break;
      case '7':
        await this.manualExtraction(sheetIndex, sheetName, data);
        break;
      default:
        console.log('❌ Invalid choice. Please choose 1-7.');
        await this.askUserChoice(sheetIndex, sheetName, data);
    }
  }

  async acceptMethod(methodNum, sheetIndex, sheetName, data) {
    const methods = [
      this.extractMethod1.bind(this),
      this.extractMethod2.bind(this),
      this.extractMethod3.bind(this)
    ];
    
    const ingredients = methods[methodNum - 1](data);
    
    console.log(`\n✅ Using Method ${methodNum} for ${sheetName}`);
    console.log('Final ingredients:');
    ingredients.forEach((ing, index) => {
      console.log(`  ${index + 1}. ${ing.name}: ${ing.percentage}%`);
    });
    
    const total = ingredients.reduce((sum, ing) => sum + ing.percentage, 0);
    console.log(`\n📊 Total: ${total.toFixed(2)}%`);
    
    // Generate SQL update statements
    this.generateSQL(sheetName, ingredients);
    
    // Move to next formula
    await this.extractFormula(sheetIndex + 1);
  }

  async manualExtraction(sheetIndex, sheetName, data) {
    console.log('\n🔧 Manual Extraction Mode');
    console.log('Tell me which rows contain ingredients and I\'ll extract them...');
    
    // Show numbered rows
    console.log('\n📋 All rows with data:');
    data.forEach((row, index) => {
      if (row.some(cell => cell && cell.toString().trim())) {
        const rowData = row.slice(0, 6).map(cell => 
          cell ? cell.toString().substring(0, 40) : ''
        ).join(' | ');
        console.log(`  ${index + 1}: ${rowData}`);
      }
    });
    
    const rowNumbers = await this.question('\nEnter row numbers containing ingredients (comma separated): ');
    const rows = rowNumbers.split(',').map(n => parseInt(n.trim()) - 1);
    
    const ingredients = [];
    for (const rowIndex of rows) {
      if (rowIndex >= 0 && rowIndex < data.length) {
        const row = data[rowIndex];
        const name = await this.question(`Ingredient name for row ${rowIndex + 1}: `);
        const percentage = await this.question(`Percentage for ${name}: `);
        
        ingredients.push({
          name: name,
          percentage: parseFloat(percentage)
        });
      }
    }
    
    console.log('\n📊 Manual extraction complete:');
    ingredients.forEach((ing, index) => {
      console.log(`  ${index + 1}. ${ing.name}: ${ing.percentage}%`);
    });
    
    const total = ingredients.reduce((sum, ing) => sum + ing.percentage, 0);
    console.log(`\n📊 Total: ${total.toFixed(2)}%`);
    
    this.generateSQL(sheetName, ingredients);
    await this.extractFormula(sheetIndex + 1);
  }

  async showDetails(data) {
    console.log('\n📋 DETAILED VIEW - All rows:');
    data.forEach((row, index) => {
      if (row.some(cell => cell && cell.toString().trim())) {
        const rowData = row.map(cell => 
          cell ? cell.toString() : ''
        ).join(' | ');
        console.log(`  ${index + 1}: ${rowData}`);
      }
    });
  }

  generateSQL(sheetName, ingredients) {
    console.log(`\n📝 SQL UPDATE STATEMENTS for ${sheetName}:`);
    console.log('=' + '='.repeat(50));
    
    ingredients.forEach(ing => {
      console.log(`UPDATE formula_ingredients 
SET percentage = ${ing.percentage}
WHERE formula_id = (SELECT id FROM formulas WHERE name = '${sheetName}')
  AND ingredient_id = (SELECT id FROM ingredients WHERE name = '${ing.name}');`);
    });
  }

  question(prompt) {
    return new Promise((resolve) => {
      this.rl.question(prompt, resolve);
    });
  }
}

// Start the smart extractor
if (require.main === module) {
  const extractor = new SmartFormulaExtractor();
  extractor.start();
}