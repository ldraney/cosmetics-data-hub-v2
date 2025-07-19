-- Fix AllSkin Hand Cream percentages 
-- Formula ID: 22, Current total: 298.00% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 22;

-- Insert correct percentages from Excel sheet "(40)AllSkin Hand Cream MWD-011"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(22, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' LIMIT 1), 4.00),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%solagum%ax%' OR name ILIKE '%acacia%senegal%' LIMIT 1), 0.30);

-- Phase A'
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(22, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 74.00),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%aloe%vera%' LIMIT 1), 0.10);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(22, (SELECT id FROM ingredients WHERE name ILIKE '%cetearyl%alcohol%' LIMIT 1), 3.00),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%behenyl%alcohol%' LIMIT 1), 1.00),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%glyceryl%stearate%' LIMIT 1), 1.00),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%eumulgin%sg%' LIMIT 1), 1.00),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%kokum%butter%' LIMIT 1), 1.00),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%vitamin%e%' OR name ILIKE '%tocopherol%' LIMIT 1), 0.50),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%squalane%' LIMIT 1), 3.00),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%plantsil%' OR name ILIKE '%polyglyceryl%' LIMIT 1), 3.00),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%cetiol%ultimate%' LIMIT 1), 2.00),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%isoamyl%laurate%' LIMIT 1), 1.00);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(22, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%phytic%acid%' LIMIT 1), 0.10),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%sea%kelp%bioferment%' OR name ILIKE '%kelp%bioferment%' LIMIT 1), 1.00),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%snow%mushroom%' OR name ILIKE '%tremella%' LIMIT 1), 1.00),
(22, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.20);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 22;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 22
GROUP BY f.name;

COMMIT;