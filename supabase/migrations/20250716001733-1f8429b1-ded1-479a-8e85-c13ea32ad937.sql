-- Habilitar RLS em todas as tabelas de backup que não possuem

-- Tabelas de backup dos módulos
ALTER TABLE "quiz_modules_backup_2025-04-29T18-12-42-201Z" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quiz_modules_backup_2025-04-29T18-12-55-649Z" ENABLE ROW LEVEL SECURITY;

-- Tabelas de backup das questões
ALTER TABLE "quiz_questions_backup_2025-04-29T18-12-42-202Z" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quiz_questions_backup_2025-04-29T18-12-55-651Z" ENABLE ROW LEVEL SECURITY;

-- Tabelas de backup das opções
ALTER TABLE "quiz_options_backup_2025-04-29T18-12-42-203Z" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quiz_options_backup_2025-04-29T18-12-55-655Z" ENABLE ROW LEVEL SECURITY;

-- Tabelas de backup das submissões
ALTER TABLE "quiz_submissions_backup_2025-04-29T18-12-42-204Z" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quiz_submissions_backup_2025-04-29T18-12-55-657Z" ENABLE ROW LEVEL SECURITY;

-- Tabelas de backup das respostas
ALTER TABLE "quiz_answers_backup_2025-04-29T18-12-42-205Z" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quiz_answers_backup_2025-04-29T18-12-55-659Z" ENABLE ROW LEVEL SECURITY;

-- Tabelas de backup das respostas completas
ALTER TABLE "quiz_respostas_completas_backup_2025-04-29T18-12-42-206Z" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "quiz_respostas_completas_backup_2025-04-29T18-12-55-660Z" ENABLE ROW LEVEL SECURITY;

-- Criar políticas restritivas para administradores apenas em todas as tabelas de backup
-- (Como são tabelas de backup, apenas administradores devem ter acesso)

-- Políticas para quiz_modules_backup
CREATE POLICY "Apenas administradores podem acessar backup de módulos 2025-04-29-201Z"
ON "quiz_modules_backup_2025-04-29T18-12-42-201Z"
FOR ALL
USING (is_admin());

CREATE POLICY "Apenas administradores podem acessar backup de módulos 2025-04-29-649Z"
ON "quiz_modules_backup_2025-04-29T18-12-55-649Z"
FOR ALL
USING (is_admin());

-- Políticas para quiz_questions_backup
CREATE POLICY "Apenas administradores podem acessar backup de questões 2025-04-29-202Z"
ON "quiz_questions_backup_2025-04-29T18-12-42-202Z"
FOR ALL
USING (is_admin());

CREATE POLICY "Apenas administradores podem acessar backup de questões 2025-04-29-651Z"
ON "quiz_questions_backup_2025-04-29T18-12-55-651Z"
FOR ALL
USING (is_admin());

-- Políticas para quiz_options_backup
CREATE POLICY "Apenas administradores podem acessar backup de opções 2025-04-29-203Z"
ON "quiz_options_backup_2025-04-29T18-12-42-203Z"
FOR ALL
USING (is_admin());

CREATE POLICY "Apenas administradores podem acessar backup de opções 2025-04-29-655Z"
ON "quiz_options_backup_2025-04-29T18-12-55-655Z"
FOR ALL
USING (is_admin());

-- Políticas para quiz_submissions_backup
CREATE POLICY "Apenas administradores podem acessar backup de submissões 2025-04-29-204Z"
ON "quiz_submissions_backup_2025-04-29T18-12-42-204Z"
FOR ALL
USING (is_admin());

CREATE POLICY "Apenas administradores podem acessar backup de submissões 2025-04-29-657Z"
ON "quiz_submissions_backup_2025-04-29T18-12-55-657Z"
FOR ALL
USING (is_admin());

-- Políticas para quiz_answers_backup
CREATE POLICY "Apenas administradores podem acessar backup de respostas 2025-04-29-205Z"
ON "quiz_answers_backup_2025-04-29T18-12-42-205Z"
FOR ALL
USING (is_admin());

CREATE POLICY "Apenas administradores podem acessar backup de respostas 2025-04-29-659Z"
ON "quiz_answers_backup_2025-04-29T18-12-55-659Z"
FOR ALL
USING (is_admin());

-- Políticas para quiz_respostas_completas_backup
CREATE POLICY "Apenas administradores podem acessar backup de respostas completas 2025-04-29-206Z"
ON "quiz_respostas_completas_backup_2025-04-29T18-12-42-206Z"
FOR ALL
USING (is_admin());

CREATE POLICY "Apenas administradores podem acessar backup de respostas completas 2025-04-29-660Z"
ON "quiz_respostas_completas_backup_2025-04-29T18-12-55-660Z"
FOR ALL
USING (is_admin());