-- Adicionar coluna de geração nas casas de fé
ALTER TABLE public.casas_fe 
ADD COLUMN geracao text NOT NULL DEFAULT 'Primeira';

-- Adicionar coluna de reconciliação nos membros
ALTER TABLE public.membros 
ADD COLUMN reconciliou_jesus boolean NOT NULL DEFAULT false;

-- Criar tabela de relatórios
CREATE TABLE public.relatorios (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casa_fe_id uuid NOT NULL,
  data_reuniao date NOT NULL,
  notas text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(casa_fe_id, data_reuniao)
);

-- Enable RLS
ALTER TABLE public.relatorios ENABLE ROW LEVEL SECURITY;

-- RLS Policies para relatórios
CREATE POLICY "Users can create relatorios for their casa de fe"
ON public.relatorios
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM casas_fe
    WHERE casas_fe.id = relatorios.casa_fe_id
    AND casas_fe.user_id = auth.uid()
  )
);

CREATE POLICY "Users can view relatorios of their casa de fe"
ON public.relatorios
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM casas_fe
    WHERE casas_fe.id = relatorios.casa_fe_id
    AND casas_fe.user_id = auth.uid()
  )
);

CREATE POLICY "Admins can view all relatorios"
ON public.relatorios
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users can update relatorios of their casa de fe"
ON public.relatorios
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM casas_fe
    WHERE casas_fe.id = relatorios.casa_fe_id
    AND casas_fe.user_id = auth.uid()
  )
);