-- Template for fixing formula percentages
-- Usage: Replace FORMULA_ID and FORMULA_NAME, then adjust ingredient percentages

-- Formula: {FORMULA_NAME} (ID: {FORMULA_ID})
-- Current total: {CURRENT_TOTAL}% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = {FORMULA_ID};

-- Insert correct percentages from Excel data
-- Format: (formula_id, ingredient_lookup, percentage)

-- Main ingredients (adjust percentages as needed)
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
({FORMULA_ID}, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 70.00),
({FORMULA_ID}, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
({FORMULA_ID}, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' LIMIT 1), 3.00);

-- Add more ingredients here following the pattern above
-- ({FORMULA_ID}, (SELECT id FROM ingredients WHERE name ILIKE '%ingredient_name%' LIMIT 1), percentage),

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = {FORMULA_ID};

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = {FORMULA_ID}
GROUP BY f.name;

COMMIT;