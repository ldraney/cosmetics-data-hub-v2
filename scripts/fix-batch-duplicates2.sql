-- Fix remaining duplicate formulas

BEGIN;

-- Fix Anti-Pollution Serum (ID: 43) - same as ID 35 we already fixed
DELETE FROM formula_ingredients WHERE formula_id = 43;
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(43, (SELECT id FROM ingredients WHERE name ILIKE '%grapeseed%oil%' OR name ILIKE '%grape%seed%oil%' LIMIT 1), 82.30),
(43, (SELECT id FROM ingredients WHERE name ILIKE '%cranberry%seed%oil%' LIMIT 1), 2.00),
(43, (SELECT id FROM ingredients WHERE name ILIKE '%pomegranate%seed%oil%' LIMIT 1), 2.00),
(43, (SELECT id FROM ingredients WHERE name ILIKE '%baobab%seed%oil%' LIMIT 1), 2.00),
(43, (SELECT id FROM ingredients WHERE name ILIKE '%pumpkin%seed%oil%' LIMIT 1), 2.00),
(43, (SELECT id FROM ingredients WHERE name ILIKE '%tocopherol%' OR name ILIKE '%vitamin%e%' LIMIT 1), 2.00),
(43, (SELECT id FROM ingredients WHERE name ILIKE '%sunflower%oil%' LIMIT 1), 1.00),
(43, (SELECT id FROM ingredients WHERE name ILIKE '%jojoba%oil%' LIMIT 1), 5.00),
(43, (SELECT id FROM ingredients WHERE name ILIKE '%borage%oil%' LIMIT 1), 1.00),
(43, (SELECT id FROM ingredients WHERE name ILIKE '%apple%fruit%stem%cell%' OR name ILIKE '%malus%domestica%' LIMIT 1), 0.10),
(43, (SELECT id FROM ingredients WHERE name ILIKE '%argan%sprout%stem%cell%' OR name ILIKE '%argania%spinosa%' LIMIT 1), 0.10),
(43, (SELECT id FROM ingredients WHERE name ILIKE '%sweet%orange%eo%' LIMIT 1), 0.20),
(43, (SELECT id FROM ingredients WHERE name ILIKE '%neroli%eo%' LIMIT 1), 0.20),
(43, (SELECT id FROM ingredients WHERE name ILIKE '%calendula%' LIMIT 1), 0.10);

-- Fix Replenish Body Oil (ID: 24) - same as ID 26 we already fixed
DELETE FROM formula_ingredients WHERE formula_id = 24;
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(24, (SELECT id FROM ingredients WHERE name ILIKE '%safflower%' LIMIT 1), 34.20),
(24, (SELECT id FROM ingredients WHERE name ILIKE '%mct%' OR name ILIKE '%caprylic%capric%triglyceride%' LIMIT 1), 20.00),
(24, (SELECT id FROM ingredients WHERE name ILIKE '%aloe%sunflower%oil%' LIMIT 1), 10.00),
(24, (SELECT id FROM ingredients WHERE name ILIKE '%apricot%' LIMIT 1), 25.00),
(24, (SELECT id FROM ingredients WHERE name ILIKE '%jojoba%oil%' LIMIT 1), 5.00),
(24, (SELECT id FROM ingredients WHERE name ILIKE '%tocopherol%' OR name ILIKE '%vitamin%e%' LIMIT 1), 2.00),
(24, (SELECT id FROM ingredients WHERE name ILIKE '%evening%primrose%oil%' LIMIT 1), 2.00),
(24, (SELECT id FROM ingredients WHERE name ILIKE '%rosehip%seed%oil%' LIMIT 1), 1.00),
(24, (SELECT id FROM ingredients WHERE name ILIKE '%rosemary%antioxidant%' OR name ILIKE '%rosemary%extract%' LIMIT 1), 0.10),
(24, (SELECT id FROM ingredients WHERE name ILIKE '%algae%extract%sunflower%' LIMIT 1), 0.50),
(24, (SELECT id FROM ingredients WHERE name ILIKE '%blue%chamomile%' OR name ILIKE '%chamomile%' LIMIT 1), 0.20);

-- Update formula statuses
UPDATE formulas SET status = 'approved', review_reasons = NULL, updated_date = CURRENT_TIMESTAMP 
WHERE id IN (43, 24);

COMMIT;