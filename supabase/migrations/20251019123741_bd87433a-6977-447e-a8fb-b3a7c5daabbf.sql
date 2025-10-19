-- Alterar colunas para permitir NULL e ajustar tipo
ALTER TABLE public.casas_fe 
  ALTER COLUMN telefone_dupla DROP NOT NULL,
  ALTER COLUMN whatsapp_anfitriao DROP NOT NULL,
  ALTER COLUMN cep DROP NOT NULL,
  ALTER COLUMN numero_casa TYPE TEXT,
  ALTER COLUMN numero_casa DROP NOT NULL;