-- Fix Night Moisturizer percentages based on Excel data
-- Formula ID: 41, Current total: 609.85%

BEGIN;

-- Clear existing formula ingredients for Night Moisturizer
DELETE FROM formula_ingredients WHERE formula_id = 41;

-- Insert correct percentages from Excel sheet "(62) Night Moisturizer"
-- Based on manual extraction from Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(41, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' OR name ILIKE '%propandiol%' LIMIT 1), 3.00),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%aloe%vera%' LIMIT 1), 0.05),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%siligel%' LIMIT 1), 0.30);

-- Phase A'
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(41, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 63.85);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(41, (SELECT id FROM ingredients WHERE name ILIKE '%olivem%1000%' LIMIT 1), 6.00),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%behenyl%alcohol%' LIMIT 1), 1.00),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%glyceryl%stearate%' LIMIT 1), 2.00),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%sweet%almond%oil%' LIMIT 1), 2.00),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%squalane%' LIMIT 1), 0.50),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%pelemol%' LIMIT 1), 5.00),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%meadowfoam%' LIMIT 1), 1.00),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%shea%butter%' LIMIT 1), 1.50),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%cocoa%butter%' LIMIT 1), 1.50),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%avocado%oil%' LIMIT 1), 1.00),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%coco%caprylate%' LIMIT 1), 2.00),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%macadamia%' OR name ILIKE '%mac%nut%' LIMIT 1), 1.00),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%tocopherol%' OR name ILIKE '%vitamin%e%' LIMIT 1), 1.00);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(41, (SELECT id FROM ingredients WHERE name ILIKE '%calendula%' LIMIT 1), 0.80),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%chamomile%' LIMIT 1), 0.50),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%red%clover%' LIMIT 1), 0.50),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%evening%primrose%' LIMIT 1), 0.50),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%blueberry%' LIMIT 1), 1.00),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80),
(41, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.40);

-- Add any missing ingredients that weren't found
-- These would need to be added to ingredients table first if they don't exist

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 41;

-- Check final percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 41
GROUP BY f.name;

COMMIT;