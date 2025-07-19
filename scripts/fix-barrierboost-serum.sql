-- Fix BarrierBoost Ceramide Serum percentages 
-- Formula ID: 36, Current total: 520.7% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 36;

-- Insert correct percentages from Excel sheet "(57)BarrierBoost Ceramide Serum"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(36, (SELECT id FROM ingredients WHERE name ILIKE '%siligel%' LIMIT 1), 0.80),
(36, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' LIMIT 1), 4.00),
(36, (SELECT id FROM ingredients WHERE name ILIKE '%phytic%acid%' LIMIT 1), 0.10);

-- Phase A'
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(36, (SELECT id FROM ingredients WHERE name ILIKE '%water%' OR name ILIKE '%aqua%' LIMIT 1), 80.70),
(36, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(36, (SELECT id FROM ingredients WHERE name ILIKE '%ceracare%ceramide%' OR name ILIKE '%ceramide%' LIMIT 1), 0.50);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(36, (SELECT id FROM ingredients WHERE name ILIKE '%squalane%' LIMIT 1), 1.00),
(36, (SELECT id FROM ingredients WHERE name ILIKE '%coco%caprylate%' LIMIT 1), 1.00),
(36, (SELECT id FROM ingredients WHERE name ILIKE '%eumulgin%sg%' LIMIT 1), 1.00),
(36, (SELECT id FROM ingredients WHERE name ILIKE '%olivem%1000%' LIMIT 1), 2.00),
(36, (SELECT id FROM ingredients WHERE name ILIKE '%oleyl%lactate%' LIMIT 1), 1.00),
(36, (SELECT id FROM ingredients WHERE name ILIKE '%isoamyl%laurate%' OR name ILIKE '%pelemol%9512%' LIMIT 1), 2.00),
(36, (SELECT id FROM ingredients WHERE name ILIKE '%pelemol%d5r%' LIMIT 1), 1.00);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(36, (SELECT id FROM ingredients WHERE name ILIKE '%beta%glucan%' LIMIT 1), 1.00),
(36, (SELECT id FROM ingredients WHERE name ILIKE '%sodium%hyaluronate%' OR name ILIKE '%hyaluronic%acid%' LIMIT 1), 0.50),
(36, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80),
(36, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.30);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 36;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 36
GROUP BY f.name;

COMMIT;