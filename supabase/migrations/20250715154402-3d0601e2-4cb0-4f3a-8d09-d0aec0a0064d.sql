-- Limpar dados existentes e recriar estrutura do quiz
-- Primeiro, vamos limpar os dados existentes
TRUNCATE TABLE quiz_answers CASCADE;
TRUNCATE TABLE quiz_options CASCADE;
TRUNCATE TABLE quiz_questions CASCADE;
TRUNCATE TABLE quiz_modules CASCADE;
TRUNCATE TABLE quiz_submissions CASCADE;
TRUNCATE TABLE quiz_respostas_completas CASCADE;

-- Inserir o Módulo 1: Identificação e Perfil do Empreendedor
INSERT INTO quiz_modules (id, title, description, order_number) VALUES 
('mod-1-identificacao-perfil', 'Identificação e Perfil do Empreendedor', 'Todo negócio reflete a visão e o estilo de quem o lidera. Compreender seu perfil como empreendedor é o ponto de partida para alinhar suas forças pessoais à estratégia da empresa e construir um caminho de sucesso autêntico.', 1);

-- Inserir as questões do Módulo 1
INSERT INTO quiz_questions (id, module_id, text, type, required, order_number) VALUES 
('q1-nome-completo', 'mod-1-identificacao-perfil', 'Nome Completo', 'text', true, 1),
('q2-estilo-lideranca', 'mod-1-identificacao-perfil', 'Como você descreveria seu estilo de liderança?', 'radio', true, 2),
('q3-essencial-resultados', 'mod-1-identificacao-perfil', 'O que você considera essencial para alcançar resultados no seu negócio?', 'radio', true, 3),
('q4-tomada-decisoes', 'mod-1-identificacao-perfil', 'Ao tomar decisões, sua preferência é:', 'radio', true, 4),
('q5-dia-ideal', 'mod-1-identificacao-perfil', 'Em um dia ideal, o que te faz sentir realizado?', 'radio', true, 5),
('q6-influencia-personalidade', 'mod-1-identificacao-perfil', 'Como você percebe a influência da sua personalidade no sucesso do negócio?', 'radio', true, 6);

-- Inserir as opções para a questão 2 (Estilo de liderança)
INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
('q2-opt1', 'q2-estilo-lideranca', 'Idealista e visionário', 1),
('q2-opt2', 'q2-estilo-lideranca', 'Comunicativo e colaborativo', 2),
('q2-opt3', 'q2-estilo-lideranca', 'Organizado e meticuloso', 3),
('q2-opt4', 'q2-estilo-lideranca', 'Focado e determinado', 4),
('q2-opt5', 'q2-estilo-lideranca', 'Analítico e cauteloso', 5);

-- Inserir as opções para a questão 3 (Essencial para resultados)
INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
('q3-opt1', 'q3-essencial-resultados', 'Inovação e liberdade para novas ideias', 1),
('q3-opt2', 'q3-essencial-resultados', 'Colaboração e relações interpessoais', 2),
('q3-opt3', 'q3-essencial-resultados', 'Planejamento rigoroso e controle de detalhes', 3),
('q3-opt4', 'q3-essencial-resultados', 'Foco e execução rápida', 4),
('q3-opt5', 'q3-essencial-resultados', 'Tomada de decisão baseada em dados', 5);

-- Inserir as opções para a questão 4 (Tomada de decisões)
INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
('q4-opt1', 'q4-tomada-decisoes', 'Experimentar abordagens ousadas', 1),
('q4-opt2', 'q4-tomada-decisoes', 'Consultar a equipe e buscar consenso', 2),
('q4-opt3', 'q4-tomada-decisoes', 'Analisar todos os dados disponíveis', 3),
('q4-opt4', 'q4-tomada-decisoes', 'Agir de forma rápida e assertiva', 4),
('q4-opt5', 'q4-tomada-decisoes', 'Delegar decisões quando possível', 5);

-- Inserir as opções para a questão 5 (Dia ideal)
INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
('q5-opt1', 'q5-dia-ideal', 'Desenvolver inovações e soluções criativas', 1),
('q5-opt2', 'q5-dia-ideal', 'Fortalecer relações e trabalhar em equipe', 2),
('q5-opt3', 'q5-dia-ideal', 'Seguir e atingir metas planejadas', 3),
('q5-opt4', 'q5-dia-ideal', 'Superar desafios e resolver problemas', 4),
('q5-opt5', 'q5-dia-ideal', 'Inspirar e liderar com propósito', 5);

-- Inserir as opções para a questão 6 (Influência da personalidade)
INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
('q6-opt1', 'q6-influencia-personalidade', 'Permite identificar oportunidades únicas', 1),
('q6-opt2', 'q6-influencia-personalidade', 'Fortalece o relacionamento com clientes e equipe', 2),
('q6-opt3', 'q6-influencia-personalidade', 'Garante processos bem estruturados', 3),
('q6-opt4', 'q6-influencia-personalidade', 'Impulsiona a tomada de decisões rápidas', 4),
('q6-opt5', 'q6-influencia-personalidade', 'Permite ajustar estratégias conforme o cenário', 5);