-- Fix Wholesome Detox Reset Serum percentages 
-- Formula ID: 44, Current total: 298.00% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 44;

-- Insert correct percentages from Excel sheet "(65) Wholesome Detox Reset Seru"
-- Based on manual reading of Excel data - this is a simple oil blend

-- Phase A (all ingredients)
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(44, (SELECT id FROM ingredients WHERE name ILIKE '%safflower%oil%' LIMIT 1), 50.00),
(44, (SELECT id FROM ingredients WHERE name ILIKE '%caprylic%capric%triglyceride%' OR name ILIKE '%cct%' LIMIT 1), 40.00),
(44, (SELECT id FROM ingredients WHERE name ILIKE '%black%cumin%seed%oil%' LIMIT 1), 1.00),
(44, (SELECT id FROM ingredients WHERE name ILIKE '%tamanu%oil%' LIMIT 1), 1.00),
(44, (SELECT id FROM ingredients WHERE name ILIKE '%sweet%almond%oil%' LIMIT 1), 1.00),
(44, (SELECT id FROM ingredients WHERE name ILIKE '%squalane%' LIMIT 1), 5.00),
(44, (SELECT id FROM ingredients WHERE name ILIKE '%kiwi%oil%' LIMIT 1), 0.50),
(44, (SELECT id FROM ingredients WHERE name ILIKE '%linolenic%' OR name ILIKE '%linoleic%acid%' OR name ILIKE '%vitamin%f%' LIMIT 1), 0.20),
(44, (SELECT id FROM ingredients WHERE name ILIKE '%bakuchiol%' LIMIT 1), 0.10),
(44, (SELECT id FROM ingredients WHERE name ILIKE '%seaweed%extract%' LIMIT 1), 0.40),
(44, (SELECT id FROM ingredients WHERE name ILIKE '%bisabolol%' LIMIT 1), 0.10),
(44, (SELECT id FROM ingredients WHERE name ILIKE '%bamboo%charcoal%' OR name ILIKE '%charcoal%' LIMIT 1), 0.50),
(44, (SELECT id FROM ingredients WHERE name ILIKE '%plum%fruit%extract%' LIMIT 1), 0.20);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 44;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 44
GROUP BY f.name;

COMMIT;