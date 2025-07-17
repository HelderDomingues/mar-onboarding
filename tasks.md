# Sistema MAR - Crie Valor Consultoria

## Contextualização do Projeto - ATENÇÃO: ESTE HEADER NÃO DEVE SER ALTERADO, EXCLUIDO OU SUBSTITUIDO. DEVE CONSTAR EM TODAS AS INSTANCIAS/ATUALIZAÇÕES DO ARQUIVO. 

O Sistema MAR é uma plataforma revolucionária de diagnóstico empresarial que democratiza o acesso a ferramentas estratégicas de alto nível. Mais do que um simples questionário de 52 perguntas, o MAR representa um ecossistema completo de análise que:

- **Transforma dados em insights acionáveis** para empresários e gestores
- **Democratiza o acesso** a métodos avançados de análise estratégica
- **Escala conhecimento especializado** que normalmente seria limitado a consultorias premium
- **Cria benchmarks e posicionamentos** baseados em dados reais do mercado
- **Gera roteiros práticos** para implementação de melhorias

### Disrupção e Impacto

O sistema rompe com o modelo tradicional de consultoria ao:
- Tornar acessível o que antes era exclusivo de grandes empresas
- Permitir diagnósticos rápidos e precisos sem grandes investimentos
- Criar uma base de conhecimento compartilhada e evolutiva
- Empoderar pequenos e médios empresários com ferramentas profissionais
- Converter análises complexas em direcionamentos claros

### Escalabilidade

O projeto foi concebido para:
- Aplicação global, adaptável a diferentes mercados e contextos empresariais
- Evolução contínua através de machine learning e análise de dados
- Especialização por setores e nichos específicos
- Integração com outros sistemas e ferramentas de gestão
- Criação de uma comunidade de usuários que se beneficiam mutuamente

### Princípios de Experiência do Usuário

- **Simplicidade**: Interface intuitiva que guia o usuário através de processos complexos
- **Transparência**: Clareza sobre como os dados são processados e utilizados
- **Valor imediato**: Entrega de insights úteis desde as primeiras interações
- **Aprendizado integrado**: O sistema educa enquanto analisa
- **Resultados práticos**: Foco em recomendações implementáveis e mensuráveis

O Sistema MAR não é apenas uma ferramenta, mas uma nova abordagem para consultoria estratégica, criando valor real através da democratização do conhecimento e da análise de dados empresariais.

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
- [EM ANDAMENTO] Remover tabelas de backup desnecessárias:
  - [PENDENTE] Criar script SQL para remover tabelas *_backup
  - [PENDENTE] Executar remoção após backup dos dados
- [EM ANDAMENTO] Consolidar estrutura de opções:
  - [PENDENTE] Padronizar uso de campos options vs options_json
  - [PENDENTE] Remover campos duplicados
- [EM ANDAMENTO] Eliminar estruturas não utilizadas:
  - [PENDENTE] Identificar tabelas e colunas sem uso
  - [PENDENTE] Remover após validação
- [EM ANDAMENTO] Padronizar nomenclatura:
  - [PENDENTE] Corrigir inconsistência entre is_complete vs completed
  - [PENDENTE] Verificar e corrigir questões de pluralização em nomes de colunas

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

#### FASE 10: Refatoração e Modularização de Código [NOVA]
- [EM ANDAMENTO] Refatorar arquivos grandes em módulos menores:
  - [PENDENTE] Dividir quiz-webhook/index.ts em módulos funcionais
  - [PENDENTE] Refatorar webhookService.ts em componentes menores
  - [PENDENTE] Extrair lógicas comuns para utilitários reutilizáveis
- [PENDENTE] Eliminar código redundante e morto:
  - [PENDENTE] Remover imports não utilizados
  - [PENDENTE] Eliminar funções duplicadas ou obsoletas
  - [PENDENTE] Padronizar abordagens para operações comuns

#### FASE 11: Correção da Implementação do Questionário MAR [NOVA]
- [EM ANDAMENTO] Implementar corretamente o questionário MAR:
  - [CONCLUÍDO] Limpar dados existentes do questionário (apenas dados de teste)
  - [CONCLUÍDO] Corrigir o script seed-quiz.ts para mapear corretamente as questões
  - [CONCLUÍDO] Inserir EXATAMENTE as 52 perguntas fornecidas, sem alterações
  - [CONCLUÍDO] Inserir TODAS as opções de resposta conforme o questionário original
  - [CONCLUÍDO] Configurar corretamente todos os tipos de perguntas (text, radio, checkbox, etc.)
  - [CONCLUÍDO] Implementar o módulo "Objetivos e Desafios" (Módulo 8) com questões numeradas de 51 a 56
  - [EM ANDAMENTO] Implementar os módulos 9, 10, 11, 12 e 13 com todas as questões correspondentes
  - [PENDENTE] Testar a exibição e funcionamento correto do questionário

#### FASE 12: Problemas com a Sidebar [NOVA]
- [PENDENTE] Correção de problemas de UI na sidebar:
  - [PENDENTE] Resolver problema dos botões invisíveis no estado normal
  - [PENDENTE] Corrigir funcionalidade do botão "Ocultar Sidebar"
  - [PENDENTE] Reorganizar estrutura do componente AdminSidebar
  - [PENDENTE] Corrigir integração com o SidebarProvider
  - [PENDENTE] Melhorar contraste e visibilidade dos elementos da sidebar

### Micro Tarefas Detalhadas

#### Para FASE 11: Implementação Completa do Questionário MAR
1. [CONCLUÍDO] Correção do Script de Seed do Questionário:
   - [CONCLUÍDO] Remoção das opções existentes (são apenas dados de teste)
   - [CONCLUÍDO] Uso das perguntas exatas fornecidas no questionário MAR
   - [CONCLUÍDO] Implementação precisa de todas as opções de resposta
   - [CONCLUÍDO] Correção da lógica de mapeamento entre questões e opções
   - [CONCLUÍDO] Criação de interface para inserção de módulos individuais
   - [CONCLUÍDO] Implementação do módulo "Objetivos e Desafios" com questões numeradas corretamente (51-56)
   - [PENDENTE] Testes de validação após a execução do script

2. [PENDENTE] Validação da Implementação:
   - [PENDENTE] Verificar se todas as 52 perguntas foram implementadas corretamente
   - [PENDENTE] Confirmar que todas as opções de resposta estão disponíveis
   - [PENDENTE] Testar o fluxo completo do questionário com as perguntas corretas
   - [PENDENTE] Validar o armazenamento correto das respostas no banco de dados

#### Para FASE 12: Sidebar [NOVA]
1. [PENDENTE] Análise dos problemas da sidebar:
   - [PENDENTE] Investigar problemas de visibilidade dos botões da sidebar
   - [PENDENTE] Analisar falha na funcionalidade de toggle da sidebar
   - [PENDENTE] Verificar implementação correta do contexto da sidebar
   - [PENDENTE] Corrigir aplicação de estilos e contraste no componente

2. [PENDENTE] Correção dos problemas:
   - [PENDENTE] Refatorar AdminSidebar.tsx para melhorar organização do código
   - [PENDENTE] Corrigir implementação do toggleSidebar
   - [PENDENTE] Atualizar estilos para garantir visibilidade dos elementos
   - [PENDENTE] Implementar testes para verificar comportamento correto da sidebar

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
  - Executar limpezas periódicas do banco de dados e código
  - Validar mudanças de forma incremental antes de marcar como concluídas
  - Usar EXATAMENTE os dados fornecidos pelo cliente sem modificações
  - Numerar corretamente as perguntas conforme sequência estabelecida

## Próximos Passos (Atualizados - FASE 2 EM ANDAMENTO)
1. [EM ANDAMENTO] **Fase 2 - Funcionalidades Core**: 
   - ✅ PDF Generator corrigido e simplificado
   - ✅ Links administrativos verificados e funcionais  
   - ✅ Quiz navigation testada (11 módulos, 68 questões)
   - 🔄 CSV export system em aprimoramento
2. [PENDENTE] **Fase 3 - Features Finais**: Webhook configuration, Material System
3. [PENDENTE] Validação end-to-end e testes de integração final
4. [PENDENTE] Limpeza das tabelas _backup e normalização do banco de dados
5. [PENDENTE] Expandir documentação técnica do sistema
6. [PENDENTE] Retornar para resolver os problemas da sidebar após completar o questionário

## Problema Crítico: Sidebar [IMPORTANTE]
Os problemas com a sidebar persistem após tentativas de correção. Foi documentado que:
- Os botões da sidebar ficam invisíveis no estado normal, só aparecem ao passar o mouse
- O botão "Ocultar Sidebar" não funciona corretamente
- Há problemas com os estilos e contrastes dos elementos

**NOTA**: Estamos priorizando a implementação do questionário conforme solicitado. Os problemas da sidebar serão tratados posteriormente após a finalização do questionário.

## Tarefas Concluídas (Últimas adições)
- [CONCLUÍDO] Documentação dos problemas persistentes com a sidebar
- [CONCLUÍDO] Atualização do plano para incluir módulos adicionais (9-13) do questionário
- [EM ANDAMENTO] Implementação do módulo 10 do questionário
