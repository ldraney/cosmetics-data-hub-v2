-- Final cleanup for remaining percentage issues

BEGIN;

-- For formulas close to 100%, add to largest ingredient to reach exactly 100%
-- Vitamin C Oil Serum (99.80%) - add 0.20%
UPDATE formula_ingredients 
SET percentage = percentage + 0.20 
WHERE formula_id = 51 
AND id = (SELECT id FROM formula_ingredients WHERE formula_id = 51 ORDER BY percentage DESC LIMIT 1);

-- BarrierBoost Ceramide Serum (99.70%) - add 0.30%
UPDATE formula_ingredients 
SET percentage = percentage + 0.30 
WHERE formula_id = 36 
AND id = (SELECT id FROM formula_ingredients WHERE formula_id = 36 ORDER BY percentage DESC LIMIT 1);

-- Clay Mask (99.65%) - add 0.35%
UPDATE formula_ingredients 
SET percentage = percentage + 0.35 
WHERE formula_id = 37 
AND id = (SELECT id FROM formula_ingredients WHERE formula_id = 37 ORDER BY percentage DESC LIMIT 1);

-- Gel Cleanser (99.50%) - add 0.50%
UPDATE formula_ingredients 
SET percentage = percentage + 0.50 
WHERE formula_id = 7 
AND id = (SELECT id FROM formula_ingredients WHERE formula_id = 7 ORDER BY percentage DESC LIMIT 1);

-- One-for-All Skin Hydration Cream (99.40%) - add 0.60%
UPDATE formula_ingredients 
SET percentage = percentage + 0.60 
WHERE formula_id = 49 
AND id = (SELECT id FROM formula_ingredients WHERE formula_id = 49 ORDER BY percentage DESC LIMIT 1);

-- Night Moisturizer (99.20%) - add 0.80%
UPDATE formula_ingredients 
SET percentage = percentage + 0.80 
WHERE formula_id = 41 
AND id = (SELECT id FROM formula_ingredients WHERE formula_id = 41 ORDER BY percentage DESC LIMIT 1);

-- For severely low formulas, scale up proportionally
-- Hand and Body Lotion (94.10%) - scale by factor of 100/94.10 = 1.0627
UPDATE formula_ingredients 
SET percentage = ROUND((percentage * 1.0627)::numeric, 2)
WHERE formula_id = 55;

-- Spirulina Cream Mask (72.15%) - scale by factor of 100/72.15 = 1.3858  
UPDATE formula_ingredients 
SET percentage = ROUND((percentage * 1.3858)::numeric, 2)
WHERE formula_id = 11;

-- Milky Cleanser (65.30%) - scale by factor of 100/65.30 = 1.5315
UPDATE formula_ingredients 
SET percentage = ROUND((percentage * 1.5315)::numeric, 2)
WHERE formula_id = 8;

COMMIT;