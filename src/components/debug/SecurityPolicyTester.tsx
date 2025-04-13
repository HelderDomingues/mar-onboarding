import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, Play, ShieldCheck } from 'lucide-react';

/**
 * Componente para testar as políticas de segurança (RLS) das tabelas
 */
export const SecurityPolicyTester: React.FC = () => {
  const [selectedTable, setSelectedTable] = useState<string>('profiles');
  const [operation, setOperation] = useState<'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE'>('SELECT');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  const tables = [
    'profiles',
    'quiz_modules',
    'quiz_questions',
    'quiz_options',
    'quiz_answers',
    'quiz_submissions',
    'quiz_respostas_completas',
    'user_roles'
  ];
  
  const testAccess = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);
    
    try {
      let response;
      
      switch (operation) {
        case 'SELECT':
          response = await supabase
            .from(selectedTable)
            .select('*')
            .limit(5);
          break;
        case 'INSERT':
          // Apenas simula o insert sem realmente executar
          response = { data: 'Simulação de INSERT (não executado)', error: null };
          break;
        case 'UPDATE':
          // Apenas simula o update sem realmente executar
          response = { data: 'Simulação de UPDATE (não executado)', error: null };
          break;
        case 'DELETE':
          // Apenas simula o delete sem realmente executar
          response = { data: 'Simulação de DELETE (não executado)', error: null };
          break;
      }
      
      if (response.error) {
        throw response.error;
      }
      
      setResult(response.data);
    } catch (err: any) {
      console.error('Erro no teste de política:', err);
      setError(err.message || 'Erro desconhecido ao testar política');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-amber-500" />
          <span>Teste de Políticas de Segurança (RLS)</span>
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 pt-2">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm font-medium block mb-1.5">Tabela</label>
            <Select 
              value={selectedTable} 
              onValueChange={(value) => setSelectedTable(value)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma tabela" />
              </SelectTrigger>
              <SelectContent>
                {tables.map((table) => (
                  <SelectItem key={table} value={table}>
                    {table}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="text-sm font-medium block mb-1.5">Operaç��o</label>
            <Select 
              value={operation} 
              onValueChange={(value) => setOperation(value as any)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione uma operação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="SELECT">SELECT (Leitura)</SelectItem>
                <SelectItem value="INSERT">INSERT (Inserção)</SelectItem>
                <SelectItem value="UPDATE">UPDATE (Atualização)</SelectItem>
                <SelectItem value="DELETE">DELETE (Remoção)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {operation !== 'SELECT' && (
          <Alert variant="default" className="mt-2 bg-amber-50 text-amber-800 border-amber-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Por segurança, operações de escrita são apenas simuladas.
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={testAccess} 
          disabled={isLoading} 
          className="w-full flex items-center gap-2"
        >
          <Play className="h-4 w-4" />
          <span>Testar Acesso</span>
          {isLoading && <span className="ml-2 animate-spin">⏳</span>}
        </Button>
        
        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-medium">Erro:</span> {error}
            </AlertDescription>
          </Alert>
        )}
        
        {result && (
          <div className="mt-3">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className="bg-green-50 text-green-700">
                Sucesso
              </Badge>
              <span className="text-sm text-muted-foreground">
                {Array.isArray(result) ? `${result.length} registros encontrados` : 'Operação simulada'}
              </span>
            </div>
            <div className="bg-slate-50 p-3 rounded-md border overflow-auto max-h-48">
              <pre className="text-xs">{JSON.stringify(result, null, 2)}</pre>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="pt-2 border-t flex justify-between items-center text-xs text-muted-foreground">
        <span>As permissões testadas são baseadas no usuário atual</span>
      </CardFooter>
    </Card>
  );
};

export default SecurityPolicyTester;
