-- Inserir casas de fé fake
INSERT INTO public.casas_fe (user_id, nome_lider, email, telefone, endereco, campus, rede, horario_reuniao, dias_semana, geracao, nome_dupla, telefone_dupla, email_dupla) VALUES
('5e0694f9-a1ab-4190-8633-b29ac95e3315', 'Maria Silva', 'maria.silva@minc.com', '31987654321', 'Rua das Flores, 123', 'MINC Pampulha', 'Gerar', '19:30:00', ARRAY['Terça-feira'], 'Primeira', 'João Pedro', '31987654322', 'joao.pedro@minc.com'),
('5e0694f9-a1ab-4190-8633-b29ac95e3315', 'Carlos Mendes', 'carlos.mendes@minc.com', '31988776655', 'Av. Contorno, 456', 'MINC Pampulha', 'Ative', '20:30:00', ARRAY['Quarta-feira'], 'Primeira', 'Ana Paula', '31988776656', 'ana.paula@minc.com'),
('5e0694f9-a1ab-4190-8633-b29ac95e3315', 'Fernanda Costa', 'fernanda.costa@minc.com', '31999887766', 'Rua São Paulo, 789', 'MINC São José da Lapa', '', '19:00:00', ARRAY['Quinta-feira'], 'Primeira', 'Ricardo Lima', '31999887767', 'ricardo.lima@minc.com'),
('5e0694f9-a1ab-4190-8633-b29ac95e3315', 'Pedro Alves', 'pedro.alves@minc.com', '31991122334', 'Rua Minas Gerais, 321', 'MINC Pampulha', 'Avance', '20:00:00', ARRAY['Sexta-feira'], 'Primeira', 'Juliana Santos', '31991122335', 'juliana.santos@minc.com'),
('5e0694f9-a1ab-4190-8633-b29ac95e3315', 'Beatriz Rocha', 'beatriz.rocha@minc.com', '31992233445', 'Av. Brasil, 654', 'MINC Ribeirão das Neves', '', '18:30:00', ARRAY['Sábado'], 'Primeira', 'Felipe Nunes', '31992233446', 'felipe.nunes@minc.com'),
('5e0694f9-a1ab-4190-8633-b29ac95e3315', 'Lucas Martins', 'lucas.martins@minc.com', '31993344556', 'Rua Bahia, 987', 'MINC Pampulha', 'Nexo', '19:30:00', ARRAY['Segunda-feira'], 'Primeira', 'Camila Souza', '31993344557', 'camila.souza@minc.com'),
('5e0694f9-a1ab-4190-8633-b29ac95e3315', 'Amanda Oliveira', 'amanda.oliveira@minc.com', '31994455667', 'Rua Rio, 147', 'MINC Juiz de Fora', '', '20:00:00', ARRAY['Terça-feira'], 'Primeira', 'Thiago Dias', '31994455668', 'thiago.dias@minc.com');

-- Inserir membros e relatórios
DO $$
DECLARE
  casa_maria UUID;
  casa_carlos UUID;
  casa_fernanda UUID;
  casa_pedro UUID;
  casa_beatriz UUID;
  casa_lucas UUID;
  casa_amanda UUID;
BEGIN
  SELECT id INTO casa_maria FROM casas_fe WHERE nome_lider = 'Maria Silva';
  SELECT id INTO casa_carlos FROM casas_fe WHERE nome_lider = 'Carlos Mendes';
  SELECT id INTO casa_fernanda FROM casas_fe WHERE nome_lider = 'Fernanda Costa';
  SELECT id INTO casa_pedro FROM casas_fe WHERE nome_lider = 'Pedro Alves';
  SELECT id INTO casa_beatriz FROM casas_fe WHERE nome_lider = 'Beatriz Rocha';
  SELECT id INTO casa_lucas FROM casas_fe WHERE nome_lider = 'Lucas Martins';
  SELECT id INTO casa_amanda FROM casas_fe WHERE nome_lider = 'Amanda Oliveira';

  -- Membros
  INSERT INTO public.membros (casa_fe_id, nome_completo, telefone, idade, endereco, aceitou_jesus, reconciliou_jesus, notas) VALUES
  (casa_maria, 'Rafael Santos', '31987654323', 25, 'Rua A, 100', true, false, 'Muito participativo'),
  (casa_maria, 'Gabriela Lima', '31987654324', 22, 'Rua B, 200', true, true, 'Sempre presente'),
  (casa_maria, 'Daniel Costa', '31987654325', 28, 'Rua C, 300', false, false, 'Novo na célula'),
  (casa_maria, 'Letícia Souza', '31987654326', 24, 'Rua D, 400', true, false, NULL),
  (casa_carlos, 'Marcos Pereira', '31988776657', 30, 'Av. E, 500', true, true, 'Líder em treinamento'),
  (casa_carlos, 'Patrícia Alves', '31988776658', 27, 'Av. F, 600', true, false, 'Músico na igreja'),
  (casa_carlos, 'Bruno Dias', '31988776659', 23, 'Av. G, 700', false, false, NULL),
  (casa_fernanda, 'Rodrigo Nunes', '31999887768', 26, 'Rua H, 800', true, false, 'Voluntário ativo'),
  (casa_fernanda, 'Vanessa Rocha', '31999887769', 29, 'Rua I, 900', true, true, NULL),
  (casa_fernanda, 'Diego Martins', '31999887770', 21, 'Rua J, 1000', false, false, 'Visitante'),
  (casa_fernanda, 'Carla Silva', '31999887771', 24, 'Rua K, 1100', true, false, NULL),
  (casa_fernanda, 'Felipe Santos', '31999887772', 27, 'Rua L, 1200', true, true, 'Coordenador de eventos'),
  (casa_pedro, 'Gustavo Lima', '31991122336', 22, 'Rua M, 1300', true, false, NULL),
  (casa_pedro, 'Mariana Costa', '31991122337', 25, 'Rua N, 1400', true, true, 'Intercessora'),
  (casa_pedro, 'Thiago Souza', '31991122338', 28, 'Rua O, 1500', false, false, NULL),
  (casa_beatriz, 'Leonardo Alves', '31992233447', 24, 'Av. P, 1600', true, false, 'Novo convertido'),
  (casa_beatriz, 'Isabela Dias', '31992233448', 26, 'Av. Q, 1700', true, true, NULL),
  (casa_beatriz, 'Ricardo Nunes', '31992233449', 31, 'Av. R, 1800', true, false, 'Tesoureiro'),
  (casa_beatriz, 'Julia Rocha', '31992233450', 23, 'Av. S, 1900', false, false, NULL),
  (casa_lucas, 'André Martins', '31993344558', 27, 'Rua T, 2000', true, true, NULL),
  (casa_lucas, 'Fernanda Silva', '31993344559', 24, 'Rua U, 2100', true, false, 'Professora de EBD'),
  (casa_lucas, 'Paulo Santos', '31993344560', 29, 'Rua V, 2200', false, false, NULL),
  (casa_lucas, 'Camila Lima', '31993344561', 22, 'Rua W, 2300', true, true, NULL),
  (casa_amanda, 'Gabriel Costa', '31994455669', 25, 'Rua X, 2400', true, false, NULL),
  (casa_amanda, 'Renata Souza', '31994455670', 28, 'Rua Y, 2500', true, true, 'Líder de louvor'),
  (casa_amanda, 'Vinicius Alves', '31994455671', 26, 'Rua Z, 2600', true, false, NULL);

  -- Presenças Casa Maria
  INSERT INTO public.presencas (membro_id, data_reuniao, presente)
  SELECT id, '2025-09-09', true FROM membros WHERE casa_fe_id = casa_maria;
  
  INSERT INTO public.presencas (membro_id, data_reuniao, presente)
  SELECT id, '2025-09-16', true FROM membros WHERE casa_fe_id = casa_maria AND nome_completo != 'Daniel Costa';
  
  INSERT INTO public.presencas (membro_id, data_reuniao, presente)
  SELECT id, '2025-09-23', true FROM membros WHERE casa_fe_id = casa_maria;

  -- Presenças Casa Carlos
  INSERT INTO public.presencas (membro_id, data_reuniao, presente)
  SELECT id, '2025-09-10', true FROM membros WHERE casa_fe_id = casa_carlos;
  
  INSERT INTO public.presencas (membro_id, data_reuniao, presente)
  SELECT id, '2025-09-17', true FROM membros WHERE casa_fe_id = casa_carlos AND nome_completo != 'Bruno Dias';

  -- Presenças Casa Fernanda
  INSERT INTO public.presencas (membro_id, data_reuniao, presente)
  SELECT id, '2025-09-11', true FROM membros WHERE casa_fe_id = casa_fernanda;
  
  INSERT INTO public.presencas (membro_id, data_reuniao, presente)
  SELECT id, '2025-09-18', true FROM membros WHERE casa_fe_id = casa_fernanda;
  
  INSERT INTO public.presencas (membro_id, data_reuniao, presente)
  SELECT id, '2025-09-25', true FROM membros WHERE casa_fe_id = casa_fernanda AND nome_completo != 'Diego Martins';

  -- Presenças Casa Pedro
  INSERT INTO public.presencas (membro_id, data_reuniao, presente)
  SELECT id, '2025-09-12', true FROM membros WHERE casa_fe_id = casa_pedro;
  
  INSERT INTO public.presencas (membro_id, data_reuniao, presente)
  SELECT id, '2025-09-19', true FROM membros WHERE casa_fe_id = casa_pedro;

  -- Relatórios
  INSERT INTO public.relatorios (casa_fe_id, data_reuniao, notas) VALUES
  (casa_maria, '2025-09-09', 'Reunião maravilhosa! Todos participaram ativamente. Estudamos sobre fé e vimos 2 decisões por Cristo.'),
  (casa_maria, '2025-09-16', 'Reunião focada em oração. Daniel faltou mas já entrei em contato. Ótima participação do grupo.'),
  (casa_maria, '2025-09-23', 'Estudo sobre o amor de Deus. Presença total! Momento de louvor foi muito forte.'),
  (casa_carlos, '2025-09-10', 'Primeira reunião do mês! Todos presentes e animados. Tema: propósito de vida.'),
  (casa_carlos, '2025-09-17', 'Bruno não compareceu, vamos acompanhá-lo. Ótimo estudo sobre perdão.'),
  (casa_fernanda, '2025-09-11', 'Reunião cheia! 5 pessoas presentes. Estudo sobre família foi muito relevante.'),
  (casa_fernanda, '2025-09-18', 'Segunda reunião excelente. Tempo de testemunhos foi edificante.'),
  (casa_fernanda, '2025-09-25', 'Diego não veio mas enviou mensagem. Estudo sobre discipulado.'),
  (casa_pedro, '2025-09-12', 'Reunião tranquila com os 3 membros. Comunhão muito boa!'),
  (casa_pedro, '2025-09-19', 'Segunda reunião do mês. Estudo sobre gratidão foi impactante.');

END $$;