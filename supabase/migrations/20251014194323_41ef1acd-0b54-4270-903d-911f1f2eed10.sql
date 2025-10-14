-- Tabela para palavra do pastor (apenas admin pode criar/editar)
CREATE TABLE public.palavra_pastor (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  titulo TEXT NOT NULL,
  conteudo TEXT NOT NULL, -- formato markdown
  data_publicacao DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para testemunhos (qualquer líder pode adicionar)
CREATE TABLE public.testemunhos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casa_fe_id UUID NOT NULL REFERENCES casas_fe(id) ON DELETE CASCADE,
  nome_pessoa TEXT NOT NULL,
  testemunho TEXT NOT NULL,
  data_testemunho DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Tabela para orações (qualquer líder pode adicionar)
CREATE TABLE public.oracoes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casa_fe_id UUID NOT NULL REFERENCES casas_fe(id) ON DELETE CASCADE,
  pedido TEXT NOT NULL,
  data_oracao DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.palavra_pastor ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testemunhos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.oracoes ENABLE ROW LEVEL SECURITY;

-- RLS Policies para palavra_pastor
CREATE POLICY "Todos podem ver palavra do pastor"
ON public.palavra_pastor FOR SELECT
USING (true);

CREATE POLICY "Apenas admins podem criar palavra do pastor"
ON public.palavra_pastor FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem editar palavra do pastor"
ON public.palavra_pastor FOR UPDATE
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Apenas admins podem deletar palavra do pastor"
ON public.palavra_pastor FOR DELETE
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies para testemunhos
CREATE POLICY "Todos podem ver testemunhos"
ON public.testemunhos FOR SELECT
USING (true);

CREATE POLICY "Líderes podem criar testemunhos da sua casa"
ON public.testemunhos FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM casas_fe
    WHERE casas_fe.id = testemunhos.casa_fe_id
    AND casas_fe.user_id = auth.uid()
  )
);

CREATE POLICY "Admins podem ver todos testemunhos"
ON public.testemunhos FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- RLS Policies para orações
CREATE POLICY "Todos podem ver orações"
ON public.oracoes FOR SELECT
USING (true);

CREATE POLICY "Líderes podem criar orações da sua casa"
ON public.oracoes FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM casas_fe
    WHERE casas_fe.id = oracoes.casa_fe_id
    AND casas_fe.user_id = auth.uid()
  )
);

CREATE POLICY "Admins podem ver todas orações"
ON public.oracoes FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Trigger para updated_at
CREATE TRIGGER update_palavra_pastor_updated_at
BEFORE UPDATE ON public.palavra_pastor
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();