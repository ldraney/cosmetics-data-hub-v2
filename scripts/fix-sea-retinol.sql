-- Fix Nurturing Sea-Retinol Serum percentages 
-- Formula ID: 48, Current total: 303.94% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 48;

-- Insert correct percentages from Excel sheet "(69) Nurturing Sea-Retinol Seru"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(48, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' LIMIT 1), 4.00),
(48, (SELECT id FROM ingredients WHERE name ILIKE '%siligel%' LIMIT 1), 1.00);

-- Phase A'
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(48, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 84.94),
(48, (SELECT id FROM ingredients WHERE name ILIKE '%banana%fruit%juice%' OR name ILIKE '%banana%extract%' LIMIT 1), 0.50),
(48, (SELECT id FROM ingredients WHERE name ILIKE '%betaine%salicylate%' LIMIT 1), 2.00);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(48, (SELECT id FROM ingredients WHERE name ILIKE '%dimethyl%sulfone%' OR name ILIKE '%msm%' LIMIT 1), 1.00),
(48, (SELECT id FROM ingredients WHERE name ILIKE '%beta%glucan%' LIMIT 1), 1.00),
(48, (SELECT id FROM ingredients WHERE name ILIKE '%laminaria%digitata%' LIMIT 1), 1.00),
(48, (SELECT id FROM ingredients WHERE name ILIKE '%siddha%campo%green%' OR name ILIKE '%campo%green%' LIMIT 1), 0.05),
(48, (SELECT id FROM ingredients WHERE name ILIKE '%siddha%campo%blue%' OR name ILIKE '%campo%blue%' LIMIT 1), 0.01),
(48, (SELECT id FROM ingredients WHERE name ILIKE '%sea%kelp%bioferment%' OR name ILIKE '%kelp%bioferment%' LIMIT 1), 1.00),
(48, (SELECT id FROM ingredients WHERE name ILIKE '%inulin%' LIMIT 1), 0.30),
(48, (SELECT id FROM ingredients WHERE name ILIKE '%laminaria%saccharina%' LIMIT 1), 1.00),
(48, (SELECT id FROM ingredients WHERE name ILIKE '%cucumber%melon%' OR name ILIKE '%scent%' LIMIT 1), 0.40),
(48, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80),
(48, (SELECT id FROM ingredients WHERE name ILIKE '%sea%samphire%' OR name ILIKE '%vitaphira%' LIMIT 1), 1.00);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 48;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 48
GROUP BY f.name;

COMMIT;