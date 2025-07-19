-- Fix Plant-Based Gel Cleanser percentages 
-- Formula ID: 17, Current total: 233.65% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 17;

-- Insert correct percentages from Excel sheet "(68) Plant-Based Gel Cleanser"
-- Based on manual reading of Excel data

-- Phase A
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(17, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 57.65),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%aloe%juice%' OR name ILIKE '%aloe%vera%' LIMIT 1), 1.00),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%panthenol%' LIMIT 1), 0.10);

-- Phase B
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(17, (SELECT id FROM ingredients WHERE name ILIKE '%iselux%ultra%mild%' OR name ILIKE '%sodium%cocoyl%isethionate%' LIMIT 1), 30.00),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%sodium%coco%sulfate%' LIMIT 1), 1.00);

-- Phase C
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(17, (SELECT id FROM ingredients WHERE name ILIKE '%leucidal%liquid%' OR name ILIKE '%leuconostoc%' LIMIT 1), 2.00),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%phytofoam%' LIMIT 1), 1.00),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%crodarom%seafoam%' OR name ILIKE '%seafoam%' LIMIT 1), 0.20),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%sea%moist%' LIMIT 1), 0.01),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%cucumber%extract%' LIMIT 1), 1.00),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%oat%extract%' LIMIT 1), 1.00),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%blueberry%extract%' LIMIT 1), 1.00),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.40),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%biosil%pa%' OR name ILIKE '%silica%' LIMIT 1), 0.24),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%white%willow%bark%' OR name ILIKE '%willowbark%' LIMIT 1), 1.00),
(17, (SELECT id FROM ingredients WHERE name ILIKE '%sodium%chloride%' OR name ILIKE '%salt%' LIMIT 1), 0.40);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 17;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 17
GROUP BY f.name;

COMMIT;