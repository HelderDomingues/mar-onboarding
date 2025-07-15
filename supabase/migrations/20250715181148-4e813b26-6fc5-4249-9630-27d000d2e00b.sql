-- Adicionar Módulos 7, 8, 9, 10 e 11 - Finalização do Questionário
DO $$
DECLARE
    module7_id uuid;
    module8_id uuid;
    module9_id uuid;
    module10_id uuid;
    module11_id uuid;
    q46_id uuid;
    q47_id uuid;
    q48_id uuid;
    q49_id uuid;
    q50_id uuid;
    q51_id uuid;
    q52_id uuid;
    q53_id uuid;
    q54_id uuid;
    q55_id uuid;
    q56_id uuid;
    q57_id uuid;
    q58_id uuid;
    q59_id uuid;
    q60_id uuid;
    q61_id uuid;
    q62_id uuid;
    q63_id uuid;
    q64_id uuid;
    q65_id uuid;
    q66_id uuid;
    q67_id uuid;
BEGIN
    -- ====== MÓDULO 7: Processos Internos e Operacionais ======
    INSERT INTO quiz_modules (title, description, order_number)
    VALUES (
        'Processos Internos e Operacionais',
        'A forma como sua empresa opera impacta diretamente na entrega de valor. Mapear e otimizar seus processos internos é fundamental para garantir eficiência, qualidade, reduzir custos e escalar suas operações de forma consistente.',
        7
    ) RETURNING id INTO module7_id;

    -- Pergunta 46: Processos críticos
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module7_id, 46, 'Quais processos são críticos para o sucesso do seu negócio?', 'checkbox', true)
    RETURNING id INTO q46_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q46_id, 1, 'Vendas e atendimento'),
    (q46_id, 2, 'Produção/Entrega'),
    (q46_id, 3, 'Gestão financeira/administrativa'),
    (q46_id, 4, 'Logística/distribuição'),
    (q46_id, 5, 'Desenvolvimento de produtos/serviços'),
    (q46_id, 6, 'Marketing e comunicação'),
    (q46_id, 7, 'Pós-venda e suporte'),
    (q46_id, 8, 'Gerenciamento de estoque'),
    (q46_id, 9, 'Controle de qualidade'),
    (q46_id, 10, 'Relacionamento com parceiros'),
    (q46_id, 11, 'Inovação em processos'),
    (q46_id, 12, 'Outros');

    -- Pergunta 47: Métodos padronizados
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module7_id, 47, 'Sua empresa utiliza métodos padronizados para otimizar processos (ex.: Lean, BPM, Six Sigma)?', 'radio', true)
    RETURNING id INTO q47_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q47_id, 1, 'Sim, de forma estruturada'),
    (q47_id, 2, 'Sim, de forma adaptada'),
    (q47_id, 3, 'Em fase de implementação'),
    (q47_id, 4, 'Não utiliza, mas tem interesse'),
    (q47_id, 5, 'Não utiliza e não tem interesse'),
    (q47_id, 6, 'Outros');

    -- Pergunta 48: Métricas de desempenho
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module7_id, 48, 'Quais métricas são utilizadas para mensurar o desempenho dos processos?', 'checkbox', true)
    RETURNING id INTO q48_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q48_id, 1, 'Tempo de execução'),
    (q48_id, 2, 'Taxa de erros ou retrabalhos'),
    (q48_id, 3, 'Custos operacionais'),
    (q48_id, 4, 'Satisfação do cliente interno/externo'),
    (q48_id, 5, 'Eficiência produtiva'),
    (q48_id, 6, 'Taxa de desperdício'),
    (q48_id, 7, 'Taxa de entrega no prazo'),
    (q48_id, 8, 'Índice de qualidade'),
    (q48_id, 9, 'Produtividade da equipe'),
    (q48_id, 10, 'Retorno sobre investimento em processos'),
    (q48_id, 11, 'Indicadores operacionais específicos'),
    (q48_id, 12, 'Outros');

    -- Pergunta 49: Ferramentas/sistemas
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module7_id, 49, 'Quais ferramentas/sistemas sua empresa utiliza para gerenciar processos?', 'checkbox', true)
    RETURNING id INTO q49_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q49_id, 1, 'ERP'),
    (q49_id, 2, 'CRM'),
    (q49_id, 3, 'Planilhas eletrônicas'),
    (q49_id, 4, 'Softwares específicos de gestão (ex.: BPM)'),
    (q49_id, 5, 'Sistemas de automação'),
    (q49_id, 6, 'Ferramentas de comunicação (ex.: Slack, Teams)'),
    (q49_id, 7, 'Ferramentas de monitoramento'),
    (q49_id, 8, 'Soluções integradas'),
    (q49_id, 9, 'Software de controle de qualidade'),
    (q49_id, 10, 'Ferramentas para gestão de projetos'),
    (q49_id, 11, 'Sistemas personalizados'),
    (q49_id, 12, 'Outros');

    -- Pergunta 50: Principal prioridade
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module7_id, 50, 'Qual a principal prioridade para melhorar seus processos internos?', 'radio', true)
    RETURNING id INTO q50_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q50_id, 1, 'Reduzir custos'),
    (q50_id, 2, 'Aumentar a eficiência operacional'),
    (q50_id, 3, 'Melhorar a qualidade dos serviços/produtos'),
    (q50_id, 4, 'Inovar nos métodos e ferramentas'),
    (q50_id, 5, 'Otimizar a comunicação interna'),
    (q50_id, 6, 'Outros');

    -- ====== MÓDULO 8: Inovação, Aprendizado e Crescimento ======
    INSERT INTO quiz_modules (title, description, order_number)
    VALUES (
        'Inovação, Aprendizado e Crescimento',
        'O futuro pertence às empresas que aprendem e se adaptam. Este módulo explora a capacidade da sua organização de inovar, desenvolver sua equipe e cultivar uma cultura de aprendizado contínuo, motores essenciais para o crescimento sustentado.',
        8
    ) RETURNING id INTO module8_id;

    -- Pergunta 51: Áreas de capacitação
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module8_id, 51, 'Quais áreas de capacitação são mais importantes para sua equipe?', 'checkbox', true)
    RETURNING id INTO q51_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q51_id, 1, 'Conhecimentos técnicos específicos'),
    (q51_id, 2, 'Habilidades de liderança'),
    (q51_id, 3, 'Técnicas de vendas e marketing'),
    (q51_id, 4, 'Atendimento ao cliente'),
    (q51_id, 5, 'Inovação e criatividade'),
    (q51_id, 6, 'Uso de tecnologia e ferramentas digitais'),
    (q51_id, 7, 'Gestão de tempo e produtividade'),
    (q51_id, 8, 'Comunicação eficaz'),
    (q51_id, 9, 'Gestão de projetos'),
    (q51_id, 10, 'Desenvolvimento pessoal'),
    (q51_id, 11, 'Trabalho em equipe'),
    (q51_id, 12, 'Outros');

    -- Pergunta 52: Programas de inovação
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module8_id, 52, 'Sua empresa possui programas estruturados para incentivar a inovação?', 'radio', true)
    RETURNING id INTO q52_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q52_id, 1, 'Sim, de forma consolidada'),
    (q52_id, 2, 'Sim, de forma informal'),
    (q52_id, 3, 'Em fase de implantação'),
    (q52_id, 4, 'Não, mas estamos avaliando'),
    (q52_id, 5, 'Não'),
    (q52_id, 6, 'Outros');

    -- Pergunta 53: Desafio para inovar
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module8_id, 53, 'Qual o principal desafio para inovar na sua empresa?', 'radio', true)
    RETURNING id INTO q53_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q53_id, 1, 'Falta de recursos financeiros'),
    (q53_id, 2, 'Resistência à mudança'),
    (q53_id, 3, 'Falta de tempo e foco'),
    (q53_id, 4, 'Ausência de estratégia definida'),
    (q53_id, 5, 'Cultura organizacional pouco favorável'),
    (q53_id, 6, 'Outros');

    -- ====== MÓDULO 9: Marketing e Vendas ======
    INSERT INTO quiz_modules (title, description, order_number)
    VALUES (
        'Marketing e Vendas',
        'De nada adianta ter um ótimo produto ou serviço se o mercado não o conhece ou não o compra. Aqui, investigamos como sua empresa atrai, conquista e retém clientes, alinhando suas estratégias de marketing e vendas aos seus objetivos.',
        9
    ) RETURNING id INTO module9_id;

    -- Pergunta 54: Principal diferencial
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module9_id, 54, 'Qual é o principal diferencial que sua empresa oferece aos clientes?', 'radio', true)
    RETURNING id INTO q54_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q54_id, 1, 'Preço competitivo'),
    (q54_id, 2, 'Qualidade superior'),
    (q54_id, 3, 'Atendimento personalizado'),
    (q54_id, 4, 'Inovação constante'),
    (q54_id, 5, 'Experiência diferenciada'),
    (q54_id, 6, 'Outros');

    -- Pergunta 55: Quem cuida do marketing
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module9_id, 55, 'Quem cuida do marketing da sua empresa?', 'checkbox', true)
    RETURNING id INTO q55_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q55_id, 1, 'Eu mesmo, sozinho'),
    (q55_id, 2, 'Eu e mais 1 pessoa'),
    (q55_id, 3, 'Agência de Marketing Local'),
    (q55_id, 4, 'Agência de Marketing Remota'),
    (q55_id, 5, 'Equipe interna/Departamento de Marketing'),
    (q55_id, 6, 'Ninguém, no momento');

    -- Pergunta 56: Estratégias de marketing
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module9_id, 56, 'Quais estratégias de marketing são utilizadas atualmente?', 'checkbox', true)
    RETURNING id INTO q56_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q56_id, 1, 'Marketing digital (SEO, Ads, redes sociais)'),
    (q56_id, 2, 'Marketing de conteúdo'),
    (q56_id, 3, 'Marketing tradicional (TV, rádio, impresso)'),
    (q56_id, 4, 'E-mail marketing'),
    (q56_id, 5, 'Parcerias e indicações'),
    (q56_id, 6, 'Influenciadores digitais'),
    (q56_id, 7, 'Eventos e feiras'),
    (q56_id, 8, 'Publicidade em vídeo'),
    (q56_id, 9, 'Marketing de relacionamento'),
    (q56_id, 10, 'Remarketing'),
    (q56_id, 11, 'Campanhas promocionais'),
    (q56_id, 12, 'Outros');

    -- Pergunta 57: Canais mais eficazes
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module9_id, 57, 'Quais canais se mostraram mais eficazes na aquisição de clientes?', 'checkbox', true)
    RETURNING id INTO q57_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q57_id, 1, 'Redes sociais'),
    (q57_id, 2, 'Website/Loja virtual'),
    (q57_id, 3, 'Lojas físicas'),
    (q57_id, 4, 'Indicações'),
    (q57_id, 5, 'Marketplaces'),
    (q57_id, 6, 'Buscadores'),
    (q57_id, 7, 'Publicidade paga online'),
    (q57_id, 8, 'Publicidade tradicional'),
    (q57_id, 9, 'E-mail marketing'),
    (q57_id, 10, 'Eventos e feiras'),
    (q57_id, 11, 'Aplicativos de venda'),
    (q57_id, 12, 'Boca a boca'),
    (q57_id, 13, 'Outros');

    -- Pergunta 58: Investimento mensal em marketing
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module9_id, 58, 'Qual é o investimento mensal aproximado em marketing?', 'radio', true)
    RETURNING id INTO q58_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q58_id, 1, 'Não investimos atualmente'),
    (q58_id, 2, 'Até R$ 500'),
    (q58_id, 3, 'R$ 501 a R$ 1.000'),
    (q58_id, 4, 'R$ 1.001 a R$ 5.000'),
    (q58_id, 5, 'R$ 5.001 a R$ 10.000'),
    (q58_id, 6, 'R$ 10.001 a R$ 15.000'),
    (q58_id, 7, 'R$ 15.001 a R$ 20.000'),
    (q58_id, 8, 'R$ 20.001 a R$ 30.000'),
    (q58_id, 9, 'R$ 30.001 a R$ 40.000'),
    (q58_id, 10, 'R$ 40.001 a R$ 50.000'),
    (q58_id, 11, 'Acima de R$ 50.000');

    -- Pergunta 59: Métricas de marketing
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module9_id, 59, 'Quais métricas são monitoradas para avaliar as ações de marketing?', 'checkbox', true)
    RETURNING id INTO q59_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q59_id, 1, 'Taxa de conversão'),
    (q59_id, 2, 'CAC (Custo de Aquisição de Cliente)'),
    (q59_id, 3, 'LTV (Lifetime Value)'),
    (q59_id, 4, 'Retorno sobre investimento (ROI)'),
    (q59_id, 5, 'NPS'),
    (q59_id, 6, 'Churn rate'),
    (q59_id, 7, 'Tráfego no website'),
    (q59_id, 8, 'Engajamento nas redes sociais'),
    (q59_id, 9, 'Taxa de abertura de e-mails'),
    (q59_id, 10, 'Número de leads gerados'),
    (q59_id, 11, 'Feedback dos clientes'),
    (q59_id, 12, 'Não acompanho/Não sei responder'),
    (q59_id, 13, 'Outros');

    -- Pergunta 60: Saúde das vendas
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module9_id, 60, 'Como você diria que está a saúde das vendas em sua empresa?', 'radio', true)
    RETURNING id INTO q60_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q60_id, 1, 'Péssimo. Não estamos vendendo'),
    (q60_id, 2, 'Ruim. Vendemos pouco'),
    (q60_id, 3, 'Médio. Vendemos mas não crescemos'),
    (q60_id, 4, 'Bom. Estamos vendendo bem'),
    (q60_id, 5, 'Excelente. Vendemos muito e estamos crescendo');

    -- Pergunta 61: Comercial estruturado
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module9_id, 61, 'Sua empresa tem um comercial estruturado?', 'radio', true)
    RETURNING id INTO q61_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q61_id, 1, 'Sim'),
    (q61_id, 2, 'Não');

    -- Pergunta 62: Prioridade comercial
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module9_id, 62, 'Qual a prioridade para a área comercial neste momento?', 'radio', true)
    RETURNING id INTO q62_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q62_id, 1, 'Aumentar as vendas'),
    (q62_id, 2, 'Melhorar a fidelização dos clientes'),
    (q62_id, 3, 'Expandir a base de clientes'),
    (q62_id, 4, 'Otimizar processos de vendas'),
    (q62_id, 5, 'Investir em treinamento da equipe'),
    (q62_id, 6, 'Outros');

    -- ====== MÓDULO 10: Liderança e Gestão de Pessoas ======
    INSERT INTO quiz_modules (title, description, order_number)
    VALUES (
        'Liderança e Gestão de Pessoas',
        'São as pessoas que transformam planos em realidade. Este módulo aborda a liderança e a gestão da sua equipe, elementos cruciais para construir um time engajado, produtivo e alinhado aos objetivos estratégicos da empresa.',
        10
    ) RETURNING id INTO module10_id;

    -- Pergunta 63: Desafios de liderança
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module10_id, 63, 'Quais desafios você enfrenta como líder?', 'checkbox', true)
    RETURNING id INTO q63_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q63_id, 1, 'Gerenciamento do tempo'),
    (q63_id, 2, 'Delegação de tarefas'),
    (q63_id, 3, 'Tomada de decisões estratégicas'),
    (q63_id, 4, 'Comunicação com a equipe'),
    (q63_id, 5, 'Desenvolvimento e capacitação'),
    (q63_id, 6, 'Motivação e engajamento'),
    (q63_id, 7, 'Gestão de conflitos'),
    (q63_id, 8, 'Equilíbrio entre vida pessoal e profissional'),
    (q63_id, 9, 'Acompanhamento de desempenho'),
    (q63_id, 10, 'Inovação na liderança'),
    (q63_id, 11, 'Adaptação às mudanças'),
    (q63_id, 12, 'Outros');

    -- Pergunta 64: Impacto dos desafios
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module10_id, 64, 'De que forma os desafios de liderança impactam o desempenho do seu negócio?', 'radio', true)
    RETURNING id INTO q64_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q64_id, 1, 'Impactam fortemente os resultados'),
    (q64_id, 2, 'Afetam a produtividade da equipe'),
    (q64_id, 3, 'Têm impacto moderado'),
    (q64_id, 4, 'Pouco impacto'),
    (q64_id, 5, 'Impactam somente em momentos críticos'),
    (q64_id, 6, 'Outros');

    -- Pergunta 65: Iniciativas de desenvolvimento
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module10_id, 65, 'Quais iniciativas de desenvolvimento de pessoas sua empresa adota?', 'checkbox', true)
    RETURNING id INTO q65_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q65_id, 1, 'Treinamentos e capacitações internas'),
    (q65_id, 2, 'Cursos e workshops externos'),
    (q65_id, 3, 'Programas de mentoria'),
    (q65_id, 4, 'Avaliações de desempenho regulares'),
    (q65_id, 5, 'Incentivos e programas de reconhecimento'),
    (q65_id, 6, 'Reuniões de feedback contínuo'),
    (q65_id, 7, 'Programas de coaching'),
    (q65_id, 8, 'Ações de integração e team building'),
    (q65_id, 9, 'Parcerias com instituições de ensino'),
    (q65_id, 10, 'Plataformas de e-learning'),
    (q65_id, 11, 'Desenvolvimento de líderes internos'),
    (q65_id, 12, 'Outros');

    -- Pergunta 66: Prioridade gestão de pessoas
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module10_id, 66, 'Qual a principal prioridade para aprimorar a gestão de pessoas?', 'radio', true)
    RETURNING id INTO q66_id;

    INSERT INTO quiz_options (question_id, order_number, text) VALUES
    (q66_id, 1, 'Melhorar a comunicação interna'),
    (q66_id, 2, 'Aumentar a capacitação da equipe'),
    (q66_id, 3, 'Reduzir a rotatividade (turnover)'),
    (q66_id, 4, 'Implementar ferramentas de avaliação e feedback'),
    (q66_id, 5, 'Desenvolver planos de carreira estruturados'),
    (q66_id, 6, 'Outros');

    -- ====== MÓDULO 11: Observações Finais e Considerações Complementares ======
    INSERT INTO quiz_modules (title, description, order_number)
    VALUES (
        'Observações Finais e Considerações Complementares',
        'Sua perspectiva única é valiosa. Utilize este espaço final para adicionar qualquer informação, contexto ou consideração que julgue importante e que não tenha sido abordada nos módulos anteriores, enriquecendo a análise estratégica.',
        11
    ) RETURNING id INTO module11_id;

    -- Pergunta 67: Observações finais
    INSERT INTO quiz_questions (module_id, order_number, text, type, required)
    VALUES (module11_id, 67, 'Existe alguma informação adicional ou comentário que você gostaria de incluir para complementar a análise estratégica da sua empresa?', 'textarea', false)
    RETURNING id INTO q67_id;

END $$;