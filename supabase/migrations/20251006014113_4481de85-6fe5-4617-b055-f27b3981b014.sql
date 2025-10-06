-- Adicionar foreign key constraint na tabela relatorios
ALTER TABLE public.relatorios
ADD CONSTRAINT relatorios_casa_fe_id_fkey 
FOREIGN KEY (casa_fe_id) 
REFERENCES public.casas_fe(id) 
ON DELETE CASCADE;