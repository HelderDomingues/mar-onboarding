
# Tarefas do Projeto Sistema MAR

## Concluídas

- [x] Configuração inicial do projeto React com Supabase
- [x] Implementação da autenticação básica (login/logout)
- [x] Criação de estrutura de roteamento
- [x] Implementação de controle de acesso baseado em funções (RBAC)
- [x] Criação de página de dashboard para usuários autenticados
- [x] Implementação do questionário MAR com múltiplos módulos
- [x] Integração com o Supabase para armazenamento de respostas
- [x] Correção de erro em useAuth.tsx (importação de React)
- [x] Correção de erro em Quiz.tsx (verificação de arrays)
- [x] Correção dos tipos de quiz.ts (adição de propriedade answers)
- [x] Implementação do sistema administrativo básico
- [x] Configuração de políticas de segurança (RLS) para tabelas de backup
- [x] Correção da exibição do sidebar na interface administrativa
- [x] Correção de erro de importação do AdminSidebar
- [x] Eliminação de arquivos duplicados (AdminRoute.tsx)
- [x] Implementação das funções RPC para backup de tabelas
- [x] Correção de erro de importação AdminRoute em AppRoutes.tsx
- [x] Correção de problema de exportação do ServiceRoleConfig
- [x] Implementação de funcionalidade básica de webhook para Make.com
- [x] Adição do tipo 'webhook' ao LogType e correção de erros relacionados
- [x] Criação de sistema de diagnóstico e ferramentas de recuperação
- [x] Implementação de recuperação forçada para dados do questionário
- [x] Correção do script de recuperação forçada (force-quiz-recovery.ts)
- [x] Criação de página dedicada de diagnóstico (/diagnostico) para problemas
- [x] Reescrita do script de inicialização para usar supabaseAdmin quando necessário
- [x] Melhorias nas ferramentas de diagnóstico do sistema

## Em Andamento

- [ ] Aprimorar download de relatório em PDF das respostas
- [ ] Implementar exportação de dados em formato CSV
- [ ] Melhorar a página de análise de respostas

## A Fazer

- [ ] Configurar webhooks para notificações externas
- [ ] Implementar sistema completo de materiais para usuários
- [ ] Adicionar visualização detalhada do progresso do usuário
- [ ] Expandir funcionalidades do painel administrativo
- [ ] Implementar backup automático de dados
- [ ] Implementar sistema de convites por e-mail
- [ ] Configurar pipeline de deploy contínuo

## Problemas Conhecidos e Solucionados

1. **Configuração da chave service_role**: Problemas persistentes ao configurar a chave de service_role. Após várias tentativas de correção, incluindo renomeação de colunas e atualização de funções no banco de dados, o problema persiste quando o botão de salvar configuração é clicado.
   - **Solução aplicada**: Modificado o script de seed para utilizar supabaseAdmin quando disponível.

2. **Erro ao carregar dados do questionário**: Questões e opções não são exibidas no editor de questionário.
   - **Solução aplicada**: Implementada recuperação forçada via `/diagnostico` e corrigidos problemas de permissões.

3. **Erro na página de usuários**: A função get_users_with_emails não está disponível ou faltam permissões.
   - **Solução sugerida**: Verificar e corrigir as políticas RLS para esta função.

4. **Erros ao exibir métricas e relatórios**: Dados não são carregados nas páginas de métricas.
   - **Solução em andamento**: Adicionar diagnóstico específico para estas funcionalidades.

## Notas Técnicas

- O sistema usa React 18 com hooks personalizados para gerenciamento de estado
- Supabase é utilizado como backend as a service (BaaS)
- Shadcn/UI para componentes de interface
- Tailwind CSS para estilização
- Integração com jsPDF para geração de relatórios em PDF

## Próximos Passos

1. Utilizar a página de diagnóstico `/diagnostico` para identificar e resolver problemas
2. Executar a recuperação forçada do questionário para garantir que todos os dados estejam presentes
3. Verificar as permissões RLS para garantir o acesso adequado aos dados
4. Implementar as funcionalidades de webhook para integração com Make.com
5. Expandir funcionalidades de relatórios e exportação de dados

## Melhorias Realizadas

- **29/04/2025**: Correção da exibição do sidebar administrativo, ajustando o layout e a estrutura dos componentes
- **29/04/2025**: Adicionado políticas de segurança RLS para tabelas de backup
- **29/04/2025**: Melhorada a experiência de navegação na área administrativa
- **29/04/2025**: Correção de erro de importação do AdminSidebar para garantir consistência entre arquivos
- **29/04/2025**: Implementação das funções RPC para backup e restauração de tabelas
- **29/04/2025**: Eliminação de arquivos duplicados para melhorar a manutenção do código
- **29/04/2025**: Correção de erros de importação e exportação de componentes
- **29/04/2025**: Adição do tipo 'webhook' ao LogType e correção de erros relacionados aos logs de webhook
- **29/04/2025**: Criação de sistema de diagnóstico de estrutura do banco de dados
- **29/04/2025**: Implementação de ferramentas de recuperação forçada para dados do questionário
- **29/04/2025**: Correção do script force-quiz-recovery.ts para remover chamadas from inexistentes
- **29/04/2025**: Adição de página dedicada de diagnóstico para resolver problemas do sistema
- **29/04/2025**: Reescrita do script de seed para usar supabaseAdmin quando necessário para evitar problemas de RLS
