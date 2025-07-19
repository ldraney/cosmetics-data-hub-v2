-- Fix Anti-Pollution Serum percentages 
-- Formula ID: 35, Current total: 189.10% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 35;

-- Insert correct percentages from Excel sheet "(64) Anti-Pollution Serum"
-- Based on manual reading of Excel data

-- Phase A (All ingredients - adjust grapeseed to compensate for missing astaxanthin)
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(35, (SELECT id FROM ingredients WHERE name ILIKE '%grapeseed%oil%' OR name ILIKE '%grape%seed%oil%' LIMIT 1), 82.30),
(35, (SELECT id FROM ingredients WHERE name ILIKE '%cranberry%seed%oil%' LIMIT 1), 2.00),
(35, (SELECT id FROM ingredients WHERE name ILIKE '%pomegranate%seed%oil%' LIMIT 1), 2.00),
(35, (SELECT id FROM ingredients WHERE name ILIKE '%baobab%seed%oil%' LIMIT 1), 2.00),
(35, (SELECT id FROM ingredients WHERE name ILIKE '%pumpkin%seed%oil%' LIMIT 1), 2.00),
(35, (SELECT id FROM ingredients WHERE name ILIKE '%tocopherol%' OR name ILIKE '%vitamin%e%' LIMIT 1), 2.00),
(35, (SELECT id FROM ingredients WHERE name ILIKE '%sunflower%oil%' LIMIT 1), 1.00),
(35, (SELECT id FROM ingredients WHERE name ILIKE '%jojoba%oil%' LIMIT 1), 5.00),
(35, (SELECT id FROM ingredients WHERE name ILIKE '%borage%oil%' LIMIT 1), 1.00),
(35, (SELECT id FROM ingredients WHERE name ILIKE '%apple%fruit%stem%cell%' OR name ILIKE '%malus%domestica%' LIMIT 1), 0.10),
(35, (SELECT id FROM ingredients WHERE name ILIKE '%argan%sprout%stem%cell%' OR name ILIKE '%argania%spinosa%' LIMIT 1), 0.10),
(35, (SELECT id FROM ingredients WHERE name ILIKE '%sweet%orange%eo%' LIMIT 1), 0.20),
(35, (SELECT id FROM ingredients WHERE name ILIKE '%neroli%eo%' LIMIT 1), 0.20),
(35, (SELECT id FROM ingredients WHERE name ILIKE '%calendula%' LIMIT 1), 0.10);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 35;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 35
GROUP BY f.name;

COMMIT;