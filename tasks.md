
# Sistema MAR - Crie Valor - Lista de Tarefas

## Tarefas Concluídas

- [x] Configuração inicial do projeto Supabase
- [x] Autenticação de usuários
- [x] Criação dos esquemas de dados para o questionário MAR
- [x] Dashboard do usuário
- [x] Dashboard do administrador
- [x] Página de exibição de respostas do questionário
- [x] Função para download de relatórios em PDF
- [x] Integração das tabelas de usuários com Supabase Auth
- [x] Configuração de Row Level Security (RLS)
- [x] Políticas de segurança para proteger dados dos usuários
- [x] Correção do erro "Label is not defined" na página de usuários
- [x] Melhoria na validação da chave service_role para acesso aos emails
- [x] Aprimoramento da interface de configuração de acesso aos emails com feedback mais claro
- [x] Correção da função de completar questionário
- [x] Correção da formatação de respostas JSON nas visualizações do questionário
- [x] Normalização do armazenamento de respostas no banco de dados
- [x] Criação de utilidade separada para formatação de respostas JSON
- [x] Criação da função RPC get_user_emails para acesso seguro aos emails dos usuários
- [x] Criação da função admin_create_user para criação segura de usuários pelo administrador
- [x] Implementação da função de criação de usuários pelo administrador no frontend

## Tarefas em Andamento

- [ ] Aprimoramento da geração de PDF com perguntas e respostas completas

## Próximos Passos

- [ ] Implementar integração para envio de relatório por email
- [ ] Adicionar opção de filtro avançado para análise de respostas
- [ ] Desenvolver painel de estatísticas para administradores
- [ ] Otimização da performance para grandes volumes de dados
- [ ] Implementar cache para consultas frequentes

## Otimizações e Refatorações Necessárias

- [ ] Refatorar o componente Users.tsx para reduzir complexidade e tamanho
- [ ] Refatorar pdfGenerator.ts para melhor organização do código
- [ ] Refatorar Quiz.tsx para reduzir tamanho e complexidade
- [ ] Refatorar QuizViewAnswers.tsx para melhor tratamento das respostas
- [ ] Refatorar supabaseUtils.ts para melhor organização

## Problemas Conhecidos

- [x] ~~Service Role Key não está sendo reconhecida corretamente~~ (Corrigido)
- [x] ~~Alguns emails de usuários não estão visíveis~~ (Corrigido)
- [x] ~~Função de completar questionário falha~~ (Corrigido)
- [x] ~~Respostas de múltipla escolha são exibidas em formato JSON bruto~~ (Corrigido)
- [ ] PDF gerado mostra apenas nomes dos módulos sem as perguntas e respostas
