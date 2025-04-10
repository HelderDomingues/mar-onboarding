
# Plano de Ação - Sistema MAR da Crie Valor

## Análise do Código Existente e Planejamento

### Estrutura do Banco de Dados Implementada
- [x] Criação da tabela `profiles` para perfis de usuários
- [x] Criação da tabela `quiz_questions` para armazenar perguntas do questionário
- [x] Criação da tabela `quiz_answers` para armazenar respostas dos usuários
- [x] Criação da tabela `quiz_submissions` para controlar progresso e submissões
- [x] Criação da tabela `quiz_respostas_completas` para formatação para webhook
- [x] Implementação de funções e triggers para automação do processamento
- [x] Configuração de políticas de Row Level Security (RLS) para segurança dos dados

### Próximos Passos

1. **Implementação do Webhook para Make.com**
   - [ ] Criar edge function para processar submissões completas
   - [ ] Implementar lógica para enviar dados em formato compatível com Make.com
   - [ ] Adicionar marcação de submissões processadas

2. **Populando Banco de Dados com Questionário**
   - [ ] Inserir as 40 perguntas do questionário MAR com seus respectivos módulos
   - [ ] Configurar os tipos de perguntas e opções para múltipla escolha

3. **Implementação da Interface do Usuário**
   - [ ] Ajustar componentes existentes para utilizar o novo modelo de dados
   - [ ] Implementar formulário de questionário com navegação entre módulos
   - [ ] Criar página de revisão final de respostas
   - [ ] Implementar sistema de progresso e conclusão do questionário

4. **Interface de Administração**
   - [ ] Criar página para visualização de todas as respostas
   - [ ] Implementar exportação de respostas em formato CSV
   - [ ] Adicionar funcionalidade de revisão individual por usuário
   - [ ] Implementar controles para disparar webhook manualmente

5. **Autenticação e Autorização**
   - [ ] Ajustar lógica de autenticação para utilizar Supabase
   - [ ] Implementar verificação de perfil de administrador
   - [ ] Configurar rotas protegidas baseadas em autenticação

6. **Testes e Otimização**
   - [ ] Testar fluxo completo do questionário
   - [ ] Verificar envio de dados para webhook do Make.com
   - [ ] Otimizar consultas ao banco de dados
   - [ ] Verificar e corrigir possíveis erros

## Progresso Atual

- [x] Configuração inicial do banco de dados Supabase
- [ ] Implementação do webhook para integração com Make.com
- [ ] População do banco com as perguntas do questionário
- [ ] Ajuste dos componentes de UI para o novo modelo de dados

