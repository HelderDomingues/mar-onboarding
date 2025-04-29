
import React, { useState } from 'react';
import { supabase, SUPABASE_ANON_KEY } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertCircle, RefreshCw } from 'lucide-react';

/**
 * Componente para testar as políticas de segurança (RLS) das tabelas
 */
const SecurityPolicyTester: React.FC = () => {
  const [table, setTable] = useState<string>('profiles');
  const [operation, setOperation] = useState<string>('select');
  const [userId, setUserId] = useState<string>('');
  const [result, setResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Lista de tabelas disponíveis com tipagem segura
  const tables = ['profiles', 'quiz_questions', 'quiz_submissions', 'materials', 'user_roles'] as const;
  type TableName = typeof tables[number];
  
  const operations = ['select', 'insert', 'update', 'delete', 'rpc'] as const;
  type OperationType = typeof operations[number];
  
  const testSecurityPolicy = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);
    
    try {
      let response;
      
      // Adicionar headers explícitos em cada requisição para garantir que a API key seja enviada
      const options = {
        headers: {
          'apikey': SUPABASE_ANON_KEY,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };
      
      if (operation === 'rpc') {
        // Testar uma função RPC específica (is_admin)
        response = await supabase.rpc('is_admin');
      } else {
        switch (operation as OperationType) {
          case 'select':
            response = await supabase
              .from(table as TableName)
              .select('*')
              .limit(10);
            break;
          case 'insert': {
            // Gerar um objeto de dados adequado para a tabela atual
            const mockData = generateMockData(table as TableName);
            response = await supabase
              .from(table as TableName)
              .insert([mockData])
              .select();
            break;
          }
          case 'update': {
            // Gerar um objeto de dados para atualização
            const updateData = generateUpdateData(table as TableName);
            response = await supabase
              .from(table as TableName)
              .update(updateData)
              .eq('id', userId || 'test-id')
              .select();
            break;
          }
          case 'delete':
            response = await supabase
              .from(table as TableName)
              .delete()
              .eq('id', userId || 'test-id')
              .select();
            break;
          default:
            throw new Error('Operação não suportada');
        }
      }
      
      if (userId && operation === 'select') {
        const userIdField = table === 'profiles' ? 'id' : 'user_id';
        response = await supabase
          .from(table as TableName)
          .select('*')
          .eq(userIdField, userId);
      }
      
      const { data, error } = response;
      
      if (error) {
        throw error;
      }
      
      setResult({ success: true, data });
    } catch (error: any) {
      setErrorMessage(error.message || 'Erro desconhecido');
      setResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para gerar dados de teste apropriados para cada tabela
  const generateMockData = (tableName: TableName) => {
    const mockId = crypto.randomUUID();
    
    switch (tableName) {
      case 'profiles':
        return { 
          id: userId || mockId, 
          full_name: 'Usuário de Teste', 
          user_email: 'teste@exemplo.com' 
        };
      case 'materials':
        return { 
          title: 'Material de Teste', 
          file_url: 'https://example.com/test.pdf' 
        };
      case 'quiz_questions':
        return { 
          module_id: mockId,
          text: 'Pergunta de teste?', 
          type: 'text',
          order_number: 1 
        };
      case 'quiz_submissions':
        return { 
          user_id: userId || mockId, 
          user_email: 'teste@exemplo.com' 
        };
      case 'user_roles':
        return { 
          user_id: userId || mockId, 
          role: 'user',
          user_email: 'teste@exemplo.com'
        };
      default:
        return { id: mockId };
    }
  };

  // Função para gerar dados de atualização apropriados para cada tabela
  const generateUpdateData = (tableName: TableName) => {
    switch (tableName) {
      case 'profiles':
        return { full_name: 'Nome Atualizado' };
      case 'materials':
        return { title: 'Material Atualizado' };
      case 'quiz_questions':
        return { text: 'Pergunta atualizada?' };
      case 'quiz_submissions':
        return { completed: true };
      case 'user_roles':
        return { role: 'admin' };
      default:
        return { updated: true };
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Teste de Políticas de Segurança (RLS)</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium leading-none pb-1">Tabela</label>
            <Select onValueChange={(value) => setTable(value)} defaultValue={table}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma tabela" />
              </SelectTrigger>
              <SelectContent>
                {tables.map(tableOption => (
                  <SelectItem key={tableOption} value={tableOption}>{tableOption}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium leading-none pb-1">Operação</label>
            <Select onValueChange={(value) => setOperation(value)} defaultValue={operation}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma operação" />
              </SelectTrigger>
              <SelectContent>
                {operations.map(op => (
                  <SelectItem key={op} value={op}>{op}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium leading-none pb-1">User ID (opcional)</label>
          <Textarea 
            placeholder="ID do usuário para testar a política (se aplicável)"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
          />
        </div>
        
        {errorMessage && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
        
        {result && (
          <div className="rounded-md border p-4 bg-muted">
            <h4 className="text-sm font-medium">Resultado:</h4>
            {result.success ? (
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Sucesso
              </Badge>
            ) : (
              <Badge variant="outline" className="bg-red-50 text-red-700">
                Falha
              </Badge>
            )}
            
            {result.data && (
              <div className="mt-2 text-xs">
                <pre>{JSON.stringify(result.data, null, 2)}</pre>
              </div>
            )}
            
            {result.error && (
              <div className="mt-2 text-xs text-red-600">
                Erro: {result.error}
              </div>
            )}
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button 
          onClick={testSecurityPolicy} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
              Testando...
            </>
          ) : (
            'Testar Política de Segurança'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SecurityPolicyTester;
