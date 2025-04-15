
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
- [CONCLUÍDO] Expandir o sistema de logs:
  - [CONCLUÍDO] Adicionar mais pontos de log nas funções críticas
  - [CONCLUÍDO] Criar categorias específicas para erros de permissão
  - [CONCLUÍDO] Implementar rastreamento de valores antes/depois de operações críticas
  - [CONCLUÍDO] Melhorar o formato dos logs para facilitar depuração

#### FASE 6: Otimização do Webhook e Integração com Make.com
- [CONCLUÍDO] Refatorar a edge function de webhook:
  - [CONCLUÍDO] Melhorar tratamento de erros e logging
  - [CONCLUÍDO] Estruturar dados no formato ideal para Make.com
  - [CONCLUÍDO] Implementar validação de payload
  - [CONCLUÍDO] Adicionar rastreamento detalhado de operações
- [CONCLUÍDO] Adaptar formato de dados para Make.com:
  - [CONCLUÍDO] Modificar estrutura JSON para formato plano sem aninhamento
  - [CONCLUÍDO] Usar nomes de variáveis compatíveis com Make.com
  - [CONCLUÍDO] Incluir metadados essenciais para rastreamento
  - [CONCLUÍDO] Criar componente de teste para validar webhook

#### FASE 7: Limpeza e Normalização do Banco de Dados
- [CONCLUÍDO] Remover tabelas de backup desnecessárias
- [CONCLUÍDO] Consolidar estrutura de opções
- [CONCLUÍDO] Eliminar estruturas não utilizadas
- [CONCLUÍDO] Padronizar nomenclatura (is_complete vs completed)

#### FASE 8: Testes e Validação
- [PENDENTE] Implementar testes abrangentes:
  - Testar fluxo completo de conclusão do questionário
  - Verificar exibição de erros em diferentes cenários
  - Validar comportamento com dados ausentes ou inválidos
  - Confirmar que as políticas RLS estão funcionando corretamente

### Micro Tarefas Detalhadas

#### Para FASE 5: Aprimoramento do Sistema de Logs (CONCLUÍDO)
1. [CONCLUÍDO] Adicionar logs específicos para operações no banco de dados
2. [CONCLUÍDO] Implementar logs de valores antes/depois de operações críticas
3. [CONCLUÍDO] Criar sistema de categorização para diferentes tipos de erro

#### Para FASE 6: Otimização do Webhook e Integração com Make.com (CONCLUÍDO)
1. [CONCLUÍDO] Refatorar a edge function quiz-webhook com formato otimizado
2. [CONCLUÍDO] Implementar sistema robusto de captura e tratamento de erros
3. [CONCLUÍDO] Adicionar timestamps e códigos de erro para rastreamento
4. [CONCLUÍDO] Criar componente de teste para verificar conexão com webhook
5. [CONCLUÍDO] Atualizar serviço webhookService.ts com logs detalhados
6. [CONCLUÍDO] Implementar chamada assíncrona do webhook após conclusão do questionário

#### Para FASE 7: Limpeza e Normalização do Banco de Dados (CONCLUÍDO)
1. [CONCLUÍDO] Remover todas as tabelas com sufixo _backup
2. [CONCLUÍDO] Migrar dados de options_json para tabela quiz_options
3. [CONCLUÍDO] Remover tabela quiz_sections e suas referências
4. [CONCLUÍDO] Padronizar campo completed em quiz_submissions

#### Para FASE 8: Testes e Validação (PENDENTE)
1. [PENDENTE] Criar rotina de teste para fluxo completo do usuário
2. [PENDENTE] Implementar testes para verificar políticas RLS
3. [PENDENTE] Validar integração com Make.com usando dados reais

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

### Erro 42501 (Permission Denied)
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
- [CONCLUÍDO] Melhorias na exibição e formato das respostas:
  - [CONCLUÍDO] Criado utilitário formatUtils.ts para lidar com formatação de respostas JSON
  - [CONCLUÍDO] Melhorado componente QuizViewAnswers para exibir respostas formatadas
  - [CONCLUÍDO] Adicionado botão de exportação de CSV
  - [CONCLUÍDO] Modificado formato de dados para Make.com
  - [CONCLUÍDO] Adicionada uma visualização melhor para respostas de checkbox/radio

### Problemas com integração Make.com
- [CONCLUÍDO] Otimização da integração com Make.com:
  - [CONCLUÍDO] Modificada a estrutura JSON para formato plano sem aninhamento
  - [CONCLUÍDO] Ajustada função gerar_respostas_json para criar variáveis compatíveis
  - [CONCLUÍDO] Refatorada a edge function quiz-webhook para melhor tratamento de erros
  - [CONCLUÍDO] Adicionado componente WebhookTester para validar a conexão
  - [CONCLUÍDO] Implementada chamada assíncrona do webhook para não bloquear o usuário

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
  - Estruturar dados para integração com serviços externos (como Make.com) em formato plano e simples
  - Evitar aninhamento excessivo de objetos em estruturas JSON destinadas a integrações
  - Implementar componentes de teste para validar integrações externas
  - Utilizar chamadas assíncronas para operações secundárias que não devem bloquear o usuário

## Próximos Passos (Priorizados)
1. Implementar a Fase 8: Testes e Validação
2. Retornar aos problemas pendentes: configuração da chave service_role
3. Continuar implementação do editor de questionários
4. Expandir documentação técnica do sistema

## Tarefas Concluídas (Últimas adições)
- Implementação completa da Fase 5: Aprimoramento do Sistema de Logs
- Implementação completa da Fase 6: Otimização do Webhook e Integração com Make.com
- Implementação completa da Fase 7: Limpeza e Normalização do Banco de Dados
- Refatoração da edge function quiz-webhook para formato otimizado para Make.com
- Criação de componente WebhookTester para validar a integração
- Função SQL get_user_email para melhorar obtenção de emails
- Implementação de chamada assíncrona do webhook após conclusão do questionário
