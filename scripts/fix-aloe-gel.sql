-- Fix Aloe Vera Gel percentages 
-- Formula ID: 27, Current total: 248.50% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 27;

-- Insert correct percentages from Excel sheet "(53)Aloe Vera Gel PEL-AVG-001"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(27, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 91.50),
(27, (SELECT id FROM ingredients WHERE name ILIKE '%clearthix%s%' OR name ILIKE '%xanthan%gum%' LIMIT 1), 1.00),
(27, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' LIMIT 1), 3.00),
(27, (SELECT id FROM ingredients WHERE name ILIKE '%butylene%glycol%' LIMIT 1), 3.00),
(27, (SELECT id FROM ingredients WHERE name ILIKE '%aloe%vera%' LIMIT 1), 0.50),
(27, (SELECT id FROM ingredients WHERE name ILIKE '%hyaluronic%acid%' LIMIT 1), 0.20),
(27, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 27;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 27
GROUP BY f.name;

COMMIT;