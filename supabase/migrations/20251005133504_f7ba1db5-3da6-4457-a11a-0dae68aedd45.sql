-- Create casas_fe table
CREATE TABLE public.casas_fe (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  nome_lider TEXT NOT NULL,
  email TEXT NOT NULL,
  telefone TEXT NOT NULL,
  endereco TEXT NOT NULL,
  campus TEXT NOT NULL,
  rede TEXT NOT NULL,
  datas_reunioes JSONB NOT NULL DEFAULT '[]'::jsonb,
  horario_reuniao TIME NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create membros table
CREATE TABLE public.membros (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  casa_fe_id UUID NOT NULL REFERENCES public.casas_fe(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  telefone TEXT NOT NULL,
  idade INTEGER NOT NULL CHECK (idade >= 0),
  endereco TEXT NOT NULL,
  aceitou_jesus BOOLEAN NOT NULL DEFAULT false,
  notas TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create presencas table
CREATE TABLE public.presencas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  membro_id UUID NOT NULL REFERENCES public.membros(id) ON DELETE CASCADE,
  data_reuniao DATE NOT NULL,
  presente BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.casas_fe ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.membros ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.presencas ENABLE ROW LEVEL SECURITY;

-- RLS Policies for casas_fe
CREATE POLICY "Users can view their own casa de fe" 
ON public.casas_fe FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own casa de fe" 
ON public.casas_fe FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own casa de fe" 
ON public.casas_fe FOR UPDATE 
USING (auth.uid() = user_id);

-- RLS Policies for membros
CREATE POLICY "Users can view membros of their casa de fe" 
ON public.membros FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.casas_fe 
    WHERE casas_fe.id = membros.casa_fe_id 
    AND casas_fe.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create membros for their casa de fe" 
ON public.membros FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.casas_fe 
    WHERE casas_fe.id = membros.casa_fe_id 
    AND casas_fe.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update membros of their casa de fe" 
ON public.membros FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.casas_fe 
    WHERE casas_fe.id = membros.casa_fe_id 
    AND casas_fe.user_id = auth.uid()
  )
);

CREATE POLICY "Users can delete membros of their casa de fe" 
ON public.membros FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.casas_fe 
    WHERE casas_fe.id = membros.casa_fe_id 
    AND casas_fe.user_id = auth.uid()
  )
);

-- RLS Policies for presencas
CREATE POLICY "Users can view presencas of their casa de fe members" 
ON public.presencas FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.membros 
    JOIN public.casas_fe ON casas_fe.id = membros.casa_fe_id 
    WHERE membros.id = presencas.membro_id 
    AND casas_fe.user_id = auth.uid()
  )
);

CREATE POLICY "Users can create presencas for their casa de fe members" 
ON public.presencas FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.membros 
    JOIN public.casas_fe ON casas_fe.id = membros.casa_fe_id 
    WHERE membros.id = presencas.membro_id 
    AND casas_fe.user_id = auth.uid()
  )
);

CREATE POLICY "Users can update presencas of their casa de fe members" 
ON public.presencas FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.membros 
    JOIN public.casas_fe ON casas_fe.id = membros.casa_fe_id 
    WHERE membros.id = presencas.membro_id 
    AND casas_fe.user_id = auth.uid()
  )
);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_casas_fe_updated_at
BEFORE UPDATE ON public.casas_fe
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_membros_updated_at
BEFORE UPDATE ON public.membros
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_casas_fe_user_id ON public.casas_fe(user_id);
CREATE INDEX idx_membros_casa_fe_id ON public.membros(casa_fe_id);
CREATE INDEX idx_presencas_membro_id ON public.presencas(membro_id);
CREATE INDEX idx_presencas_data_reuniao ON public.presencas(data_reuniao);