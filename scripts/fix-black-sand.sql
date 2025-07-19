-- Fix Black Sand Detox Scrub percentages 
-- Formula ID: 16, Current total: 200.00% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 16;

-- Insert correct percentages from Excel sheet "(34)Black Sand Detox Scrub Char"
-- Excel uses decimal format (0.765 = 76.5%), converting to percentages

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(16, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 76.50),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%solagum%ax%' OR name ILIKE '%acacia%senegal%' LIMIT 1), 0.30);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(16, (SELECT id FROM ingredients WHERE name ILIKE '%cetearyl%alcohol%' LIMIT 1), 4.00),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%sodium%stearoyl%glutamate%' OR name ILIKE '%eumulgin%sg%' LIMIT 1), 0.75),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%glyceryl%stearate%citrate%' LIMIT 1), 3.00),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%coco%caprylate%' LIMIT 1), 2.00),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%algae%oil%' LIMIT 1), 2.00),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%coconut%oil%' LIMIT 1), 2.00);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(16, (SELECT id FROM ingredients WHERE name ILIKE '%green%tea%' OR name ILIKE '%camellia%sinensis%' LIMIT 1), 1.00),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%sea%kelp%bioferment%' OR name ILIKE '%kelp%ferment%' LIMIT 1), 1.00),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%natrasil%' OR name ILIKE '%silica%' LIMIT 1), 2.00),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%lavender%' OR name ILIKE '%essential%oil%' LIMIT 1), 0.35),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.20),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%charcoal%powder%' OR name ILIKE '%activated%charcoal%' LIMIT 1), 0.10);

-- Phase D
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(16, (SELECT id FROM ingredients WHERE name ILIKE '%mica%' LIMIT 1), 1.00),
(16, (SELECT id FROM ingredients WHERE name ILIKE '%icelandic%black%sand%' OR name ILIKE '%volcanic%sand%' OR name ILIKE '%black%sand%' LIMIT 1), 1.00);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 16;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 16
GROUP BY f.name;

COMMIT;