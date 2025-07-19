-- Fix Foaming Hand Wash percentages 
-- Formula ID: 30, Current total: 268.30% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 30;

-- Insert correct percentages from Excel sheet "(50)Foaming Hand Wash SFHW-002"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(30, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 78.30),
(30, (SELECT id FROM ingredients WHERE name ILIKE '%coco%betaine%' LIMIT 1), 10.00),
(30, (SELECT id FROM ingredients WHERE name ILIKE '%alpha%olefin%sulfonate%' LIMIT 1), 3.00),
(30, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 6.00),
(30, (SELECT id FROM ingredients WHERE name ILIKE '%lauramine%oxide%' LIMIT 1), 1.00),
(30, (SELECT id FROM ingredients WHERE name ILIKE '%glyceryl%caprylate%' OR name ILIKE '%glyceryl%caprate%' LIMIT 1), 0.50),
(30, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.40);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(30, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 30;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 30
GROUP BY f.name;

COMMIT;