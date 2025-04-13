import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
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
  
  const tables = ['profiles', 'quiz_questions', 'quiz_submissions', 'materials'];
  const operations = ['select', 'insert', 'update', 'delete'];
  
  const testSecurityPolicy = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    setResult(null);
    
    try {
      let query = supabase.from(table);
      
      switch (operation) {
        case 'select':
          query = query.select('*');
          break;
        case 'insert':
          query = query.insert({ id: userId || 'test-id', name: 'Test User' });
          break;
        case 'update':
          query = query.update({ name: 'Updated User' }).eq('id', userId || 'test-id');
          break;
        case 'delete':
          query = query.delete().eq('id', userId || 'test-id');
          break;
        default:
          throw new Error('Operação não suportada');
      }
      
      if (userId) {
        query = query.eq('user_id', userId);
      }
      
      const { data, error } = await query;
      
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
            <Select onValueChange={setTable} defaultValue={table}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma tabela" />
              </SelectTrigger>
              <SelectContent>
                {tables.map(table => (
                  <SelectItem key={table} value={table}>{table}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium leading-none pb-1">Operação</label>
            <Select onValueChange={setOperation} defaultValue={operation}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma operação" />
              </SelectTrigger>
              <SelectContent>
                {operations.map(operation => (
                  <SelectItem key={operation} value={operation}>{operation}</SelectItem>
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
