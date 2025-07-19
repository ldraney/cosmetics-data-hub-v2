-- Fix Clay Mask percentages 
-- Formula ID: 37, Current total: 280.00% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 37;

-- Insert correct percentages from Excel sheet "(58)Cream Mask"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(37, (SELECT id FROM ingredients WHERE name ILIKE '%butylene%glycol%' LIMIT 1), 4.00),
(37, (SELECT id FROM ingredients WHERE name ILIKE '%solagum%ax%' OR name ILIKE '%acacia%senegal%' LIMIT 1), 0.40),
(37, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 3.00),
(37, (SELECT id FROM ingredients WHERE name ILIKE '%magnesium%aluminum%silicate%' LIMIT 1), 3.00),
(37, (SELECT id FROM ingredients WHERE name ILIKE '%phytic%acid%' LIMIT 1), 0.20);

-- Phase A'
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(37, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 47.55);

-- Phase B  
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(37, (SELECT id FROM ingredients WHERE name ILIKE '%coconut%milk%powder%' LIMIT 1), 2.00),
(37, (SELECT id FROM ingredients WHERE name ILIKE '%white%kaolin%clay%' OR name ILIKE '%kaolin%' LIMIT 1), 30.00),
(37, (SELECT id FROM ingredients WHERE name ILIKE '%blue%spirulina%' OR name ILIKE '%spirulina%' LIMIT 1), 0.20),
(37, (SELECT id FROM ingredients WHERE name ILIKE '%msm%' LIMIT 1), 0.10),
(37, (SELECT id FROM ingredients WHERE name ILIKE '%allantoin%' LIMIT 1), 0.10),
(37, (SELECT id FROM ingredients WHERE name ILIKE '%dmae%bitartrate%' OR name ILIKE '%dmae%' LIMIT 1), 0.20);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(37, (SELECT id FROM ingredients WHERE name ILIKE '%witch%hazel%' LIMIT 1), 2.00),
(37, (SELECT id FROM ingredients WHERE name ILIKE '%rice%water%ferment%' LIMIT 1), 1.00);

-- Phase D
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(37, (SELECT id FROM ingredients WHERE name ILIKE '%coco%glucoside%' LIMIT 1), 5.00),
(37, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.10),
(37, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 37;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 37
GROUP BY f.name;

COMMIT;