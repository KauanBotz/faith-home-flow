-- Atualizar schema para usar dias da semana ao invés de datas específicas
ALTER TABLE public.casas_fe 
  DROP COLUMN IF EXISTS datas_reunioes;

ALTER TABLE public.casas_fe 
  ADD COLUMN dias_semana text[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.casas_fe.dias_semana IS 'Dias da semana que acontecem as reuniões (ex: ["Segunda", "Quarta", "Sexta"])';
