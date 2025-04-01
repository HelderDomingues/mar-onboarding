
# Documentação do Projeto Quiz Vault - Crie Valor

## Visão Geral
Este é um sistema de questionário privado, exclusivo para membros do sistema Crie Valor, onde cada usuário terá acesso apenas ao seu próprio conteúdo e respostas. O sistema é desenvolvido em português brasileiro e utiliza Supabase para autenticação e armazenamento de dados.

## Componentes Principais

### Sistema de Autenticação
- Implementado via Supabase Auth
- Login com email/senha
- Proteção de rotas para acessos não autorizados
- Configurações de sessão persistente

### Sistema de Logs
- Implementado um logger customizado em `src/utils/logger.ts`
- Níveis de log: info, warn, error, debug
- Logs com timestamp, nível, tag e dados adicionais
- Capacidade de habilitar/desabilitar logs

### Questionário
- Interface responsiva 
- Diferentes tipos de perguntas: múltipla escolha, checkbox, texto
- Sistema de progresso para acompanhamento
- Persistência de respostas

## Estrutura do Banco de Dados
(A ser desenvolvido conforme necessário)

## Fluxo de Autenticação
1. Usuário acessa a página inicial
2. Se não autenticado, é direcionado para a página de login
3. Após autenticação, é redirecionado para o dashboard
4. Ao acessar o questionário, as respostas são vinculadas ao ID do usuário

## Telas Principais
1. **Login**: Autenticação do usuário
2. **Dashboard**: Visão geral e acesso ao questionário
3. **Questionário**: Perguntas e respostas
4. **Resultados**: Visualização após conclusão

## Notas de Desenvolvimento
- Idioma principal: Português Brasileiro
- Framework: React + Vite + Typescript
- Estilização: Tailwind CSS + ShadcnUI
- Backend: Supabase (autenticação, armazenamento, banco de dados)

## Logs e Depuração
O sistema de logs foi implementado para facilitar a depuração e monitoramento da aplicação. Todos os eventos importantes, como tentativas de login, navegação entre páginas e submissão de respostas são registrados.

## Próximos Passos
- Implementar tabelas no Supabase para armazenamento das respostas
- Criar políticas de RLS para garantir a privacidade dos dados
- Desenvolver funcionalidades para administradores visualizarem todas as respostas
