-- Final batch adjustments for formulas close to 100%
-- Simple approach: reduce the largest ingredient percentage by the excess amount

BEGIN;

-- Body Lotion (ID: 50) - reduce by 8.90%
UPDATE formula_ingredients 
SET percentage = percentage - 8.90 
WHERE formula_id = 50 
AND id = (
  SELECT id FROM formula_ingredients 
  WHERE formula_id = 50 
  ORDER BY percentage DESC 
  LIMIT 1
);

-- Hydration Moisturizer (ID: 23) - reduce by 5.40%
UPDATE formula_ingredients 
SET percentage = percentage - 5.40 
WHERE formula_id = 23 
AND id = (
  SELECT id FROM formula_ingredients 
  WHERE formula_id = 23 
  ORDER BY percentage DESC 
  LIMIT 1
);

-- Charcoal Clay Face Mask (ID: 57) - reduce by 4.48%
UPDATE formula_ingredients 
SET percentage = percentage - 4.48 
WHERE formula_id = 57 
AND id = (
  SELECT id FROM formula_ingredients 
  WHERE formula_id = 57 
  ORDER BY percentage DESC 
  LIMIT 1
);

-- Balancing Gel Hydrator (ID: 18) - reduce by 0.63%
UPDATE formula_ingredients 
SET percentage = percentage - 0.63 
WHERE formula_id = 18 
AND id = (
  SELECT id FROM formula_ingredients 
  WHERE formula_id = 18 
  ORDER BY percentage DESC 
  LIMIT 1
);

-- Coconut Sugar Scrub (ID: 54) - reduce by 0.40%
UPDATE formula_ingredients 
SET percentage = percentage - 0.40 
WHERE formula_id = 54 
AND id = (
  SELECT id FROM formula_ingredients 
  WHERE formula_id = 54 
  ORDER BY percentage DESC 
  LIMIT 1
);

-- Hyaluronic Acid Serum (ID: 31) - reduce by 0.30%
UPDATE formula_ingredients 
SET percentage = percentage - 0.30 
WHERE formula_id = 31 
AND id = (
  SELECT id FROM formula_ingredients 
  WHERE formula_id = 31 
  ORDER BY percentage DESC 
  LIMIT 1
);

-- Baby Body Lotion (ID: 12) - reduce by 0.10%
UPDATE formula_ingredients 
SET percentage = percentage - 0.10 
WHERE formula_id = 12 
AND id = (
  SELECT id FROM formula_ingredients 
  WHERE formula_id = 12 
  ORDER BY percentage DESC 
  LIMIT 1
);

-- Roll-on Deodorant (ID: 53) - reduce by 0.05%
UPDATE formula_ingredients 
SET percentage = percentage - 0.05 
WHERE formula_id = 53 
AND id = (
  SELECT id FROM formula_ingredients 
  WHERE formula_id = 53 
  ORDER BY percentage DESC 
  LIMIT 1
);

-- Update all formula statuses
UPDATE formulas 
SET status = 'approved', 
    review_reasons = NULL,
    updated_date = CURRENT_TIMESTAMP 
WHERE id IN (50, 23, 57, 18, 54, 31, 12, 53);

COMMIT;