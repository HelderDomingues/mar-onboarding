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
(gen_random_uuid(), 'Identificação e Perfil do Empreendedor', 'Todo negócio reflete a visão e o estilo de quem o lidera. Compreender seu perfil como empreendedor é o ponto de partida para alinhar suas forças pessoais à estratégia da empresa e construir um caminho de sucesso autêntico.', 1);

-- Definir variáveis para IDs
DO $$
DECLARE
    module_id uuid;
    q1_id uuid := gen_random_uuid();
    q2_id uuid := gen_random_uuid();
    q3_id uuid := gen_random_uuid();
    q4_id uuid := gen_random_uuid();
    q5_id uuid := gen_random_uuid();
    q6_id uuid := gen_random_uuid();
BEGIN
    -- Obter o ID do módulo inserido
    SELECT id INTO module_id FROM quiz_modules WHERE order_number = 1;
    
    -- Inserir as questões do Módulo 1
    INSERT INTO quiz_questions (id, module_id, text, type, required, order_number) VALUES 
    (q1_id, module_id, 'Nome Completo', 'text', true, 1),
    (q2_id, module_id, 'Como você descreveria seu estilo de liderança?', 'radio', true, 2),
    (q3_id, module_id, 'O que você considera essencial para alcançar resultados no seu negócio?', 'radio', true, 3),
    (q4_id, module_id, 'Ao tomar decisões, sua preferência é:', 'radio', true, 4),
    (q5_id, module_id, 'Em um dia ideal, o que te faz sentir realizado?', 'radio', true, 5),
    (q6_id, module_id, 'Como você percebe a influência da sua personalidade no sucesso do negócio?', 'radio', true, 6);

    -- Inserir as opções para a questão 2 (Estilo de liderança)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q2_id, 'Idealista e visionário', 1),
    (gen_random_uuid(), q2_id, 'Comunicativo e colaborativo', 2),
    (gen_random_uuid(), q2_id, 'Organizado e meticuloso', 3),
    (gen_random_uuid(), q2_id, 'Focado e determinado', 4),
    (gen_random_uuid(), q2_id, 'Analítico e cauteloso', 5);

    -- Inserir as opções para a questão 3 (Essencial para resultados)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q3_id, 'Inovação e liberdade para novas ideias', 1),
    (gen_random_uuid(), q3_id, 'Colaboração e relações interpessoais', 2),
    (gen_random_uuid(), q3_id, 'Planejamento rigoroso e controle de detalhes', 3),
    (gen_random_uuid(), q3_id, 'Foco e execução rápida', 4),
    (gen_random_uuid(), q3_id, 'Tomada de decisão baseada em dados', 5);

    -- Inserir as opções para a questão 4 (Tomada de decisões)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q4_id, 'Experimentar abordagens ousadas', 1),
    (gen_random_uuid(), q4_id, 'Consultar a equipe e buscar consenso', 2),
    (gen_random_uuid(), q4_id, 'Analisar todos os dados disponíveis', 3),
    (gen_random_uuid(), q4_id, 'Agir de forma rápida e assertiva', 4),
    (gen_random_uuid(), q4_id, 'Delegar decisões quando possível', 5);

    -- Inserir as opções para a questão 5 (Dia ideal)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q5_id, 'Desenvolver inovações e soluções criativas', 1),
    (gen_random_uuid(), q5_id, 'Fortalecer relações e trabalhar em equipe', 2),
    (gen_random_uuid(), q5_id, 'Seguir e atingir metas planejadas', 3),
    (gen_random_uuid(), q5_id, 'Superar desafios e resolver problemas', 4),
    (gen_random_uuid(), q5_id, 'Inspirar e liderar com propósito', 5);

    -- Inserir as opções para a questão 6 (Influência da personalidade)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q6_id, 'Permite identificar oportunidades únicas', 1),
    (gen_random_uuid(), q6_id, 'Fortalece o relacionamento com clientes e equipe', 2),
    (gen_random_uuid(), q6_id, 'Garante processos bem estruturados', 3),
    (gen_random_uuid(), q6_id, 'Impulsiona a tomada de decisões rápidas', 4),
    (gen_random_uuid(), q6_id, 'Permite ajustar estratégias conforme o cenário', 5);
END $$;