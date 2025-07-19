-- Fix Hydrating Serum percentages 
-- Formula ID: 39, Current total: 247.50% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 39;

-- Insert correct percentages from Excel sheet "(61)Hydrating Serum"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(39, (SELECT id FROM ingredients WHERE name ILIKE '%water%' OR name ILIKE '%aqua%' LIMIT 1), 85.00);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(39, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(39, (SELECT id FROM ingredients WHERE name ILIKE '%niacinamide%' LIMIT 1), 1.50),
(39, (SELECT id FROM ingredients WHERE name ILIKE '%siligel%' OR name ILIKE '%silica%' LIMIT 1), 0.60);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(39, (SELECT id FROM ingredients WHERE name ILIKE '%olive%unsaponifiables%' LIMIT 1), 2.00),
(39, (SELECT id FROM ingredients WHERE name ILIKE '%oliwax%lc%' OR name ILIKE '%olive%wax%' LIMIT 1), 1.00),
(39, (SELECT id FROM ingredients WHERE name ILIKE '%olivem%1000%' LIMIT 1), 1.00),
(39, (SELECT id FROM ingredients WHERE name ILIKE '%olive%squalane%' OR name ILIKE '%squalane%' LIMIT 1), 1.50);

-- Phase D
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(39, (SELECT id FROM ingredients WHERE name ILIKE '%sea%kelp%bioferment%' OR name ILIKE '%kelp%bioferment%' LIMIT 1), 2.50),
(39, (SELECT id FROM ingredients WHERE name ILIKE '%seaweed%extract%' OR name ILIKE '%laminaria%digitata%' LIMIT 1), 1.00),
(39, (SELECT id FROM ingredients WHERE name ILIKE '%snow%mushroom%' OR name ILIKE '%tremella%' LIMIT 1), 1.00),
(39, (SELECT id FROM ingredients WHERE name ILIKE '%lactic%acid%' LIMIT 1), 0.10),
(39, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 39;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 39
GROUP BY f.name;

COMMIT;