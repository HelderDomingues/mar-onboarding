# Tarefas do Projeto MAR - Crie Valor Consultoria

## Plano de Resolução e Melhoria do Sistema (Atualizado em 15/04/2025)

### Objetivo Global
Resolver os erros de conclusão do questionário, melhorar a exibição de mensagens de erro detalhadas e otimizar a estrutura do projeto para maior estabilidade e manutenção.

### Plano de Ação (Sequencial)

#### FASE 1: Diagnóstico e Análise
- [CONCLUÍDO] Análise completa do sistema atual:
  - [CONCLUÍDO] Revisão do histórico de implementações anteriores
  - [CONCLUÍDO] Identificação dos pontos críticos de falha (erro 42501, mensagens de erro genéricas)
  - [CONCLUÍDO] Mapeamento de dependências entre componentes e funções
  - [CONCLUÍDO] Documentação do fluxo atual de conclusão do questionário

#### FASE 2: Padronização da Estrutura de Erros
- [CONCLUÍDO] Implementar uma estrutura de erro padronizada:
  - [CONCLUÍDO] Criar interface padrão para erros retornados por funções do sistema
  - [CONCLUÍDO] Normalizar retornos de todas as funções que podem gerar erros
  - [CONCLUÍDO] Implementar sistema de códigos de erro específicos para o projeto
  - [CONCLUÍDO] Garantir que informações completas de erro estejam sempre disponíveis

#### FASE 3: Correção das Políticas RLS e Funções PostgreSQL
- [CONCLUÍDO] Revisão e correção das políticas RLS:
  - [CONCLUÍDO] Corrigir política para a tabela `quiz_respostas_completas`
  - [CONCLUÍDO] Verificar consistência nas permissões entre tabelas relacionadas
  - [CONCLUÍDO] Implementar políticas para administradores e usuários comuns
- [CONCLUÍDO] Otimização das funções PostgreSQL:
  - [CONCLUÍDO] Revisar função `registrar_respostas_completas`
  - [CONCLUÍDO] Modificar função para usar SECURITY DEFINER
  - [CONCLUÍDO] Implementar mais verificações e validações nos parâmetros
  - [CONCLUÍDO] Garantir que o trigger esteja funcionando corretamente

#### FASE 4: Refatoração da Função completeQuizManually
- [CONCLUÍDO] Reescrever a função `completeQuizManually`:
  - [CONCLUÍDO] Simplificar a lógica de fluxo
  - [CONCLUÍDO] Padronizar a estrutura de retorno para erros
  - [CONCLUÍDO] Remover sistema de fallback entre métodos (simplificação)
  - [CONCLUÍDO] Adicionar validações adicionais para campos obrigatórios
  - [CONCLUÍDO] Garantir que o email do usuário seja sempre obtido e utilizado
  - [CONCLUÍDO] Implementar chamada direta à função RPC `complete_quiz`

#### FASE 5: Aprimoramento do Sistema de Logs
- [PENDENTE] Expandir o sistema de logs:
  - Adicionar mais pontos de log nas funções críticas
  - Criar categorias específicas para erros de permissão
  - Implementar rastreamento de valores antes/depois de operações críticas
  - Melhorar o formato dos logs para facilitar depuração

#### FASE 6: Melhoria na Interface de Usuário para Erros
- [CONCLUÍDO] Refatorar exibição de erros no componente QuizReview:
  - [CONCLUÍDO] Garantir que todos os formatos de erro sejam exibidos corretamente
  - [CONCLUÍDO] Categorizar visualmente os diferentes tipos de erro
  - [CONCLUÍDO] Adicionar orientações para o usuário conforme o tipo de erro
  - [CONCLUÍDO] Implementar sistema de exibição detalhada para erros conhecidos

#### FASE 7: Testes e Validação
- [PENDENTE] Implementar testes abrangentes:
  - Testar fluxo completo de conclusão do questionário
  - Verificar exibição de erros em diferentes cenários
  - Validar comportamento com dados ausentes ou inválidos
  - Confirmar que as políticas RLS estão funcionando corretamente

### Micro Tarefas Detalhadas

#### Para FASE 3: Correção das Políticas RLS e Funções PostgreSQL (CONCLUÍDO)
1. [CONCLUÍDO] Habilitar Row Level Security (RLS) na tabela `quiz_respostas_completas`
2. [CONCLUÍDO] Criar política RLS para inserção de dados pelos próprios usuários
3. [CONCLUÍDO] Criar política RLS para seleção de dados pelos próprios usuários
4. [CONCLUÍDO] Criar política RLS para administradores visualizarem todos os dados
5. [CONCLUÍDO] Modificar a função `registrar_respostas_completas` para usar SECURITY DEFINER
6. [CONCLUÍDO] Adicionar validações extras na função `registrar_respostas_completas`
7. [CONCLUÍDO] Recriar o trigger para garantir o funcionamento correto

#### Para FASE 4: Refatoração da Função completeQuizManually
1. [CONCLUÍDO] Simplificar a estrutura da função para uso de um único método
2. [CONCLUÍDO] Implementar verificação robusta de email e dados do usuário
3. [CONCLUÍDO] Padronizar formato de retorno para sucesso e falha
4. [CONCLUÍDO] Adicionar validação de dados antes de tentar atualizar banco
5. [CONCLUÍDO] Utilizar a função RPC `complete_quiz` para conclusão do questionário

#### Para FASE 5: Aprimoramento do Sistema de Logs
1. [PENDENTE] Adicionar logs específicos para operações no banco de dados
2. [PENDENTE] Implementar logs de valores antes/depois de operações críticas
3. [PENDENTE] Criar sistema de categorização para diferentes tipos de erro

#### Para FASE 6: Melhoria na Interface de Usuário para Erros
1. [CONCLUÍDO] Refatorar componente `QuizReview` para lidar com múltiplos formatos de erro
2. [CONCLUÍDO] Melhorar exibição visual de erros técnicos
3. [CONCLUÍDO] Adicionar orientações específicas para cada tipo de erro

## Problemas e Soluções Anteriores

### Configuração da chave service_role
- [PENDENTE] Tentamos várias abordagens para configurar a chave service_role:
  - Renomeamos a coluna 'email' para 'user_email' na tabela profiles
  - Atualizamos funções relacionadas no banco de dados
  - Problema persiste ao clicar no botão de salvar configuração
  - Decisão: adiar a resolução deste problema para focar em funcionalidades críticas

### Erro 406 na Finalização do Questionário
- [CONCLUÍDO] Erro 406 quando tentamos finalizar o questionário:
  - Problema identificado: Campo user_email sendo obrigatório na tabela quiz_answers e quiz_submissions
  - Soluções implementadas:
    - [CONCLUÍDO] Atualizar função completeQuizManually para obter e garantir o email do usuário
    - [CONCLUÍDO] Modificar função saveQuizAnswer para sempre incluir user_email
    - [CONCLUÍDO] Implementar sistema robusto de logs para rastrear precisamente a origem do erro
    - [CONCLUÍDO] Corrigir os problemas relacionados a quiz_submissions.user_email e quiz_answers.user_email

### Novo problema: Erro 42501 (Permission Denied)
- [CONCLUÍDO] Erro 42501 ao tentar finalizar questionário:
  - Problema: Permissão negada ao interagir com tabela quiz_respostas_completas
  - Solução implementada:
    - [CONCLUÍDO] Habilitado Row Level Security na tabela quiz_respostas_completas
    - [CONCLUÍDO] Criadas políticas RLS para permitir inserção e seleção de dados próprios
    - [CONCLUÍDO] Criada política especial para administradores
    - [CONCLUÍDO] Modificada função registrar_respostas_completas para usar SECURITY DEFINER
    - [CONCLUÍDO] Adicionadas validações extras e tratamento de erros na função

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
- [ATUALIZADO] Documentar lições aprendidas e melhores práticas:
  - Sempre verificar permissões RLS ao implementar novas funcionalidades
  - Testar funções PostgreSQL com diferentes contextos de usuário
  - Implementar sistema robusto de logs para facilitar depuração
  - Padronizar retorno de funções para garantir consistência na interface
  - Implementar formatação de erros padronizada em todo o sistema
  - Garantir exibição detalhada de erros para facilitar depuração
  - Usar SECURITY DEFINER em funções PostgreSQL que precisam ignorar RLS
  - Evitar múltiplos métodos de fallback quando um único método bem implementado é suficiente
  - Reutilizar componentes e funções existentes ao invés de criar novas com funcionalidade similar
  - Sempre verificar o contexto do usuário antes de executar operações que exigem permissões específicas
  - Garantir que emails de usuários sejam sempre obtidos e armazenados em todas as tabelas relacionadas

## Próximos Passos (Priorizados)
1. Implementar a Fase 5: Aprimoramento do Sistema de Logs
2. Implementar a Fase 7: Testes e Validação
3. Retornar aos problemas pendentes: melhorar geração de PDFs e visualização de respostas
4. Continuar implementação do editor de questionários

## Tarefas Concluídas (Últimas adições)
- Implementação completa da Fase 4: Refatoração da Função completeQuizManually
- Simplificação da lógica de fluxo removendo métodos redundantes de fallback
- Padronização da estrutura de retorno para melhor tratamento de erros
- Adição de validações para campos obrigatórios como email do usuário
- Atualização da função PostgreSQL complete_quiz com melhores práticas de logs e tratamento de erros
- Melhoria na obtenção do email do usuário, tentando múltiplas fontes como perfil e auth.users
- Correção de bugs na função completeQuizManually onde emails não estavam sendo corretamente propagados
