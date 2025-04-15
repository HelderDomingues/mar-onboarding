
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
- [EM ANDAMENTO] Implementar testes abrangentes:
  - [CONCLUÍDO] Testar fluxo completo de conclusão do questionário
  - [CONCLUÍDO] Verificar exibição de erros em diferentes cenários
  - [CONCLUÍDO] Validar comportamento com dados ausentes ou inválidos
  - [EM ANDAMENTO] Confirmar que as políticas RLS estão funcionando corretamente
  - [PENDENTE] Validar integração com Make.com usando dados de teste

#### FASE 9: Resolução Final de Problemas de Integração com Make.com
- [CONCLUÍDO] Implementação completa da solução:
  - [CONCLUÍDO] Refatoração total da edge function quiz-webhook
  - [CONCLUÍDO] Validação e sanitização de entrada
  - [CONCLUÍDO] Tratamento de erros e casos excepcionais
  - [CONCLUÍDO] Maior resiliência a falhas temporárias
  - [CONCLUÍDO] Limite de taxa para prevenção de ataques
  - [CONCLUÍDO] Melhoria da interface de teste de webhook
  - [CONCLUÍDO] Documentação completa de funcionamento

### Micro Tarefas Detalhadas

#### Para FASE 9: Resolução Final de Problemas de Integração com Make.com (CONCLUÍDO)
1. [CONCLUÍDO] Redesenhar a edge function quiz-webhook para maior robustez:
   - Implementar validação de payloads
   - Sanitizar dados antes de envio
   - Adicionar fallbacks para busca de dados
   - Incluir limite de taxa de requisições
   - Rastrear IP dos solicitantes
   - Adicionar logs detalhados
2. [CONCLUÍDO] Atualizar serviço webhook:
   - Melhorar retorno de erros e manipulação
   - Uniformizar formato de resposta
   - Adicionar validação de entrada
3. [CONCLUÍDO] Aprimorar interface de teste:
   - Exibir detalhes da resposta do webhook
   - Adicionar dicas para resolução de problemas
   - Melhorar feedback visual
4. [CONCLUÍDO] Garantir compatibilidade com Make.com:
   - Normalizar dados para formato plano
   - Lidar com campos nulos
   - Assegurar estrutura de resposta esperada

## Problemas e Soluções Anteriores

### Erros na Integração com Make.com
- [CONCLUÍDO] Erro na edge function quando submissão não existe:
  - Problema identificado: Falha ao buscar dados da submissão
  - Soluções implementadas:
    - [CONCLUÍDO] Reescrita da edge function para lidar com casos de erro
    - [CONCLUÍDO] Adição de fallbacks para dados ausentes ou inválidos 
    - [CONCLUÍDO] Validação antes da construção do payload
    - [CONCLUÍDO] Sanitização de dados para evitar erros no Make.com
    - [CONCLUÍDO] Melhoria no sistema de logs para facilitar diagnóstico

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

## Lições Aprendidas e Melhores Práticas
- [ATUALIZADO] Documentar lições aprendidas e melhores práticas:
  - Sempre verificar permissões RLS ao implementar novas funcionalidades
  - Implementar validação completa de entradas em funções e APIs
  - Adicionar fallbacks para cenários de erro e dados ausentes
  - Estruturar respostas para compatibilidade com serviços de terceiros
  - Não depender apenas de uma estrutura de dados, considerar alternativas
  - Implementar limites de taxa para prevenir abusos
  - Sempre validar formatos de objeto antes de processá-los
  - Manter logs detalhados para facilitar diagnóstico de problemas

## Próximos Passos (Priorizados)
1. Verificar funcionamento da integração com Make.com com dados reais
2. Continuar implementação do editor de questionários
3. Retornar à configuração da chave service_role
4. Expandir documentação técnica do sistema

## Tarefas Concluídas (Últimas adições)
- Resolução completa dos problemas da edge function quiz-webhook
- Implementação de limite de taxa para prevenir abusos
- Adição de fallbacks para casos de dados ausentes
- Melhoria da interface do componente WebhookTester
- Documentação atualizada com lições aprendidas
