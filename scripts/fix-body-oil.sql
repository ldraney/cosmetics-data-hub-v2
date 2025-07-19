-- Fix Replenish Body Oil percentages 
-- Formula ID: 26, Current total: 179.20% -> Target: ~100%

BEGIN;

-- Clear existing formula ingredients
DELETE FROM formula_ingredients WHERE formula_id = 26;

-- Insert correct percentages from Excel sheet "(42)Replenish Body Oil"
-- Based on manual reading of Excel data

-- Phase A (All ingredients)
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(26, (SELECT id FROM ingredients WHERE name ILIKE '%safflower%' LIMIT 1), 34.20),
(26, (SELECT id FROM ingredients WHERE name ILIKE '%mct%' OR name ILIKE '%caprylic%capric%triglyceride%' LIMIT 1), 20.00),
(26, (SELECT id FROM ingredients WHERE name ILIKE '%aloe%sunflower%oil%' LIMIT 1), 10.00),
(26, (SELECT id FROM ingredients WHERE name ILIKE '%apricot%' LIMIT 1), 25.00),
(26, (SELECT id FROM ingredients WHERE name ILIKE '%jojoba%oil%' LIMIT 1), 5.00),
(26, (SELECT id FROM ingredients WHERE name ILIKE '%tocopherol%' OR name ILIKE '%vitamin%e%' LIMIT 1), 2.00),
(26, (SELECT id FROM ingredients WHERE name ILIKE '%evening%primrose%oil%' LIMIT 1), 2.00),
(26, (SELECT id FROM ingredients WHERE name ILIKE '%rosehip%seed%oil%' LIMIT 1), 1.00),
(26, (SELECT id FROM ingredients WHERE name ILIKE '%rosemary%antioxidant%' OR name ILIKE '%rosemary%extract%' LIMIT 1), 0.10),
(26, (SELECT id FROM ingredients WHERE name ILIKE '%algae%extract%sunflower%' LIMIT 1), 0.50),
(26, (SELECT id FROM ingredients WHERE name ILIKE '%blue%chamomile%' OR name ILIKE '%chamomile%' LIMIT 1), 0.20);

-- Update formula status
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id = 26;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id = 26
GROUP BY f.name;

COMMIT;