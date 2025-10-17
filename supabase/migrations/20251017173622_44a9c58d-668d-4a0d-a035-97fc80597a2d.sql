-- Habilitar extensão pgcrypto para funções de criptografia
-- Necessária para gen_salt() e crypt() usados em admin_create_user
CREATE EXTENSION IF NOT EXISTS pgcrypto;