-- Fix Marine-Love Refining Mask percentages 
-- Formula ID: 14, Current total: 200.00% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 14;

-- Insert correct percentages from Excel sheet "(31)Marine-Love Refining Mask B"
-- Based on manual reading of Excel data - dry powder mask

INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(14, (SELECT id FROM ingredients WHERE name ILIKE '%kaolin%clay%' OR name ILIKE '%kaolin%' LIMIT 1), 70.00),
(14, (SELECT id FROM ingredients WHERE name ILIKE '%bentonite%clay%' OR name ILIKE '%bentonite%' LIMIT 1), 20.00),
(14, (SELECT id FROM ingredients WHERE name ILIKE '%spirulina%powder%' OR name ILIKE '%spirulina%' LIMIT 1), 1.00),
(14, (SELECT id FROM ingredients WHERE name ILIKE '%msm%' LIMIT 1), 3.00),
(14, (SELECT id FROM ingredients WHERE name ILIKE '%arrowroot%powder%' OR name ILIKE '%arrowroot%' LIMIT 1), 5.00),
(14, (SELECT id FROM ingredients WHERE name ILIKE '%dmae%bitartrate%' OR name ILIKE '%dmae%' LIMIT 1), 1.00);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 14;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 14
GROUP BY f.name;

COMMIT;