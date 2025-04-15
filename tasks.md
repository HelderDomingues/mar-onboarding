

# Tarefas do Projeto MAR - Crie Valor Consultoria

## Plano de Resolução e Melhoria do Sistema (Adicionado em 15/04/2025)

### Objetivo Global
Resolver os erros de conclusão do questionário, melhorar a exibição de mensagens de erro detalhadas e otimizar a estrutura do projeto para maior estabilidade e manutenção.

### Plano de Ação (Sequencial)

#### FASE 1: Diagnóstico e Análise
- [EM ANDAMENTO] Análise completa do sistema atual:
  - [CONCLUÍDO] Revisão do histórico de implementações anteriores
  - [CONCLUÍDO] Identificação dos pontos críticos de falha (erro 42501, mensagens de erro genéricas)
  - [CONCLUÍDO] Mapeamento de dependências entre componentes e funções
  - [CONCLUÍDO] Documentação do fluxo atual de conclusão do questionário

#### FASE 2: Padronização da Estrutura de Erros
- [PENDENTE] Implementar uma estrutura de erro padronizada:
  - Criar interface padrão para erros retornados por funções do sistema
  - Normalizar retornos de todas as funções que podem gerar erros
  - Implementar sistema de códigos de erro específicos para o projeto
  - Garantir que informações completas de erro estejam sempre disponíveis

#### FASE 3: Correção das Políticas RLS e Funções PostgreSQL
- [PENDENTE] Revisão e correção das políticas RLS:
  - Corrigir política para a tabela `quiz_respostas_completas`
  - Verificar consistência nas permissões entre tabelas relacionadas
  - Testar permissões com diferentes tipos de usuário
- [PENDENTE] Otimização das funções PostgreSQL:
  - Revisar função `registrar_respostas_completas`
  - Garantir que o trigger esteja funcionando corretamente
  - Implementar mais verificações e validações nos parâmetros

#### FASE 4: Refatoração da Função completeQuizManually
- [PENDENTE] Reescrever a função `completeQuizManually`:
  - Simplificar a lógica de fluxo
  - Padronizar a estrutura de retorno para erros
  - Melhorar o sistema de fallback entre métodos
  - Adicionar validações adicionais para campos obrigatórios
  - Garantir que o email do usuário seja sempre obtido e utilizado

#### FASE 5: Aprimoramento do Sistema de Logs
- [PENDENTE] Expandir o sistema de logs:
  - Adicionar mais pontos de log nas funções críticas
  - Criar categorias específicas para erros de permissão
  - Implementar rastreamento de valores antes/depois de operações críticas
  - Melhorar o formato dos logs para facilitar depuração

#### FASE 6: Melhoria na Interface de Usuário para Erros
- [PENDENTE] Refatorar exibição de erros no componente QuizReview:
  - Garantir que todos os formatos de erro sejam exibidos corretamente
  - Categorizar visualmente os diferentes tipos de erro
  - Adicionar orientações para o usuário conforme o tipo de erro
  - Implementar sistema de retry inteligente para erros conhecidos

#### FASE 7: Testes e Validação
- [PENDENTE] Implementar testes abrangentes:
  - Testar fluxo completo de conclusão do questionário
  - Verificar exibição de erros em diferentes cenários
  - Validar comportamento com dados ausentes ou inválidos
  - Confirmar que as políticas RLS estão funcionando corretamente

### Micro Tarefas Detalhadas

#### Para FASE 2: Padronização da Estrutura de Erros
1. [PENDENTE] Criar interface `SystemError` em `src/types/errors.ts`
2. [PENDENTE] Atualizar `utils/supabaseUtils.ts` para usar nova interface de erro
3. [PENDENTE] Atualizar função `completeQuizManually` para normalizar formato de erros
4. [PENDENTE] Implementar função auxiliar `formatError` para padronização

#### Para FASE 3: Correção das Políticas RLS e Funções PostgreSQL
1. [PENDENTE] Revisar função `registrar_respostas_completas`
2. [PENDENTE] Corrigir permissões na tabela `quiz_respostas_completas`
3. [PENDENTE] Verificar consistência de permissões entre tabelas relacionadas
4. [PENDENTE] Garantir que a coluna `user_email` esteja sempre preenchida

#### Para FASE 4: Refatoração da Função completeQuizManually
1. [PENDENTE] Simplificar a estrutura da função para uso de um único método
2. [PENDENTE] Implementar verificação robusta de email e dados do usuário
3. [PENDENTE] Padronizar formato de retorno para sucesso e falha
4. [PENDENTE] Adicionar validação de dados antes de tentar atualizar banco

#### Para FASE 5: Aprimoramento do Sistema de Logs
1. [PENDENTE] Adicionar logs específicos para operações no banco de dados
2. [PENDENTE] Implementar logs de valores antes/depois de operações críticas
3. [PENDENTE] Criar sistema de categorização para diferentes tipos de erro

#### Para FASE 6: Melhoria na Interface de Usuário para Erros
1. [PENDENTE] Refatorar componente `QuizReview` para lidar com múltiplos formatos de erro
2. [PENDENTE] Melhorar exibição visual de erros técnicos
3. [PENDENTE] Adicionar orientações específicas para cada tipo de erro

## Problemas e Soluções Anteriores

### Configuração da chave service_role
- [PENDENTE] Tentamos várias abordagens para configurar a chave service_role:
  - Renomeamos a coluna 'email' para 'user_email' na tabela profiles
  - Atualizamos funções relacionadas no banco de dados
  - Problema persiste ao clicar no botão de salvar configuração
  - Decisão: adiar a resolução deste problema para focar em funcionalidades críticas

### Erro 406 na Finalização do Questionário
- [EM ANDAMENTO] Erro 406 persiste quando tentamos finalizar o questionário:
  - Problema identificado: Campo user_email sendo obrigatório na tabela quiz_answers e quiz_submissions
  - Tentativas de solução:
    - [CONCLUÍDO] Atualizar função completeQuizManually para obter e garantir o email do usuário
    - [CONCLUÍDO] Modificar função saveQuizAnswer para sempre incluir user_email
    - [CONCLUÍDO] Implementar sistema robusto de logs para rastrear precisamente a origem do erro
    - [CONCLUÍDO] Corrigir os problemas relacionados a quiz_submissions.user_email e quiz_answers.user_email
  - Status atual: Modificações implementadas e em fase de teste

### Novo problema: Erro 42501 (Permission Denied)
- [PENDENTE] Identificado erro 42501 ao tentar finalizar questionário:
  - Problema: Permissão negada ao interagir com tabela quiz_respostas_completas
  - Investigação:
    - Verificar políticas RLS na tabela
    - Confirmar que a função registrar_respostas_completas tem permissões adequadas
    - Analisar permissões do usuário no contexto da operação

### Links quebrados no Dashboard Administrativo
- [CONCLUÍDO] Diversos links no dashboard administrativo estavam levando a páginas 404
  - Status:
    - [CONCLUÍDO] Criação da página Relatórios e Análises (/admin/reports)
    - [CONCLUÍDO] Correção dos links para Questionários Completos
    - [CONCLUÍDO] Correção dos links para Em Progresso
    - [CONCLUÍDO] Correção dos links para Taxa de Conclusão
    - [CONCLUÍDO] Correção dos links para Relatórios e Análises

### Configuração do Storage do Supabase
- [CONCLUÍDO] Configuração do bucket de armazenamento para materiais:
  - Criamos um bucket 'materials' para armazenar arquivos
  - Configuramos políticas de acesso adequadas para o bucket
  - Criamos tabelas para gerenciar metadados dos materiais
  - Implementamos estrutura para registrar acessos aos materiais

### Erro no Componente Sidebar
- [CONCLUÍDO] Identificado e corrigido erro: "useSidebar must be used within a SidebarProvider"
  - Erro ocorria nas páginas administrativas que usavam o componente AdminSidebar
  - Causa: o componente Sidebar estava sendo usado sem estar envolvido pelo SidebarProvider
  - Solução: Adicionamos o SidebarProvider ao componente AdminRoute e adaptamos o AdminSidebar para usar os componentes da UI corretamente

### Problemas na exibição e formatação de respostas
- [EM ANDAMENTO] Melhorias na exibição e formato das respostas:
  - [CONCLUÍDO] Criado utilitário formatUtils.ts para lidar com formatação de respostas JSON
  - [CONCLUÍDO] Melhorado componente QuizViewAnswers para exibir respostas formatadas
  - [CONCLUÍDO] Adicionado botão de exportação de CSV
  - [PENDENTE] Melhorar a geração de PDFs com informações completas
  - [PENDENTE] Adicionar uma visualização melhor para respostas de checkbox/radio

## Página de Perfil do Usuário
- [CONCLUÍDO] Criação da página de perfil do usuário:
  - Implementada rota `/profile` para acesso ao perfil
  - Adicionadas funcionalidades para visualização e edição de dados pessoais
  - Implementada visualização de progresso no questionário MAR
  - Preparada seção para futuras preferências de usuário

## Métricas Administrativas
- [CONCLUÍDO] Implementação de métricas segmentadas no dashboard administrativo:
  - Criada página `/admin/metrics` com visualização segmentada por categorias
  - Implementadas métricas de usuários (total, ativos, novos)
  - Implementadas métricas de conclusão (status por módulo, distribuição)
  - Implementadas métricas de tempo (tempo médio por módulo)
  - Preparada seção para métricas de dispositivos (futura integração)

## Editor de Questionário
- [INICIADO] Implementação da funcionalidade de edição de questionários:
  - Criado layout inicial da página `/admin/quiz-editor`
  - Preparada estrutura para gerenciamento de módulos, perguntas e opções
  - Implementada interface de usuário básica para o editor
  - [PENDENTE] Implementação da lógica de edição e persistência no banco de dados

## Documentação
- [INICIADO] Documentação do sistema:
  - [CONCLUÍDO] Implementação do log de implementação (log-implementation.md)
  - [CONCLUÍDO] Atualização regular do tasks.md
  - [PENDENTE] Criação de documentação técnica detalhada
  - [PENDENTE] Documentação de APIs e endpoints

## Lições Aprendidas e Melhores Práticas
- [NOVO] Documentar lições aprendidas e melhores práticas:
  - Sempre verificar permissões RLS ao implementar novas funcionalidades
  - Testar funções PostgreSQL com diferentes contextos de usuário
  - Implementar sistema robusto de logs para facilitar depuração
  - Padronizar retorno de funções para garantir consistência na interface

## Próximos Passos (Priorizados)
1. Implementar a Fase 2: Padronização da Estrutura de Erros
2. Implementar a Fase 3: Correção das Políticas RLS e Funções PostgreSQL
3. Implementar a Fase 4: Refatoração da Função completeQuizManually
4. Implementar a Fase 5: Aprimoramento do Sistema de Logs
5. Implementar a Fase 6: Melhoria na Interface de Usuário para Erros
6. Implementar a Fase 7: Testes e Validação
7. Retornar aos problemas pendentes: melhorar geração de PDFs e visualização de respostas
8. Continuar implementação do editor de questionários

## Tarefas Concluídas
- Migração da coluna 'email' para 'user_email' na tabela profiles
- Atualização das funções relacionadas no banco de dados
- Criação de páginas administrativas que estavam faltando
- Configuração do Storage do Supabase para armazenamento de materiais
- Criação da página de Relatórios e Análises com funcionalidades de exportação PDF/CSV
- Correção do erro do SidebarProvider nas páginas administrativas
- Criação da página de perfil do usuário
- Implementação de métricas segmentadas no dashboard administrativo
- Layout inicial para editor de questionários
- Adição da logo MAR ao componente QuizViewAnswers
- Melhorias no formato de exibição de respostas

