-- Fix One-for-All Skin Hydration Cream percentages 
-- Formula ID: 49, Current total: 585% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 49;

-- Insert correct percentages from Excel sheet "(70) One-for-All Skin Hydration"
-- Based on manual reading of Excel data (percentages already in correct format)

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(49, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 70.00),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%aloe%vera%' LIMIT 1), 0.10),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%colloidal%oatmeal%' OR name ILIKE '%oatmeal%' LIMIT 1), 1.00),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%magnesium%ascorbyl%' OR name ILIKE '%vitamin%c%' LIMIT 1), 0.30);

-- Phase A'
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(49, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' LIMIT 1), 3.00),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%siligel%' LIMIT 1), 0.40);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(49, (SELECT id FROM ingredients WHERE name ILIKE '%shea%oil%' LIMIT 1), 3.00),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%cocoa%butter%' LIMIT 1), 1.00),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%meadowfoam%oil%' LIMIT 1), 3.00),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%glyceryl%stearate%' LIMIT 1), 2.00),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%olivem%1000%' LIMIT 1), 5.00),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%cetiol%ultimate%' LIMIT 1), 2.00),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%coco%caprylate%' LIMIT 1), 2.00),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%almond%oil%' LIMIT 1), 0.50),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%avocado%oil%' LIMIT 1), 0.50),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%macadamia%nut%oil%' LIMIT 1), 0.50);

-- Phase C  
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(49, (SELECT id FROM ingredients WHERE name ILIKE '%chamomile%extract%' LIMIT 1), 0.20),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%oat%extract%' LIMIT 1), 1.00),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%snow%mushroom%' OR name ILIKE '%wsk%' LIMIT 1), 0.40),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%tocopherol%' OR name ILIKE '%vitamin%e%' LIMIT 1), 0.50),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80),
(49, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.20);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 49;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 49
GROUP BY f.name;

COMMIT;