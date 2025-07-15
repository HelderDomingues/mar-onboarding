-- Adicionar Módulo 5: Concorrência e Benchmarking
DO $$
DECLARE
    module5_id uuid;
    q29_id uuid;
    q30_id uuid;
    q31_id uuid;
    q32_id uuid;
    q33_id uuid;
    q34_id uuid;
    q35_id uuid;
    q36_id uuid;
    q37_id uuid;
    q38_id uuid;
    q39_id uuid;
BEGIN
    -- Inserir Módulo 5
    INSERT INTO quiz_modules (title, description, order_number)
    VALUES (
        'Concorrência e Benchmarking',
        'Olhar para o lado é crucial para se destacar. Analisar seus concorrentes permite identificar oportunidades de diferenciação, aprender com as melhores práticas (benchmarking) e antecipar movimentos do mercado, fortalecendo sua posição competitiva.',
        5
    ) RETURNING id INTO module5_id;

    -- Pergunta 29: Monitoramento de concorrentes
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module5_id,
        29,
        'Você monitora a atuação dos seus concorrentes?',
        'radio',
        true
    ) RETURNING id INTO q29_id;

    -- Opções da pergunta 29
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q29_id, 1, 'Sim, regularmente'),
    (q29_id, 2, 'Sim, esporadicamente'),
    (q29_id, 3, 'Raramente'),
    (q29_id, 4, 'Não');

    -- Pergunta 30: Atributos para comparação
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module5_id,
        30,
        'Quais atributos dos concorrentes você considera relevantes para comparação?',
        'checkbox',
        true
    ) RETURNING id INTO q30_id;

    -- Opções da pergunta 30
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q30_id, 1, 'Preço'),
    (q30_id, 2, 'Qualidade do produto/serviço'),
    (q30_id, 3, 'Atendimento ao cliente'),
    (q30_id, 4, 'Inovação'),
    (q30_id, 5, 'Presença digital'),
    (q30_id, 6, 'Portfólio de produtos/serviços'),
    (q30_id, 7, 'Estratégia de marketing'),
    (q30_id, 8, 'Agilidade na entrega'),
    (q30_id, 9, 'Experiência do cliente'),
    (q30_id, 10, 'Reputação'),
    (q30_id, 11, 'Investimento em tecnologia'),
    (q30_id, 12, 'Não sei responder'),
    (q30_id, 13, 'Outros');

    -- Pergunta 31: Concorrente A (Nome)
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module5_id,
        31,
        'Concorrente A (Nome da empresa concorrente)',
        'text',
        true
    ) RETURNING id INTO q31_id;

    -- Pergunta 32: Instagram Concorrente A
    INSERT INTO quiz_questions (module_id, order_number, text, type, required, hint)
    VALUES (
        module5_id,
        32,
        'Instagram Concorrente A',
        'instagram',
        true,
        'Insira o perfil SEM o @, ex: perfildoconcorrente'
    ) RETURNING id INTO q32_id;

    -- Pergunta 33: Website Concorrente A
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module5_id,
        33,
        'Website Concorrente A',
        'url',
        false
    ) RETURNING id INTO q33_id;

    -- Pergunta 34: Concorrente B (Nome)
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module5_id,
        34,
        'Concorrente B (Nome da empresa concorrente)',
        'text',
        false
    ) RETURNING id INTO q34_id;

    -- Pergunta 35: Instagram Concorrente B
    INSERT INTO quiz_questions (module_id, order_number, text, type, required, hint)
    VALUES (
        module5_id,
        35,
        'Instagram Concorrente B',
        'instagram',
        false,
        'Insira o perfil SEM o @, ex: perfildoconcorrente'
    ) RETURNING id INTO q35_id;

    -- Pergunta 36: Website Concorrente B
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module5_id,
        36,
        'Website Concorrente B',
        'url',
        false
    ) RETURNING id INTO q36_id;

    -- Pergunta 37: Concorrente C (Nome)
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module5_id,
        37,
        'Concorrente C (Nome da empresa concorrente)',
        'text',
        false
    ) RETURNING id INTO q37_id;

    -- Pergunta 38: Instagram Concorrente C
    INSERT INTO quiz_questions (module_id, order_number, text, type, required, hint)
    VALUES (
        module5_id,
        38,
        'Instagram Concorrente C',
        'instagram',
        false,
        'Insira o perfil SEM o @, ex: perfildoconcorrente'
    ) RETURNING id INTO q38_id;

    -- Pergunta 39: Website Concorrente C
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module5_id,
        39,
        'Website Concorrente C',
        'url',
        false
    ) RETURNING id INTO q39_id;
END $$;