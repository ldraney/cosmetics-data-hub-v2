-- Fix batch of duplicate formulas using same Excel data
-- These are duplicates of formulas we already fixed

BEGIN;

-- Fix Aloe Vera Gel (ID: 32) - same as ID 27 we already fixed
DELETE FROM formula_ingredients WHERE formula_id = 32;
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(32, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 91.50),
(32, (SELECT id FROM ingredients WHERE name ILIKE '%clearthix%s%' OR name ILIKE '%xanthan%gum%' LIMIT 1), 1.00),
(32, (SELECT id FROM ingredients WHERE name ILIKE '%propanediol%' LIMIT 1), 3.00),
(32, (SELECT id FROM ingredients WHERE name ILIKE '%butylene%glycol%' LIMIT 1), 3.00),
(32, (SELECT id FROM ingredients WHERE name ILIKE '%aloe%vera%' LIMIT 1), 0.50),
(32, (SELECT id FROM ingredients WHERE name ILIKE '%hyaluronic%acid%' LIMIT 1), 0.20),
(32, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80);

-- Fix Hydrating Serum (ID: 40) - same as ID 39 we already fixed  
DELETE FROM formula_ingredients WHERE formula_id = 40;
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(40, (SELECT id FROM ingredients WHERE name ILIKE '%water%' OR name ILIKE '%aqua%' LIMIT 1), 85.00),
(40, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(40, (SELECT id FROM ingredients WHERE name ILIKE '%niacinamide%' LIMIT 1), 1.50),
(40, (SELECT id FROM ingredients WHERE name ILIKE '%siligel%' OR name ILIKE '%silica%' LIMIT 1), 0.60),
(40, (SELECT id FROM ingredients WHERE name ILIKE '%olive%unsaponifiables%' LIMIT 1), 2.00),
(40, (SELECT id FROM ingredients WHERE name ILIKE '%oliwax%lc%' OR name ILIKE '%olive%wax%' LIMIT 1), 1.00),
(40, (SELECT id FROM ingredients WHERE name ILIKE '%olivem%1000%' LIMIT 1), 1.00),
(40, (SELECT id FROM ingredients WHERE name ILIKE '%olive%squalane%' OR name ILIKE '%squalane%' LIMIT 1), 1.50),
(40, (SELECT id FROM ingredients WHERE name ILIKE '%sea%kelp%bioferment%' OR name ILIKE '%kelp%bioferment%' LIMIT 1), 2.50),
(40, (SELECT id FROM ingredients WHERE name ILIKE '%seaweed%extract%' OR name ILIKE '%laminaria%digitata%' LIMIT 1), 1.00),
(40, (SELECT id FROM ingredients WHERE name ILIKE '%snow%mushroom%' OR name ILIKE '%tremella%' LIMIT 1), 1.00),
(40, (SELECT id FROM ingredients WHERE name ILIKE '%lactic%acid%' LIMIT 1), 0.10),
(40, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80);

-- Fix Plant-Based Gel Cleanser (ID: 47) - same as ID 17 we already fixed
DELETE FROM formula_ingredients WHERE formula_id = 47;
INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage) VALUES
(47, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 57.65),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 2.00),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%aloe%juice%' OR name ILIKE '%aloe%vera%' LIMIT 1), 1.00),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%panthenol%' LIMIT 1), 0.10),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%iselux%ultra%mild%' OR name ILIKE '%sodium%cocoyl%isethionate%' LIMIT 1), 30.00),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%sodium%coco%sulfate%' LIMIT 1), 1.00),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%leucidal%liquid%' OR name ILIKE '%leuconostoc%' LIMIT 1), 2.00),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%phytofoam%' LIMIT 1), 1.00),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%crodarom%seafoam%' OR name ILIKE '%seafoam%' LIMIT 1), 0.20),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%sea%moist%' LIMIT 1), 0.01),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%cucumber%extract%' LIMIT 1), 1.00),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%oat%extract%' LIMIT 1), 1.00),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%blueberry%extract%' LIMIT 1), 1.00),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.40),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%biosil%pa%' OR name ILIKE '%silica%' LIMIT 1), 0.24),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%white%willow%bark%' OR name ILIKE '%willowbark%' LIMIT 1), 1.00),
(47, (SELECT id FROM ingredients WHERE name ILIKE '%sodium%chloride%' OR name ILIKE '%salt%' LIMIT 1), 0.40);

-- Update all formula statuses
UPDATE formulas SET status = 'approved', review_reasons = NULL, updated_date = CURRENT_TIMESTAMP 
WHERE id IN (32, 40, 47);

COMMIT;