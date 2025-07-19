-- Import Biome Restoration Cream Cleanser (PEL-CCL-002)
-- Converting decimal percentages to regular percentages (0.04 = 4%)

BEGIN;

-- Insert the formula
INSERT INTO formulas (name, status, created_date, updated_date)
VALUES ('Biome Restoration Cream Cleanser', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Get the formula ID (this will be the next available ID)
DO $$ 
DECLARE
  formula_id INTEGER;
BEGIN
  SELECT id INTO formula_id FROM formulas WHERE name = 'Biome Restoration Cream Cleanser';
  
  -- Phase A
  INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage, created_date) VALUES
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 4.00, CURRENT_TIMESTAMP),
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%solagum%ax%' OR name ILIKE '%acacia%senegal%' LIMIT 1), 1.00, CURRENT_TIMESTAMP);
  
  -- Phase A'
  INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage, created_date) VALUES
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%water%' LIMIT 1), 67.90, CURRENT_TIMESTAMP),
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%tetrasodium%glutamate%diacetate%' OR name ILIKE '%chelating%' LIMIT 1), 0.50, CURRENT_TIMESTAMP),
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%rice%water%ferment%' LIMIT 1), 4.00, CURRENT_TIMESTAMP);
  
  -- Phase B
  INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage, created_date) VALUES
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%shea%butter%' LIMIT 1), 4.00, CURRENT_TIMESTAMP),
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%olivem%1000%' LIMIT 1), 8.00, CURRENT_TIMESTAMP),
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%cetearyl%alcohol%' LIMIT 1), 2.00, CURRENT_TIMESTAMP),
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%squalane%' LIMIT 1), 4.00, CURRENT_TIMESTAMP);
  
  -- Phase C
  INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage, created_date) VALUES
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%coco%glucoside%' LIMIT 1), 2.00, CURRENT_TIMESTAMP),
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%licorice%extract%' LIMIT 1), 1.00, CURRENT_TIMESTAMP),
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80, CURRENT_TIMESTAMP),
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%lactic%acid%' LIMIT 1), 0.30, CURRENT_TIMESTAMP);
  
  -- Log the result
  RAISE NOTICE 'Imported formula ID: %', formula_id;
END $$;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.name = 'Biome Restoration Cream Cleanser'
GROUP BY f.name;

COMMIT;