-- Inserir o Módulo 2: Perfil da Empresa e do Mercado
INSERT INTO quiz_modules (id, title, description, order_number) VALUES 
(gen_random_uuid(), 'Perfil da Empresa e do Mercado', 'Conhecer a fundo a ''fotografia'' atual da sua empresa – seu tamanho, história, atuação e o que a torna especial para os clientes – é essencial para diagnosticar sua posição no mercado e planejar os próximos passos com realismo.', 2);

-- Definir variáveis para IDs das questões do Módulo 2
DO $$
DECLARE
    module_id uuid;
    q7_id uuid := gen_random_uuid();
    q8_id uuid := gen_random_uuid();
    q9_id uuid := gen_random_uuid();
    q10_id uuid := gen_random_uuid();
    q11_id uuid := gen_random_uuid();
    q12_id uuid := gen_random_uuid();
    q13_id uuid := gen_random_uuid();
    q14_id uuid := gen_random_uuid();
    q15_id uuid := gen_random_uuid();
    q16_id uuid := gen_random_uuid();
    q17_id uuid := gen_random_uuid();
    q18_id uuid := gen_random_uuid();
    q19_id uuid := gen_random_uuid();
BEGIN
    -- Obter o ID do módulo 2
    SELECT id INTO module_id FROM quiz_modules WHERE order_number = 2;
    
    -- Inserir as questões do Módulo 2
    INSERT INTO quiz_questions (id, module_id, text, type, required, order_number) VALUES 
    (q7_id, module_id, 'Qual o nome da sua empresa?', 'text', true, 7),
    (q8_id, module_id, 'CNPJ', 'text', true, 8),
    (q9_id, module_id, 'Qual é o endereço completo da sua empresa? Insira: Logradouro (Avenida, Rua, Travessa etc.), número, bairro, cidade e estado. CEP opcional.', 'text', true, 9),
    (q10_id, module_id, 'Qual o principal segmento de atuação?', 'radio', true, 10),
    (q11_id, module_id, 'Fale sobre a sua empresa ou negócio. Como ela começou? O que o motivou a iniciar? O que a empresa faz? Que produtos ou serviços proporciona? Inclua detalhes em sua descrição, se puder', 'textarea', true, 11),
    (q12_id, module_id, 'Há quanto tempo sua empresa está no mercado?', 'radio', true, 12),
    (q13_id, module_id, 'Qual a faixa de faturamento mensal aproximado?', 'radio', true, 13),
    (q14_id, module_id, 'Número de funcionários:', 'radio', true, 14),
    (q15_id, module_id, 'Como você avalia o potencial de crescimento nos próximos 12 meses?', 'radio', true, 15),
    (q16_id, module_id, 'Qual o principal motivo que faz seus clientes escolherem sua empresa?', 'checkbox', true, 16),
    (q17_id, module_id, 'Qual é o Instagram da sua Empresa?', 'instagram', false, 17),
    (q18_id, module_id, 'Sua empresa tem um website?', 'radio', true, 18),
    (q19_id, module_id, 'Se sua empresa tem um website, insira o link aqui:', 'url', false, 19);

    -- Inserir as opções para a questão 10 (Segmento de atuação)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q10_id, 'Indústria', 1),
    (gen_random_uuid(), q10_id, 'Comércio', 2),
    (gen_random_uuid(), q10_id, 'Serviços', 3),
    (gen_random_uuid(), q10_id, 'Outros', 4);

    -- Inserir as opções para a questão 12 (Tempo no mercado)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q12_id, 'Menos de 1 ano', 1),
    (gen_random_uuid(), q12_id, '1 a 3 anos', 2),
    (gen_random_uuid(), q12_id, '3 a 5 anos', 3),
    (gen_random_uuid(), q12_id, '5 a 10 anos', 4),
    (gen_random_uuid(), q12_id, '10 a 20 anos', 5),
    (gen_random_uuid(), q12_id, 'Acima de 20 anos', 6);

    -- Inserir as opções para a questão 13 (Faturamento mensal)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q13_id, 'Até R$ 10.000', 1),
    (gen_random_uuid(), q13_id, 'R$ 10.001 a R$ 20.000', 2),
    (gen_random_uuid(), q13_id, 'R$ 20.001 a R$ 35.000', 3),
    (gen_random_uuid(), q13_id, 'R$ 35.001 a R$ 50.000', 4),
    (gen_random_uuid(), q13_id, 'R$ 50.001 a R$ 75.000', 5),
    (gen_random_uuid(), q13_id, 'R$ 75.001 a R$ 100.000', 6),
    (gen_random_uuid(), q13_id, 'R$ 100.001 a R$ 200.000', 7),
    (gen_random_uuid(), q13_id, 'R$ 200.001 a R$ 300.000', 8),
    (gen_random_uuid(), q13_id, 'R$ 300.001 a R$ 400.000', 9),
    (gen_random_uuid(), q13_id, 'R$ 400.001 a R$ 500.000', 10),
    (gen_random_uuid(), q13_id, 'R$ 500.001 a R$ 750.000', 11),
    (gen_random_uuid(), q13_id, 'R$ 750.001 a R$ 1.000.000', 12),
    (gen_random_uuid(), q13_id, 'R$ 1.000.001 a R$ 2.000.000', 13),
    (gen_random_uuid(), q13_id, 'R$ 2.000.001 a R$ 3.000.000', 14),
    (gen_random_uuid(), q13_id, 'R$ 3.000.001 a R$ 4.000.000', 15),
    (gen_random_uuid(), q13_id, 'R$ 4.000.001 a R$ 5.000.000', 16),
    (gen_random_uuid(), q13_id, 'Acima de R$ 5.000.000', 17);

    -- Inserir as opções para a questão 14 (Número de funcionários)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q14_id, '1 a 10', 1),
    (gen_random_uuid(), q14_id, '11 a 20', 2),
    (gen_random_uuid(), q14_id, '21 a 30', 3),
    (gen_random_uuid(), q14_id, '31 a 50', 4),
    (gen_random_uuid(), q14_id, '51 a 100', 5),
    (gen_random_uuid(), q14_id, '101 a 200', 6),
    (gen_random_uuid(), q14_id, 'Acima de 200', 7);

    -- Inserir as opções para a questão 15 (Potencial de crescimento)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q15_id, 'Muito alto', 1),
    (gen_random_uuid(), q15_id, 'Alto', 2),
    (gen_random_uuid(), q15_id, 'Médio', 3),
    (gen_random_uuid(), q15_id, 'Baixo', 4),
    (gen_random_uuid(), q15_id, 'Muito baixo', 5);

    -- Inserir as opções para a questão 16 (Motivo dos clientes)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q16_id, 'Preço competitivo', 1),
    (gen_random_uuid(), q16_id, 'Qualidade superior', 2),
    (gen_random_uuid(), q16_id, 'Atendimento personalizado', 3),
    (gen_random_uuid(), q16_id, 'Inovação tecnológica', 4),
    (gen_random_uuid(), q16_id, 'Reputação da marca', 5),
    (gen_random_uuid(), q16_id, 'Facilidade de acesso/compra', 6),
    (gen_random_uuid(), q16_id, 'Variedade de produtos/serviços', 7),
    (gen_random_uuid(), q16_id, 'Proximidade e relacionamento', 8),
    (gen_random_uuid(), q16_id, 'Credibilidade e confiança', 9),
    (gen_random_uuid(), q16_id, 'Experiência do cliente', 10),
    (gen_random_uuid(), q16_id, 'Agilidade na entrega/serviço', 11),
    (gen_random_uuid(), q16_id, 'Outros', 12);

    -- Inserir as opções para a questão 18 (Tem website)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q18_id, 'Sim', 1),
    (gen_random_uuid(), q18_id, 'Não', 2);
END $$;