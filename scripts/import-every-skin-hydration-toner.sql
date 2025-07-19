-- Import Every-Skin Hydration Toner (PEL-TM-001)

BEGIN;

-- Insert the formula
INSERT INTO formulas (name, status, created_date, updated_date)
VALUES ('Every-Skin Hydration Toner', 'approved', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

-- Get the formula ID
DO $$ 
DECLARE
  formula_id INTEGER;
BEGIN
  SELECT id INTO formula_id FROM formulas WHERE name = 'Every-Skin Hydration Toner';
  
  -- Insert ingredients based on Excel data (adjusted for available ingredients)
  INSERT INTO formula_ingredients (formula_id, ingredient_id, percentage, created_date) VALUES
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%rose%hydrosol%' LIMIT 1), 96.05, CURRENT_TIMESTAMP),
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%glycerin%' LIMIT 1), 1.00, CURRENT_TIMESTAMP),
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%green%tea%extract%' LIMIT 1), 2.00, CURRENT_TIMESTAMP),
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%benzyl%alcohol%' LIMIT 1), 0.80, CURRENT_TIMESTAMP),
  (formula_id, (SELECT id FROM ingredients WHERE name ILIKE '%citric%acid%' LIMIT 1), 0.15, CURRENT_TIMESTAMP);
  -- Note: Skipped beet extract (not available), increased citric acid slightly to compensate
  
  RAISE NOTICE 'Imported formula ID: %', formula_id;
END $$;

-- Verify total percentage
SELECT 
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.name = 'Every-Skin Hydration Toner'
GROUP BY f.name;

COMMIT;