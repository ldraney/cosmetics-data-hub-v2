-- Simple verification queries to check database health

-- 1. Overall database health
SELECT 
  'DATABASE HEALTH SUMMARY' as check_type,
  COUNT(*) as total_formulas,
  COUNT(CASE WHEN EXISTS (
    SELECT 1 FROM formula_ingredients fi 
    WHERE fi.formula_id = f.id 
    GROUP BY fi.formula_id 
    HAVING SUM(fi.percentage) BETWEEN 95 AND 105
  ) THEN 1 END) as well_balanced_formulas,
  ROUND(AVG((
    SELECT SUM(fi.percentage) 
    FROM formula_ingredients fi 
    WHERE fi.formula_id = f.id
  ))::numeric, 2) as avg_percentage,
  ROUND((COUNT(CASE WHEN EXISTS (
    SELECT 1 FROM formula_ingredients fi 
    WHERE fi.formula_id = f.id 
    GROUP BY fi.formula_id 
    HAVING SUM(fi.percentage) BETWEEN 95 AND 105
  ) THEN 1 END) * 100.0 / COUNT(*))::numeric, 1) as health_percentage
FROM formulas f;

-- 2. Formulas outside acceptable range
SELECT 
  'FORMULAS NEEDING REVIEW' as check_type,
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
GROUP BY f.id, f.name
HAVING SUM(fi.percentage) NOT BETWEEN 95 AND 105
ORDER BY SUM(fi.percentage) DESC;

-- 3. Ingredient catalog size
SELECT 
  'INGREDIENT CATALOG' as check_type,
  COUNT(*) as total_ingredients
FROM ingredients;

-- 4. Recent imports (formulas created today/recently)
SELECT 
  'RECENT IMPORTS' as check_type,
  COUNT(*) as formulas_created_today
FROM formulas 
WHERE created_date >= CURRENT_DATE;

-- 5. Sample of well-balanced formulas
SELECT 
  'SAMPLE WELL-BALANCED FORMULAS' as check_type,
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as total_percentage,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
GROUP BY f.id, f.name
HAVING SUM(fi.percentage) BETWEEN 98 AND 102
ORDER BY f.name
LIMIT 10;