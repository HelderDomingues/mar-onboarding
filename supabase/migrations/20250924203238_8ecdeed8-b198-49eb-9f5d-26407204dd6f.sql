-- FASE 1: Remover todas as tabelas de backup que não deveriam existir mais
-- Usando aspas duplas para escapar nomes com hífens

DROP TABLE IF EXISTS public."quiz_answers_backup_2025-04-29T18-12-42-205Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_answers_backup_2025-04-29T18-12-55-659Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_answers_backup_2025-07-17T16-19-43-237Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_answers_backup_2025-07-17T16-43-01-217Z" CASCADE;

DROP TABLE IF EXISTS public."quiz_modules_backup_2025-04-29T18-12-42-201Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_modules_backup_2025-04-29T18-12-55-649Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_modules_backup_2025-07-17T16-19-43-226Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_modules_backup_2025-07-17T16-43-01-200Z" CASCADE;

DROP TABLE IF EXISTS public."quiz_options_backup_2025-04-29T18-12-42-203Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_options_backup_2025-04-29T18-12-55-655Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_options_backup_2025-07-17T16-19-43-232Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_options_backup_2025-07-17T16-43-01-210Z" CASCADE;

DROP TABLE IF EXISTS public."quiz_questions_backup_2025-04-29T18-12-42-202Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_questions_backup_2025-04-29T18-12-55-651Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_questions_backup_2025-07-17T16-19-43-229Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_questions_backup_2025-07-17T16-43-01-205Z" CASCADE;

DROP TABLE IF EXISTS public."quiz_respostas_completas_backup_2025-04-29T18-12-42-206Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_respostas_completas_backup_2025-04-29T18-12-55-660Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_respostas_completas_backup_2025-07-17T16-19-43-239Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_respostas_completas_backup_2025-07-17T16-43-01-220Z" CASCADE;

DROP TABLE IF EXISTS public."quiz_submissions_backup_2025-04-29T18-12-42-204Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_submissions_backup_2025-04-29T18-12-55-657Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_submissions_backup_2025-07-17T16-19-43-234Z" CASCADE;
DROP TABLE IF EXISTS public."quiz_submissions_backup_2025-07-17T16-43-01-214Z" CASCADE;