-- Fix percentage scaling safely within database constraints

BEGIN;

-- First, identify formulas that need scaling (total < 10, indicating decimal conversion issue)
CREATE TEMPORARY TABLE formulas_to_scale AS
SELECT f.id, f.name, SUM(fi.percentage) as current_total
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
GROUP BY f.id, f.name
HAVING SUM(fi.percentage) < 10;

-- Show what we're going to fix
SELECT 'Formulas to scale:' as status;
SELECT id, name, current_total FROM formulas_to_scale ORDER BY current_total;

-- Update these formulas by multiplying percentages by 100
-- But cap at 99.99 to stay within constraint
UPDATE formula_ingredients 
SET percentage = LEAST(percentage * 100, 99.99)
WHERE formula_id IN (SELECT id FROM formulas_to_scale);

-- Show results
SELECT 'After scaling:' as status;
SELECT 
  f.id,
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as new_total,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id IN (SELECT id FROM formulas_to_scale)
GROUP BY f.id, f.name
ORDER BY new_total DESC;

COMMIT;