-- Fix Baby Body Lotion/ EveryAge percentages 
-- Formula ID: 12, Current total: 347.6% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 12;

-- Insert correct percentages from Excel sheet "(29)Baby Body Lotion EveryAge B"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(12, (SELECT id FROM ingredients WHERE name ILIKE '%aloe%vera%juice%' OR name ILIKE '%aloe%vera%gel%' LIMIT 1), 1.00),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%xanthan%gum%' LIMIT 1), 0.30),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' LIMIT 1), 2.00),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%ceramide%' LIMIT 1), 0.50),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%panthenol%' LIMIT 1), 0.50);

-- Phase A'
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(12, (SELECT id FROM ingredients WHERE name ILIKE '%water%' OR name ILIKE '%di%water%' LIMIT 1), 67.60);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(12, (SELECT id FROM ingredients WHERE name ILIKE '%glyceryl%stearate%' LIMIT 1), 2.00),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%olivem%1000%' LIMIT 1), 6.00),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%squalane%' LIMIT 1), 2.00),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%caprylic%capric%triglyceride%' OR name ILIKE '%capric%caprylic%' LIMIT 1), 7.00),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%oat%oil%' LIMIT 1), 1.00),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%avocado%oil%' LIMIT 1), 2.00),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%isoamyl%laurate%' OR name ILIKE '%cetiol%c5%' LIMIT 1), 3.00);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(12, (SELECT id FROM ingredients WHERE name ILIKE '%calendula%extract%' LIMIT 1), 1.00),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%oat%extract%' OR name ILIKE '%water%soluble%oat%' LIMIT 1), 1.00),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%sea%buckthorn%' LIMIT 1), 0.10),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80),
(12, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.30);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 12;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 12
GROUP BY f.name;

COMMIT;