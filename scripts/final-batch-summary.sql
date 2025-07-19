-- FINAL BATCH 5 PRODUCTION UPDATE SUMMARY
-- All 7 remaining critical formulas completed locally, ready for production

SELECT 'FINAL BATCH STATUS' as status;

-- Show current production totals for comparison
SELECT 
  f.id,
  f.name,
  ROUND(SUM(fi.percentage)::numeric, 2) as current_total,
  COUNT(fi.id) as ingredient_count
FROM formulas f
JOIN formula_ingredients fi ON f.id = fi.formula_id
WHERE f.id IN (30, 46, 27, 39, 17, 35, 26)
GROUP BY f.id, f.name
ORDER BY current_total DESC;