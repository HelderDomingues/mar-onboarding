-- Adicionar Módulo 6: Perspectiva Financeira e Investimentos
DO $$
DECLARE
    module6_id uuid;
    q40_id uuid;
    q41_id uuid;
    q42_id uuid;
    q43_id uuid;
    q44_id uuid;
    q45_id uuid;
BEGIN
    -- Inserir Módulo 6
    INSERT INTO quiz_modules (title, description, order_number)
    VALUES (
        'Perspectiva Financeira e Investimentos',
        'A saúde financeira sustenta a estratégia. Avaliar a situação atual, as metas de rentabilidade, os planos de investimento e os desafios financeiros é vital para garantir que o crescimento do negócio seja sustentável e bem gerenciado.',
        6
    ) RETURNING id INTO module6_id;

    -- Pergunta 40: Expectativa de crescimento do faturamento
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module6_id,
        40,
        'Qual a expectativa de crescimento do faturamento para os próximos 12 meses?',
        'radio',
        true
    ) RETURNING id INTO q40_id;

    -- Opções da pergunta 40
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q40_id, 1, 'Diminuir'),
    (q40_id, 2, 'Manter estável'),
    (q40_id, 3, 'Aumentar até 5%'),
    (q40_id, 4, 'Aumentar entre 6% e 15%'),
    (q40_id, 5, 'Aumentar entre 16% e 30%'),
    (q40_id, 6, 'Aumentar entre 31% e 50%'),
    (q40_id, 7, 'Aumentar acima de 50%');

    -- Pergunta 41: Metas financeiras prioritárias
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module6_id,
        41,
        'Quais metas financeiras são prioritárias?',
        'checkbox',
        true
    ) RETURNING id INTO q41_id;

    -- Opções da pergunta 41
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q41_id, 1, 'Aumentar margem de lucro'),
    (q41_id, 2, 'Reduzir custos operacionais'),
    (q41_id, 3, 'Melhorar fluxo de caixa'),
    (q41_id, 4, 'Aumentar faturamento'),
    (q41_id, 5, 'Melhorar retorno sobre investimento (ROI)'),
    (q41_id, 6, 'Expandir capital'),
    (q41_id, 7, 'Reequilibrar preços'),
    (q41_id, 8, 'Investir em inovação'),
    (q41_id, 9, 'Otimizar gestão financeira'),
    (q41_id, 10, 'Melhorar previsão financeira'),
    (q41_id, 11, 'Aumentar ticket médio'),
    (q41_id, 12, 'Outros');

    -- Pergunta 42: Planejamento financeiro formal
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module6_id,
        42,
        'Sua empresa possui um planejamento financeiro formal?',
        'radio',
        true
    ) RETURNING id INTO q42_id;

    -- Opções da pergunta 42
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q42_id, 1, 'Sim, detalhado'),
    (q42_id, 2, 'Sim, em elaboração'),
    (q42_id, 3, 'Não, mas está em desenvolvimento'),
    (q42_id, 4, 'Não');

    -- Pergunta 43: Indicadores financeiros acompanhados
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module6_id,
        43,
        'Quais indicadores financeiros você acompanha regularmente?',
        'checkbox',
        true
    ) RETURNING id INTO q43_id;

    -- Opções da pergunta 43
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q43_id, 1, 'Faturamento total'),
    (q43_id, 2, 'Ticket médio'),
    (q43_id, 3, 'Lucro bruto e líquido'),
    (q43_id, 4, 'Fluxo de caixa'),
    (q43_id, 5, 'Ponto de equilíbrio'),
    (q43_id, 6, 'ROI'),
    (q43_id, 7, 'Crescimento percentual'),
    (q43_id, 8, 'Margem de lucro'),
    (q43_id, 9, 'Endividamento'),
    (q43_id, 10, 'Investimentos realizados'),
    (q43_id, 11, 'Custos fixos/variáveis'),
    (q43_id, 12, 'Não sei responder'),
    (q43_id, 13, 'Outros');

    -- Pergunta 44: Investimentos planejados
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module6_id,
        44,
        'Sua empresa planeja realizar investimentos significativos nos próximos 12 meses?',
        'radio',
        true
    ) RETURNING id INTO q44_id;

    -- Opções da pergunta 44
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q44_id, 1, 'Não'),
    (q44_id, 2, 'Sim, até R$ 5.000'),
    (q44_id, 3, 'Sim, de R$ 5.001 a R$ 20.000'),
    (q44_id, 4, 'Sim, de R$ 20.001 a R$ 50.000'),
    (q44_id, 5, 'Sim, acima de R$ 50.000');

    -- Pergunta 45: Maior desafio financeiro
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module6_id,
        45,
        'Qual é o maior desafio financeiro que sua empresa enfrenta atualmente?',
        'radio',
        true
    ) RETURNING id INTO q45_id;

    -- Opções da pergunta 45
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q45_id, 1, 'Baixa margem de lucro'),
    (q45_id, 2, 'Alto custo operacional'),
    (q45_id, 3, 'Restrição de fluxo de caixa'),
    (q45_id, 4, 'Dificuldade na precificação'),
    (q45_id, 5, 'Elevada concorrência de preços'),
    (q45_id, 6, 'Custos imprevistos'),
    (q45_id, 7, 'Endividamento elevado'),
    (q45_id, 8, 'Baixo ticket médio'),
    (q45_id, 9, 'Oscilação no mercado'),
    (q45_id, 10, 'Dificuldade em captar investimentos'),
    (q45_id, 11, 'Problemas de gestão financeira'),
    (q45_id, 12, 'Não sei responder'),
    (q45_id, 13, 'Outros');
END $$;