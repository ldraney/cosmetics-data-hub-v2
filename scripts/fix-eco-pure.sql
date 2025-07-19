-- Fix Eco-Pure Moisturizer percentages 
-- Formula ID: 33, Current total: 199.00% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 33;

-- Insert correct percentages from Excel sheet "(54)Eco-Pure Moisturizer"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(33, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 76.50),
(33, (SELECT id FROM ingredients WHERE name ILIKE '%sepinov%emt10%' OR name ILIKE '%hydroxyethyl%acrylate%' LIMIT 1), 2.50);

-- Phase A'
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(33, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(33, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' LIMIT 1), 2.00);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(33, (SELECT id FROM ingredients WHERE name ILIKE '%neoessence%squalane%' OR name ILIKE '%squalane%' LIMIT 1), 2.00),
(33, (SELECT id FROM ingredients WHERE name ILIKE '%jeechem%ctg%' OR name ILIKE '%caprylic%capric%triglyceride%' OR name ILIKE '%cct%' LIMIT 1), 8.00),
(33, (SELECT id FROM ingredients WHERE name ILIKE '%natura%tec%plantsil%' OR name ILIKE '%hydrogenated%ethylhexyl%olivate%' LIMIT 1), 2.00),
(33, (SELECT id FROM ingredients WHERE name ILIKE '%coco%caprylate%caprate%' LIMIT 1), 4.00);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(33, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80),
(33, (SELECT id FROM ingredients WHERE name ILIKE '%triluronic%acid%' OR name ILIKE '%sodium%hyaluronate%' LIMIT 1), 0.10),
(33, (SELECT id FROM ingredients WHERE name ILIKE '%hydrolyzed%oat%protein%' OR name ILIKE '%oat%extract%' LIMIT 1), 0.10);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 33;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 33
GROUP BY f.name;

COMMIT;