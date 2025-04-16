
# Sistema MAR - Tarefas de Desenvolvimento

## Problemas Identificados e Soluções

### 1. Problemas com scripts de recuperação e seed do questionário
   - **Problema**: Scripts contendo UUIDs fixos causando conflitos no banco de dados
   - **Solução**: Criar versão simplificada do script de seed sem UUIDs fixos (implementado)

### 2. API de recuperação do questionário com problemas
   - **Problema**: Implementação incorreta do endpoint `/api/recover-quiz`
   - **Solução**: Refatorar completamente a API para limpar dados e executar o seed (implementado)

### 3. Sidebar do admin desconfigurada
   - **Problema**: Componente incorretamente implementado e rotas mal definidas
   - **Solução**: Recriar completamente o componente AdminSidebar e corrigir AdminRoute (implementado)

### 4. Problemas na página de teste de conexão
   - **Problema**: Falta de funcionalidade para inicializar o questionário
   - **Solução**: Adicionar botão para inicialização do questionário diretamente da página (implementado)

## Próximos Passos

### Fase 1: Teste e estabilização (Atual)
- [x] Corrigir API de recuperação
- [x] Implementar script de seed simplificado
- [x] Corrigir sidebar administrativa
- [x] Adicionar inicialização do questionário na página de teste de conexão

### Fase 2: Melhorias de usabilidade
- [ ] Implementar página de diagnóstico de sistema mais completa
- [ ] Melhorar feedback visual durante carregamentos e operações de recuperação
- [ ] Implementar mecanismo de backup/restore dos dados do questionário

### Fase 3: Funcionalidades avançadas
- [ ] Implementar validação de consistência dos dados do questionário
- [ ] Adicionar histórico de recuperações e alterações no questionário
- [ ] Implementar sistema de versionamento para o questionário

## Notas Importantes

- A nova abordagem de seed não utiliza IDs fixos (UUIDs), melhorando a compatibilidade
- A página `/test-connection` agora permite inicializar o questionário diretamente
- Para recuperação de emergência, a URL `/api/recover-quiz?key=recover-quiz-mar` está disponível
- A sidebar admin foi completamente refeita utilizando o componente Shadcn/UI corretamente
