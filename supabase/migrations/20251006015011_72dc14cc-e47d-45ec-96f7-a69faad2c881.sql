-- Update presencas dates to be between Oct 20 and Nov 14, 2025
WITH numbered_presencas AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at) as rn,
         COUNT(*) OVER () as total
  FROM presencas
  WHERE data_reuniao < DATE '2025-10-20' OR data_reuniao > DATE '2025-11-14'
)
UPDATE presencas
SET data_reuniao = DATE '2025-10-20' + ((numbered_presencas.rn - 1) * 25 / NULLIF(numbered_presencas.total, 0))::integer
FROM numbered_presencas
WHERE presencas.id = numbered_presencas.id;

-- Update relatorios dates to be between Oct 20 and Nov 14, 2025
-- Using ROW_NUMBER partitioned by casa_fe_id to avoid duplicates
WITH numbered_relatorios AS (
  SELECT id, casa_fe_id,
         ROW_NUMBER() OVER (PARTITION BY casa_fe_id ORDER BY created_at) as rn
  FROM relatorios
  WHERE data_reuniao < DATE '2025-10-20' OR data_reuniao > DATE '2025-11-14'
)
UPDATE relatorios
SET data_reuniao = DATE '2025-10-20' + ((numbered_relatorios.rn - 1) * 3)::integer
FROM numbered_relatorios
WHERE relatorios.id = numbered_relatorios.id;