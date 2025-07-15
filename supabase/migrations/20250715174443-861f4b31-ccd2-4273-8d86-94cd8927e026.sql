-- Adicionar limite de máximo 3 opções para a questão 22 (Visão)
DO $$
DECLARE
    q22_id uuid;
BEGIN
    -- Obter o ID da questão 22 (Visão)
    SELECT id INTO q22_id FROM quiz_questions 
    WHERE order_number = 22;
    
    -- Adicionar hint sobre limite máximo de 3 opções
    UPDATE quiz_questions 
    SET hint = 'A visão é uma imagem inspiradora do futuro desejado, um objetivo ambicioso, mas alcançável, que orienta a estratégia. Pense em termos de crescimento, reconhecimento, alcance ou transformação. Marque até 3 opções que melhor representem suas aspirações.'
    WHERE id = q22_id;
END $$;