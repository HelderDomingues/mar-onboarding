-- Adicionar Módulo 4: Clientes e Mercado-Alvo
DO $$
DECLARE
    module4_id uuid;
    q23_id uuid;
    q24_id uuid;
    q25_id uuid;
    q26_id uuid;
    q27_id uuid;
    q28_id uuid;
    q29_id uuid;
BEGIN
    -- Inserir Módulo 4
    INSERT INTO quiz_modules (title, description, order_number)
    VALUES (
        'Clientes e Mercado-Alvo',
        'Nenhum negócio prospera sem entender profundamente para quem ele existe. Este módulo foca em definir e caracterizar seu cliente ideal, compreendendo suas necessidades, desejos e comportamentos para direcionar suas ofertas e comunicação.',
        4
    ) RETURNING id INTO module4_id;

    -- Pergunta 23: Principal público-alvo
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module4_id,
        23,
        'Qual é o principal público-alvo?',
        'radio',
        true
    ) RETURNING id INTO q23_id;

    -- Opções da pergunta 23
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q23_id, 1, 'Consumidor final (B2C)'),
    (q23_id, 2, 'Empresas (B2B)'),
    (q23_id, 3, 'Governo (B2G)'),
    (q23_id, 4, 'Outros');

    -- Pergunta 24: Faixa etária
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module4_id,
        24,
        'Em relação à faixa etária, quais grupos compõem o seu público?',
        'checkbox',
        true
    ) RETURNING id INTO q24_id;

    -- Opções da pergunta 24
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q24_id, 1, 'Menos de 18 anos'),
    (q24_id, 2, '18 a 25 anos'),
    (q24_id, 3, '26 a 35 anos'),
    (q24_id, 4, '36 a 45 anos'),
    (q24_id, 5, '46 a 55 anos'),
    (q24_id, 6, 'Acima de 55 anos');

    -- Pergunta 25: Gênero predominante
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module4_id,
        25,
        'Qual o gênero predominante entre seus clientes?',
        'radio',
        true
    ) RETURNING id INTO q25_id;

    -- Opções da pergunta 25
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q25_id, 1, 'Masculino'),
    (q25_id, 2, 'Feminino'),
    (q25_id, 3, 'Ambos'),
    (q25_id, 4, 'Não especificado');

    -- Pergunta 26: Renda familiar/ticket médio
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module4_id,
        26,
        'Qual a renda familiar ou ticket médio que melhor representa seus clientes?',
        'radio',
        true
    ) RETURNING id INTO q26_id;

    -- Opções da pergunta 26
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q26_id, 1, 'Até R$ 2.000'),
    (q26_id, 2, 'R$ 2.001 a R$ 4.000'),
    (q26_id, 3, 'R$ 4.001 a R$ 8.000'),
    (q26_id, 4, 'R$ 8.001 a R$ 15.000'),
    (q26_id, 5, 'R$ 15.001 a R$ 30.000'),
    (q26_id, 6, 'R$ 30.001 a R$ 50.000'),
    (q26_id, 7, 'R$ 50.001 a R$ 100.000'),
    (q26_id, 8, 'Acima de R$ 100.000');

    -- Pergunta 27: Estilo de vida
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module4_id,
        27,
        'Quais aspectos melhor caracterizam o estilo de vida do seu público?',
        'checkbox',
        true
    ) RETURNING id INTO q27_id;

    -- Opções da pergunta 27
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q27_id, 1, 'Valorizam inovação e tecnologia'),
    (q27_id, 2, 'Preocupados com saúde e qualidade de vida'),
    (q27_id, 3, 'Sensíveis à sustentabilidade e meio ambiente'),
    (q27_id, 4, 'Buscam experiências personalizadas'),
    (q27_id, 5, 'Focados em economia e praticidade'),
    (q27_id, 6, 'Apreciam exclusividade e diferenciação'),
    (q27_id, 7, 'Valorizam tradição e segurança'),
    (q27_id, 8, 'Interessados em tendências e modernidade'),
    (q27_id, 9, 'Comportamento conservador'),
    (q27_id, 10, 'Orientados à comunidade/família'),
    (q27_id, 11, 'Buscam status e prestígio'),
    (q27_id, 12, 'Outros');

    -- Pergunta 28: Atributos importantes na decisão de compra
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module4_id,
        28,
        'Na decisão de compra, quais atributos são mais importantes para seus clientes?',
        'checkbox',
        true
    ) RETURNING id INTO q28_id;

    -- Opções da pergunta 28
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q28_id, 1, 'Preço'),
    (q28_id, 2, 'Qualidade'),
    (q28_id, 3, 'Atendimento e suporte'),
    (q28_id, 4, 'Inovação'),
    (q28_id, 5, 'Agilidade e entrega'),
    (q28_id, 6, 'Experiência do cliente'),
    (q28_id, 7, 'Confiabilidade da marca'),
    (q28_id, 8, 'Variedade de opções'),
    (q28_id, 9, 'Reputação/credibilidade'),
    (q28_id, 10, 'Personalização da oferta'),
    (q28_id, 11, 'Facilidade de acesso/comunicação'),
    (q28_id, 12, 'Outros');

    -- Pergunta 29: Canais de busca e compra
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (
        module4_id,
        29,
        'Quais canais seus clientes utilizam para buscar informações e realizar compras?',
        'checkbox',
        true
    ) RETURNING id INTO q29_id;

    -- Opções da pergunta 29
    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q29_id, 1, 'Redes sociais (Instagram, Facebook, LinkedIn, etc.)'),
    (q29_id, 2, 'Buscadores (Google, Bing)'),
    (q29_id, 3, 'Websites e e-commerces'),
    (q29_id, 4, 'Lojas físicas'),
    (q29_id, 5, 'Indicações/referências'),
    (q29_id, 6, 'Publicidade online (Ads, banners)'),
    (q29_id, 7, 'Publicidade tradicional (TV, rádio, impressos)'),
    (q29_id, 8, 'Eventos e feiras'),
    (q29_id, 9, 'Blogs e sites especializados'),
    (q29_id, 10, 'Aplicativos de comparação'),
    (q29_id, 11, 'Marketplaces'),
    (q29_id, 12, 'Não sei responder'),
    (q29_id, 13, 'Outros');
END $$;