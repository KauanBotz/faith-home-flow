-- Adicionar campos da dupla na tabela casas_fe
ALTER TABLE public.casas_fe
ADD COLUMN nome_dupla TEXT,
ADD COLUMN telefone_dupla TEXT,
ADD COLUMN email_dupla TEXT;