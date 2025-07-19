-- Fix Phyto-Renew Night Serum percentages 
-- Formula ID: 25, Current total: 196.30% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 25;

-- Insert correct percentages from Excel sheet "(43)Phyto-Renew Night Serum LR-"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(25, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(25, (SELECT id FROM ingredients WHERE name ILIKE '%siligel%' OR name ILIKE '%xanthan%gum%' LIMIT 1), 0.50);

-- Phase A'
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(25, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 61.80),
(25, (SELECT id FROM ingredients WHERE name ILIKE '%aloe%vera%gel%juice%' OR name ILIKE '%aloe%vera%' LIMIT 1), 2.00),
(25, (SELECT id FROM ingredients WHERE name ILIKE '%neroli%hydrosol%' LIMIT 1), 10.00);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(25, (SELECT id FROM ingredients WHERE name ILIKE '%rosehip%oil%' LIMIT 1), 2.00),
(25, (SELECT id FROM ingredients WHERE name ILIKE '%squalane%' LIMIT 1), 1.00),
(25, (SELECT id FROM ingredients WHERE name ILIKE '%olivem%1000%' LIMIT 1), 1.00),
(25, (SELECT id FROM ingredients WHERE name ILIKE '%oliwax%lc%' OR name ILIKE '%cetyl%palmitate%' LIMIT 1), 0.70);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(25, (SELECT id FROM ingredients WHERE name ILIKE '%white%willow%bark%' OR name ILIKE '%willowbark%' LIMIT 1), 2.00),
(25, (SELECT id FROM ingredients WHERE name ILIKE '%fruit%acid%complex%' OR name ILIKE '%natural%fruit%blend%' LIMIT 1), 10.00),
(25, (SELECT id FROM ingredients WHERE name ILIKE '%fruit%enzyme%complex%' LIMIT 1), 3.00),
(25, (SELECT id FROM ingredients WHERE name ILIKE '%phytocoll%marine%' OR name ILIKE '%marine%collagen%' LIMIT 1), 2.00),
(25, (SELECT id FROM ingredients WHERE name ILIKE '%leucidal%liquid%sf%' OR name ILIKE '%lactobacillus%ferment%' LIMIT 1), 2.00);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 25;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 25
GROUP BY f.name;

COMMIT;