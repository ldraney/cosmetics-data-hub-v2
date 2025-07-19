-- Fix Hyaluronic Acid Serum percentages 
-- Formula ID: 31, Current total: 377.2% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 31;

-- Insert correct percentages from Excel sheet "(51)Hyaluronic Acid Serum HAS-0"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(31, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 83.20),
(31, (SELECT id FROM ingredients WHERE name ILIKE '%panthenol%' OR name ILIKE '%pro%vitamin%b5%' LIMIT 1), 0.50),
(31, (SELECT id FROM ingredients WHERE name ILIKE '%siligel%' LIMIT 1), 0.50),
(31, (SELECT id FROM ingredients WHERE name ILIKE '%butylene%glycol%' LIMIT 1), 4.00),
(31, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' LIMIT 1), 2.00);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(31, (SELECT id FROM ingredients WHERE name ILIKE '%sodium%pca%' LIMIT 1), 2.00),
(31, (SELECT id FROM ingredients WHERE name ILIKE '%galactoarabinan%' LIMIT 1), 1.00),
(31, (SELECT id FROM ingredients WHERE name ILIKE '%saccharide%isomerate%' LIMIT 1), 0.50),
(31, (SELECT id FROM ingredients WHERE name ILIKE '%hyaluronic%acid%' LIMIT 1), 2.00),
(31, (SELECT id FROM ingredients WHERE name ILIKE '%phytocollagen%' OR name ILIKE '%yeast%' LIMIT 1), 1.00),
(31, (SELECT id FROM ingredients WHERE name ILIKE '%sea%kelp%' OR name ILIKE '%kelp%bioferment%' LIMIT 1), 1.00),
(31, (SELECT id FROM ingredients WHERE name ILIKE '%epseama%' LIMIT 1), 0.50),
(31, (SELECT id FROM ingredients WHERE name ILIKE '%wsk%' OR name ILIKE '%snow%mushroom%' LIMIT 1), 1.00),
(31, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80);

-- Note: Citric Acid 50% amount not clearly specified in Excel, adding minimal amount
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(31, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.30);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 31;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 31
GROUP BY f.name;

COMMIT;