-- Fix Niacinamide Serum percentages 
-- Formula ID: 28, Current total: 317.8% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 28;

-- Insert correct percentages from Excel sheet "(46)Niacinamide Serum NIAC-003"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(28, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 78.80),
(28, (SELECT id FROM ingredients WHERE name ILIKE '%clearthix%s%' OR name ILIKE '%carbomer%' LIMIT 1), 0.80),
(28, (SELECT id FROM ingredients WHERE name ILIKE '%niacinamide%' LIMIT 1), 10.00),
(28, (SELECT id FROM ingredients WHERE name ILIKE '%acetyl%glucosamine%' LIMIT 1), 0.30),
(28, (SELECT id FROM ingredients WHERE name ILIKE '%butylene%glycol%' LIMIT 1), 5.00);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(28, (SELECT id FROM ingredients WHERE name ILIKE '%rice%water%ferment%' LIMIT 1), 0.20),
(28, (SELECT id FROM ingredients WHERE name ILIKE '%pterowhite%' OR name ILIKE '%resveratrol%' LIMIT 1), 0.10);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(28, (SELECT id FROM ingredients WHERE name ILIKE '%inulin%' LIMIT 1), 1.00),
(28, (SELECT id FROM ingredients WHERE name ILIKE '%wsk%' OR name ILIKE '%snow%mushroom%' LIMIT 1), 1.00),
(28, (SELECT id FROM ingredients WHERE name ILIKE '%sea%kelp%bioferment%' OR name ILIKE '%kelp%bioferment%' LIMIT 1), 2.00),
(28, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 28;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 28
GROUP BY f.name;

COMMIT;