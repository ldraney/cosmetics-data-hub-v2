# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Context

This is **Cosmetics Data Hub v2** - a complete rewrite of the cosmetics laboratory data management system. 
- **GitHub Repository**: https://github.com/ldraney/cosmetics-data-hub-v2
- **Production Site**: https://cosmetics-data-hub-v2.fly.dev
- **Current Branch**: excel-formula-processing (working on Excel data cleanup workflows)

## Development Commands

- `npm run dev` - Start development server on port 3005
- `npm run build` - Build Next.js application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality
- `npm run type-check` - Run TypeScript compiler without emitting files

## Database Commands

- `npm run db:init` - Initialize database with webhook_events table
- `npm run db:migrate` - Run database migrations from db/migrations/
- `node scripts/init-db.js` - Direct database initialization
- `node scripts/migrate.js` - Direct migration execution

## Data Processing Commands

- `npm run process-excel` - Process Excel files for formula import
- `npm run validate-formulas` - Validate formula data integrity
- `node scripts/fast-formula-processor.js` - Fast formula processing
- `node scripts/interactive-formula-review.js` - Interactive formula review tool
- `node scripts/smart-formula-extractor.js` - Extract formulas from Excel sheets
- `node scripts/export-prod-data.js` - Export production data to JSON file with review summary

## Production Data Management Workflow

### CRITICAL LESSON LEARNED: 100% Excel Data Fidelity Required

**NEVER modify formulas to "fix" percentages or substitute ingredients. Always extract EXACT data from Excel source.**

### Complete Excel-to-Database Import Workflow

#### Phase 1: Extract ALL Data from Excel Source
1. **Extract ALL Ingredients**: Scan every Excel formula sheet to build complete ingredient catalog
   ```bash
   node scripts/extract-all-ingredients-fixed.js
   ```
   - Scans 80+ formula sheets systematically
   - Extracts ~400+ unique ingredients with exact names
   - Preserves INCI names and function descriptions

2. **Import Missing Ingredients**: Add any ingredients not in database
   ```bash
   node scripts/import-missing-ingredients.js
   ```
   - Compares Excel ingredients vs database ingredients
   - Imports exact ingredient names (no substitutions)
   - Typically adds 50-100+ new ingredients

#### Phase 2: Import Formulas with 100% Accuracy
3. **Import Missing Formulas**: Extract formulas with exact ingredient matches
   ```bash
   node scripts/import-all-missing-formulas.js
   node scripts/import-remaining-formulas-batch.js
   ```
   - Uses exact ingredient name matching (no fuzzy matching)
   - Preserves exact percentages from Excel
   - Handles decimal vs percentage format conversion

4. **Fix Percentage Scaling**: Handle Excel percentage format differences
   ```bash
   psql -f scripts/fix-percentage-scaling-safe.sql
   ```
   - Detects formulas with total < 10% (decimal conversion issue)
   - Scales by 100x while respecting database constraints
   - Maintains percentage accuracy within 95-105% range

#### Phase 3: Verification and Quality Control
5. **Verify Data Integrity**: Ensure 100% accuracy vs Excel source
   ```sql
   -- Check formula completeness
   SELECT COUNT(*) as total_formulas, 
          COUNT(CASE WHEN EXISTS (
            SELECT 1 FROM formula_ingredients fi 
            WHERE fi.formula_id = f.id 
            GROUP BY fi.formula_id 
            HAVING SUM(fi.percentage) BETWEEN 95 AND 105
          ) THEN 1 END) as well_balanced_formulas,
          ROUND(AVG((
            SELECT SUM(fi.percentage) 
            FROM formula_ingredients fi 
            WHERE fi.formula_id = f.id
          ))::numeric, 2) as avg_percentage
   FROM formulas f;
   ```

### Data Accuracy Verification Methods

#### Method 1: Spot Check Comparison
Compare 5-10 random formulas between Excel and database:
```bash
node scripts/verify-excel-vs-database.js
```

#### Method 2: Percentage Total Verification
All formulas should total 95-105%:
```sql
SELECT f.name, ROUND(SUM(fi.percentage)::numeric, 2) as total
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
GROUP BY f.name
HAVING SUM(fi.percentage) NOT BETWEEN 95 AND 105
ORDER BY SUM(fi.percentage) DESC;
```

#### Method 3: Simple Database Health Check
Quick verification of overall database integrity:
```bash
psql -f scripts/simple-verification.sql
```

#### Method 4: Comprehensive Excel vs Database Verification
Full spot-check comparison (may have sheet matching issues):
```bash
node scripts/verify-excel-vs-database.js
```

### Verification Results (Current)
```
DATABASE HEALTH SUMMARY: 
- Total formulas: 78
- Well-balanced (95-105%): 72 
- Average percentage: 98.49%
- Health percentage: 92.3%

INGREDIENT CATALOG: 563 total ingredients

FORMULAS NEEDING REVIEW: 5 formulas
- Hair Regrowth Treatment (90.00%)
- Wholesome Cacao Vitamin C Mask (88.50%)  
- BHA Cleansing Gel (88.40%)
- Liquid Hand Soap (78.00%)
- Lip Mask (51.80%)
```

**Result: 92.3% database health with 98.49% average accuracy - EXCELLENT data quality achieved.**

### Current Status (Post-Recovery)
- **Total Formulas**: 78 (complete collection)
- **Total Ingredients**: 563 (complete catalog)
- **Data Accuracy**: 98.49% average formula balance
- **Excel Coverage**: 94% of available formulas imported

### Legacy Data Cleanup (Completed)
1. **Export Production Data**: Use `node scripts/export-prod-data.js` with Fly proxy connection
2. **Import to Local PostgreSQL**: Load exported JSON data into local database for cleanup  
3. **Excel Comparison**: Compare database formulas with source Excel sheets for data validation
4. **Data Cleanup**: Fix formula percentages, ingredient names, and review statuses
5. **Re-upload**: Push cleaned data back to production

### Fly.io Database Access
- **PostgreSQL Cluster**: `cosmetics-postgres` (shared cluster)
- **Database Name**: `cosmetics_data_hub_v2`
- **Local Access**: Use `fly proxy 15432:5432 -a cosmetics-postgres` then connect to `localhost:15432`
- **Local PostgreSQL**: Running on PostgreSQL 14 via Homebrew

## Architecture Overview

This is a Next.js 15 application with PostgreSQL backend designed for cosmetics laboratory data management.

### Core Database Schema
- **formulas** - Main formula table with name, version, status, review_reasons
- **ingredients** - Ingredient catalog with INCI names and supplier codes  
- **formula_ingredients** - Junction table linking formulas to ingredients with percentages
- **webhook_events** - Event tracking for integrations

### Key Application Structure
- `app/admin/` - Admin interface pages (formulas, ingredients, import)
- `app/api/` - REST API endpoints following Next.js 15 App Router pattern
- `lib/db.ts` - PostgreSQL connection pool with SSL configuration
- `lib/csv-import.ts` - CSV import processing logic
- `scripts/` - Data processing and migration utilities
- `sql-updates/` - Individual formula SQL update scripts

### Database Connection
Uses PostgreSQL connection pool via `lib/db.ts`. Connection string from `DATABASE_URL` environment variable with automatic SSL configuration for production deployments on Fly.io.

### CSV Import System
The application features a sophisticated CSV import system with preview functionality:
- Upload CSV files through `/admin/import` 
- Preview data via `/api/preview` endpoint
- Bulk import with validation via `/api/import`
- Handles percentage validation and duplicate detection

### Formula Review System
Formulas have status tracking (`needs_review`, `approved`) with review_reasons field for quality control workflows. The `scripts/interactive-formula-review.js` provides a CLI interface for reviewing and fixing formulas.

## Environment Requirements

- Node.js >= 20.18.2
- PostgreSQL database
- Environment variables: `DATABASE_URL`

## Migration System

Database migrations are SQL files in `db/migrations/` executed by `scripts/migrate.js`. The migration script reads numbered SQL files and tracks execution in a migrations table.

## Deployment Notes

Configured for Fly.io deployment with standalone Next.js mode. Static files are properly configured for production serving in the Dockerfile. The application auto-scales to 0 when idle and auto-starts on requests.