
# Plano de Ação - Sistema MAR da Crie Valor

## Análise do Código Existente

### Problemas Identificados

1. **Erros de Tipagem Supabase**:
   - Os erros de build indicam que as definições de tipagem do Supabase não estão corretamente configuradas, resultando em erros como "Argument of type 'string' is not assignable to parameter of type 'never'".
   - A integração com o Supabase foi iniciada, mas não completada corretamente.

2. **Referências Ausentes**:
   - Referências a `supabaseAdmin` e `getUserEmails` que não existem no cliente Supabase atual.
   - Falta de definição das tabelas no arquivo de tipos do Supabase.

3. **Componentes Sobrecarregados**:
   - Vários arquivos (QuizReview.tsx, Quiz.tsx, useAuth.tsx) estão muito extensos, dificultando a manutenção.

4. **Erros de Autenticação**:
   - Problemas com JWT e autenticação, conforme mencionado nas mensagens anteriores.

5. **Inconsistências no Código**:
   - Funções que dependem de estruturas de banco de dados inexistentes.
   - Chamadas a funções e métodos que ainda não foram implementados.

### Aspectos Funcionais a Preservar

1. **Estrutura do Questionário (Quiz)**:
   - A lógica de módulos, questões e opções já está bem definida.
   - O fluxo de navegação entre módulos do questionário está implementado.

2. **Componentes de UI**:
   - Dashboard, layouts e componentes de UI estão bem estruturados.
   - Utilizando o shadcn/ui de forma eficiente.

3. **Autenticação**:
   - A lógica base de autenticação existe, mas precisa ser corrigida.

## Plano de Ação Inicial

### Fase 1: Configuração do Banco de Dados Supabase

1. **Definir Schema do Banco de Dados**
   - [x] Criar tabela `profiles` para informações do usuário
   - [ ] Criar tabela `user_roles` para gerenciamento de permissões
   - [ ] Criar tabela `quiz_modules` para módulos do questionário
   - [ ] Criar tabela `quiz_questions` para questões do questionário
   - [ ] Criar tabela `quiz_options` para opções de resposta
   - [ ] Criar tabela `quiz_answers` para respostas dos usuários
   - [ ] Criar tabela `quiz_submissions` para controlar submissões de questionários
   - [ ] Configurar políticas de Row Level Security (RLS)

2. **Corrigir Definições de Tipos**
   - [ ] Atualizar arquivo de tipagem do Supabase
   - [ ] Corrigir referências de tipagem nos componentes

3. **Implementar Cliente Supabase**
   - [ ] Configurar cliente Supabase básico
   - [ ] Implementar função `supabaseAdmin` para operações administrativas
   - [ ] Implementar função `getUserEmails` para acesso aos emails dos usuários

### Fase 2: Autenticação e Autorização

4. **Revisar Sistema de Autenticação**
   - [ ] Corrigir hook `useAuth` para gerenciar sessão corretamente
   - [ ] Implementar verificação de papel de administrador
   - [ ] Configurar usuário admin inicial (helder@crievalor.com.br)

5. **Implementar Controle de Acesso**
   - [ ] Configurar rotas protegidas
   - [ ] Implementar verificações de admin nas rotas administrativas
   - [ ] Testar fluxos de autenticação

### Fase 3: Sistema de Questionários

6. **Revisar e Corrigir Componentes de Questionário**
   - [ ] Refatorar componentes extensos (QuizReview.tsx, Quiz.tsx)
   - [ ] Corrigir chamadas à API Supabase nos componentes
   - [ ] Implementar persistência de respostas

7. **Implementar Funcionalidades Admin**
   - [ ] Criar páginas de visualização de respostas para admin
   - [ ] Implementar exportação de respostas em PDF
   - [ ] Implementar exportação de respostas em formato planilha (CSV)

### Fase 4: Testes e Otimização

8. **Testes de Funcionalidade**
   - [ ] Testar fluxo de usuário completo
   - [ ] Testar permissões de administrador
   - [ ] Verificar exportação de dados

9. **Otimização e Limpeza**
   - [ ] Remover código não utilizado
   - [ ] Otimizar consultas ao banco de dados
   - [ ] Ajustar estilos e responsividade

## Próximos Passos Prioritários

1. **Criar Schema do Banco de Dados no Supabase**:
   - Definir todas as tabelas necessárias
   - Configurar relações entre tabelas
   - Implementar políticas RLS para segurança dos dados

2. **Corrigir Definições de Tipos e Cliente Supabase**:
   - Atualizar arquivo database.types.ts com as definições corretas
   - Implementar funções auxiliares necessárias (supabaseAdmin, getUserEmails)

3. **Refatorar e Corrigir Hook de Autenticação**:
   - Dividir useAuth.tsx em partes menores
   - Garantir que a verificação de admin funcione corretamente
   - Testar fluxo de autenticação completo

4. **Revisar e Corrigir Quiz.tsx e QuizReview.tsx**:
   - Refatorar em componentes menores
   - Garantir que as chamadas ao Supabase funcionem corretamente
   - Verificar se o fluxo de questionário está funcionando

5. **Implementar Página de Admin para Visualização de Respostas**:
   - Criar interface para o admin visualizar respostas de usuários
   - Implementar funcionalidade de exportação (PDF e CSV)
   - Testar com o usuário helder@crievalor.com.br
