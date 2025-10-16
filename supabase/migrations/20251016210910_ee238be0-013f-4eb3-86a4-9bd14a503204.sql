-- Adicionar novos campos obrigatórios à tabela casas_fe
ALTER TABLE public.casas_fe
ADD COLUMN IF NOT EXISTS tipo_documento text,
ADD COLUMN IF NOT EXISTS numero_documento text,
ADD COLUMN IF NOT EXISTS facilitador_1_batizado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS rede_minc_facilitador_2 text,
ADD COLUMN IF NOT EXISTS facilitador_2_batizado boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS nome_anfitriao text,
ADD COLUMN IF NOT EXISTS whatsapp_anfitriao text,
ADD COLUMN IF NOT EXISTS rua_avenida text,
ADD COLUMN IF NOT EXISTS numero_casa text,
ADD COLUMN IF NOT EXISTS bairro text,
ADD COLUMN IF NOT EXISTS cep text,
ADD COLUMN IF NOT EXISTS cidade text,
ADD COLUMN IF NOT EXISTS ponto_referencia text;