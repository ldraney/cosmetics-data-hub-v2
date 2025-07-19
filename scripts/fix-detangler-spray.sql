-- Fix Detangler Spray Conditioner percentages 
-- Formula ID: 21, Current total: 372.25% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 21;

-- Insert correct percentages from Excel sheet "(39)Detangler Spray Conditioner"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(21, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 73.25),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%rose%hydrosol%' OR name ILIKE '%rose%water%' LIMIT 1), 10.00);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(21, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%phytic%acid%' LIMIT 1), 0.10),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%cetrimonium%chloride%' LIMIT 1), 0.40);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(21, (SELECT id FROM ingredients WHERE name ILIKE '%coconut%oil%' LIMIT 1), 2.00),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%isoamyl%laurate%' LIMIT 1), 1.00),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%cetearyl%alcohol%' LIMIT 1), 2.00),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%behentrimonium%chloride%' OR name ILIKE '%behetrimonium%' LIMIT 1), 2.00),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%cetiol%cc%' OR name ILIKE '%dicaprylyl%carbonate%' LIMIT 1), 2.00),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%cetiol%ultimate%' LIMIT 1), 2.00),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%natrasil%' OR name ILIKE '%silica%' LIMIT 1), 1.00);

-- Phase D
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(21, (SELECT id FROM ingredients WHERE name ILIKE '%berry%scent%' OR name ILIKE '%fragrance%' LIMIT 1), 0.40),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%calendula%extract%' LIMIT 1), 0.40),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%chamomile%extract%' LIMIT 1), 0.20),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%rose%essential%oil%' OR name ILIKE '%rose%eo%' LIMIT 1), 0.05),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80),
(21, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.40);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 21;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 21
GROUP BY f.name;

COMMIT;