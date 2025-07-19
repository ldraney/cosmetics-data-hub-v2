-- Fix Nurturing Balm Cream percentages 
-- Formula ID: 13, Current total: 307.8% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 13;

-- Insert correct percentages from Excel sheet "(30)Nurturing Balm Cream Balm-V"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(13, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 27.90),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%aloe%vera%' LIMIT 1), 10.00),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%eumulgin%sg%' LIMIT 1), 0.50),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' LIMIT 1), 5.20),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.20);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(13, (SELECT id FROM ingredients WHERE name ILIKE '%coco%caprylate%' LIMIT 1), 10.00),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%coconut%oil%' LIMIT 1), 5.00),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%mango%butter%' LIMIT 1), 8.00),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%kokum%butter%' LIMIT 1), 4.00),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%olive%oil%' LIMIT 1), 1.00),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%meadowfoam%seed%oil%' LIMIT 1), 1.70),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%poppy%seed%oil%' LIMIT 1), 0.20),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%rice%bran%oil%' OR name ILIKE '%ricebran%oil%' LIMIT 1), 1.00),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%caprylic%capric%triglyceride%' OR name ILIKE '%cct%' LIMIT 1), 10.00),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%squalane%' LIMIT 1), 2.00),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%oliwax%' LIMIT 1), 2.00),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%glyceryl%stearate%' LIMIT 1), 1.00),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%cetearyl%alcohol%' LIMIT 1), 2.00),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%hydrogenated%vegetable%oil%' OR name ILIKE '%lipidthix%' LIMIT 1), 7.00);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(13, (SELECT id FROM ingredients WHERE name ILIKE '%blue%tansy%' OR name ILIKE '%tansy%essential%oil%' LIMIT 1), 0.30),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%red%campo%' LIMIT 1), 0.10),
(13, (SELECT id FROM ingredients WHERE name ILIKE '%blue%campo%' LIMIT 1), 0.10);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 13;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 13
GROUP BY f.name;

COMMIT;