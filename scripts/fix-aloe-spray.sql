-- Fix Aloe Vera Spray percentages 
-- Formula ID: 34, Current total: 154.45% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 34;

-- Insert correct percentages from Excel sheet "(55)Aloe Vera Spray"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(34, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 87.45);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(34, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' LIMIT 1), 3.00),
(34, (SELECT id FROM ingredients WHERE name ILIKE '%butylene%glycol%' LIMIT 1), 3.00),
(34, (SELECT id FROM ingredients WHERE name ILIKE '%aloe%vera%200%x%' OR name ILIKE '%aloe%vera%' LIMIT 1), 0.50),
(34, (SELECT id FROM ingredients WHERE name ILIKE '%mallow%extract%' LIMIT 1), 1.00),
(34, (SELECT id FROM ingredients WHERE name ILIKE '%cucumber%extract%' LIMIT 1), 1.00),
(34, (SELECT id FROM ingredients WHERE name ILIKE '%phytic%acid%' LIMIT 1), 0.05),
(34, (SELECT id FROM ingredients WHERE name ILIKE '%leucidal%liquid%' LIMIT 1), 4.00);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 34;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 34
GROUP BY f.name;

COMMIT;