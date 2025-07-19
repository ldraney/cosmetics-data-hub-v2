-- Fix Pore minimizing cream with 5% niacinamide percentages 
-- Formula ID: 19, Current total: 347.5% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 19;

-- Insert correct percentages from Excel sheet "(37) Pore Minimizing Cream with"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(19, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' LIMIT 1), 4.00),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%siligel%' LIMIT 1), 0.40),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%niacinamide%' LIMIT 1), 5.00),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%n-acetyl%glucosamine%' OR name ILIKE '%acetyl%glucosamine%' LIMIT 1), 0.30);

-- Phase A'
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(19, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 57.80);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(19, (SELECT id FROM ingredients WHERE name ILIKE '%eumulgin%sg%' LIMIT 1), 1.50),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%cetearyl%alcohol%' LIMIT 1), 4.00),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%behenyl%alcohol%' LIMIT 1), 1.00),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%glyceryl%stearate%' LIMIT 1), 2.20),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%shea%butter%' LIMIT 1), 2.00),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%caprylic%capric%triglyceride%' OR name ILIKE '%cct%' LIMIT 1), 6.00),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%natrasil%' OR name ILIKE '%plantsil%' LIMIT 1), 3.00),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%shea%oil%' LIMIT 1), 2.00),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%borage%seed%oil%' LIMIT 1), 1.00),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%cetiol%ultimate%' LIMIT 1), 1.00);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(19, (SELECT id FROM ingredients WHERE name ILIKE '%rice%water%' LIMIT 1), 3.00),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%rice%lipid%' OR name ILIKE '%rice%bran%oil%' LIMIT 1), 1.00),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%phytic%acid%' LIMIT 1), 0.10),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%orchid%extract%' LIMIT 1), 0.50),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%snow%mushroom%' OR name ILIKE '%tremella%' LIMIT 1), 1.00),
(19, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.40);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 19;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 19
GROUP BY f.name;

COMMIT;