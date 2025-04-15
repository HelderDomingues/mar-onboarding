
-- Função para buscar referências a 'is_complete' em todas as tabelas e colunas
CREATE OR REPLACE FUNCTION public.find_is_complete_references()
RETURNS TABLE (
    schemaname TEXT,
    tablename TEXT,
    columnname TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        schemaname, 
        tablename, 
        columnname
    FROM 
        pg_catalog.pg_tables t
    JOIN 
        information_schema.columns c ON c.table_schema = t.schemaname AND c.table_name = t.tablename
    WHERE 
        c.column_name ILIKE '%is_complete%'
        AND t.schemaname NOT IN ('pg_catalog', 'information_schema');
END;
$$;

-- Função para buscar 'is_complete' em definições de funções e triggers
CREATE OR REPLACE FUNCTION public.find_is_complete_in_functions()
RETURNS TABLE (
    routine_schema TEXT,
    routine_name TEXT,
    routine_type TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        routine_schema,
        routine_name,
        routine_type
    FROM 
        information_schema.routines
    WHERE 
        routine_definition ILIKE '%is_complete%';
END;
$$;
