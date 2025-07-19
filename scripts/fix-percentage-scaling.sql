-- Fix percentage scaling for newly imported formulas
-- Excel percentages were interpreted as decimals (75% became 0.75 instead of 75)

BEGIN;

-- Get formulas with very low total percentages (likely decimal issue)
SELECT 
  f.id,
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
GROUP BY f.id, f.name
HAVING SUM(fi.percentage) < 10  -- Likely decimal conversion issue
ORDER BY SUM(fi.percentage);

-- Fix by scaling up by factor of 100 for formulas with totals < 10
UPDATE formula_ingredients 
SET percentage = percentage * 100
WHERE formula_id IN (
  SELECT f.id 
  FROM formulas f
  JOIN formula_ingredients fi ON f.id = fi.formula_id
  GROUP BY f.id
  HAVING SUM(fi.percentage) < 10
);

-- Also fix formulas with totals between 10-90 (likely need scaling)
UPDATE formula_ingredients 
SET percentage = percentage * 100
WHERE formula_id IN (
  SELECT f.id 
  FROM formulas f
  JOIN formula_ingredients fi ON f.id = fi.formula_id
  GROUP BY f.id
  HAVING SUM(fi.percentage) BETWEEN 10 AND 90
);

COMMIT;