-- Remove a política que permite busca pública por telefone
DROP POLICY IF EXISTS "Permitir busca por telefone" ON public.casas_fe;