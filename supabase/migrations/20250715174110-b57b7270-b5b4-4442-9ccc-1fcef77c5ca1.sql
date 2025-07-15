-- Inserir o Módulo 3: Pilares Estratégicos - Propósito, Valores e Visão
INSERT INTO quiz_modules (id, title, description, order_number) VALUES 
(gen_random_uuid(), 'Pilares Estratégicos - Propósito, Valores e Visão', 'Este módulo ajuda a definir a essência e o direcionamento futuro do seu negócio. Refletir sobre o ''porquê'' (Propósito), os ''princípios inegociáveis'' (Valores) e o ''onde queremos chegar'' (Visão) é fundamental para construir um planejamento estratégico sólido e inspirador.', 3);

-- Definir variáveis para IDs das questões do Módulo 3
DO $$
DECLARE
    module_id uuid;
    q20_id uuid := gen_random_uuid();
    q21_id uuid := gen_random_uuid();
    q22_id uuid := gen_random_uuid();
BEGIN
    -- Obter o ID do módulo 3
    SELECT id INTO module_id FROM quiz_modules WHERE order_number = 3;
    
    -- Inserir as questões do Módulo 3
    INSERT INTO quiz_questions (id, module_id, text, type, required, order_number, hint) VALUES 
    (q20_id, module_id, 'Qual é a razão de ser fundamental da sua empresa? O ''porquê'' que inspira suas ações e decisões?', 'radio', true, 20, 'O propósito vai além de simplesmente gerar lucro. Pense no impacto que sua empresa busca criar no mundo, nos seus clientes ou na sua comunidade. Se já possui uma declaração de propósito ou missão, escolha "Outro" e insira o texto.'),
    (q21_id, module_id, 'Quais princípios e crenças fundamentais guiam as decisões e o comportamento diário na sua empresa (Valores)?', 'checkbox', true, 21, 'Pense nas regras de conduta inegociáveis, naquilo que é mais importante para a sua empresa na forma como se relaciona com clientes, equipe, fornecedores e a sociedade. Marque todos que se aplicam genuinamente à sua cultura.'),
    (q22_id, module_id, 'Qual é a sua Visão de Futuro? Onde você deseja que sua empresa esteja ou o que deseja que ela tenha alcançado nos próximos 3 a 5 anos?', 'checkbox', true, 22, 'A visão é uma imagem inspiradora do futuro desejado, um objetivo ambicioso, mas alcançável, que orienta a estratégia. Pense em termos de crescimento, reconhecimento, alcance ou transformação. Marque até 3 opções que melhor representem suas aspirações.');

    -- Inserir as opções para a questão 20 (Propósito)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q20_id, 'Resolver um problema específico ou suprir uma necessidade clara dos nossos clientes de forma eficaz e confiável', 1),
    (gen_random_uuid(), q20_id, 'Simplificar a vida ou o trabalho dos nossos clientes através de produtos/serviços inovadores e acessíveis', 2),
    (gen_random_uuid(), q20_id, 'Inovar e ser pioneiro em nosso setor, definindo novas tendências, tecnologias ou abordagens', 3),
    (gen_random_uuid(), q20_id, 'Criar um impacto positivo e duradouro na sociedade, na comunidade local ou no meio ambiente', 4),
    (gen_random_uuid(), q20_id, 'Oferecer produtos/serviços de qualidade excepcional, buscando a maestria, a excelência e o reconhecimento em nossa área', 5),
    (gen_random_uuid(), q20_id, 'Tornar produtos, serviços ou conhecimentos mais acessíveis a um público maior ou a segmentos antes não atendidos', 6),
    (gen_random_uuid(), q20_id, 'Construir e nutrir uma comunidade forte em torno da nossa marca, conectando pessoas com interesses ou necessidades comuns', 7),
    (gen_random_uuid(), q20_id, 'Capacitar nossos clientes, fornecendo ferramentas, conhecimento ou oportunidades para que alcancem seus próprios objetivos', 8),
    (gen_random_uuid(), q20_id, 'Ser um motor de desenvolvimento econômico e social na nossa região, gerando empregos e oportunidades locais', 9),
    (gen_random_uuid(), q20_id, 'Preservar, promover ou celebrar uma arte, ofício, cultura, tradição ou conhecimento específico', 10),
    (gen_random_uuid(), q20_id, 'Criar um ambiente de trabalho excepcional, onde nossa equipe possa prosperar, se desenvolver e sentir orgulho de pertencer', 11),
    (gen_random_uuid(), q20_id, 'Outro', 12);

    -- Inserir as opções para a questão 21 (Valores)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q21_id, 'Inovação e Criatividade: Buscamos constantemente novas ideias e soluções, incentivando a experimentação e a melhoria contínua', 1),
    (gen_random_uuid(), q21_id, 'Ética e Integridade: Agimos com honestidade, transparência e respeito em todas as nossas relações e decisões', 2),
    (gen_random_uuid(), q21_id, 'Excelência e Qualidade: Comprometemo-nos com os mais altos padrões em nossos produtos, serviços e atendimento', 3),
    (gen_random_uuid(), q21_id, 'Sustentabilidade: Tomamos decisões considerando o impacto ambiental e social a longo prazo', 4),
    (gen_random_uuid(), q21_id, 'Foco no Cliente: Colocamos as necessidades, a satisfação e o sucesso dos nossos clientes no centro de tudo', 5),
    (gen_random_uuid(), q21_id, 'Colaboração e Trabalho em Equipe: Valorizamos a cooperação, o compartilhamento de conhecimento e o apoio mútuo', 6),
    (gen_random_uuid(), q21_id, 'Agilidade e Adaptação: Somos flexíveis e respondemos rapidamente às mudanças do mercado', 7),
    (gen_random_uuid(), q21_id, 'Responsabilidade Social: Contribuímos ativamente para o bem-estar da comunidade onde atuamos', 8),
    (gen_random_uuid(), q21_id, 'Desenvolvimento das Pessoas: Investimos no crescimento profissional e pessoal da nossa equipe', 9),
    (gen_random_uuid(), q21_id, 'Orientação para Resultados: Somos focados em alcançar nossas metas com disciplina e eficiência', 10),
    (gen_random_uuid(), q21_id, 'Respeito à Diversidade e Inclusão: Promovemos um ambiente onde todas as pessoas se sintam valorizadas', 11),
    (gen_random_uuid(), q21_id, 'Paixão pelo que Fazemos: Demonstramos entusiasmo, dedicação e orgulho em nosso trabalho', 12),
    (gen_random_uuid(), q21_id, 'Outros', 13);

    -- Inserir as opções para a questão 22 (Visão)
    INSERT INTO quiz_options (id, question_id, text, order_number) VALUES 
    (gen_random_uuid(), q22_id, 'Liderança de Mercado: Tornar-se a empresa referência ou líder reconhecida em nosso principal segmento', 1),
    (gen_random_uuid(), q22_id, 'Crescimento Acelerado: Expandir significativamente nossa base de clientes, volume de vendas e receita', 2),
    (gen_random_uuid(), q22_id, 'Consolidação e Fortalecimento: Firmar nossa posição no mercado atual, aprofundando relacionamentos', 3),
    (gen_random_uuid(), q22_id, 'Expansão Geográfica: Levar nossos produtos/serviços para novas cidades, regiões ou estados', 4),
    (gen_random_uuid(), q22_id, 'Internacionalização: Iniciar ou ampliar nossa presença em mercados internacionais', 5),
    (gen_random_uuid(), q22_id, 'Diversificação Estratégica: Ampliar nosso portfólio lançando novos produtos/serviços', 6),
    (gen_random_uuid(), q22_id, 'Referência em Inovação: Ser reconhecida como a empresa mais inovadora do setor', 7),
    (gen_random_uuid(), q22_id, 'Reposicionamento de Marca/Negócio: Mudar a forma como somos percebidos pelo mercado', 8),
    (gen_random_uuid(), q22_id, 'Excelência Operacional: Alcançar níveis superiores de eficiência, qualidade e produtividade', 9),
    (gen_random_uuid(), q22_id, 'Referência em Impacto Socioambiental: Ser reconhecida pelas práticas exemplares de sustentabilidade', 10),
    (gen_random_uuid(), q22_id, 'Transformação Digital: Integrar profundamente a tecnologia digital em todas as áreas do negócio', 11),
    (gen_random_uuid(), q22_id, 'Ser o Melhor Lugar para Trabalhar: Construir uma cultura organizacional forte e ambiente positivo', 12),
    (gen_random_uuid(), q22_id, 'Outros', 13);
END $$;