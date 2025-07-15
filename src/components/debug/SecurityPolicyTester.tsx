import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface TestResult {
  name: string;
  status: 'success' | 'error' | 'warning';
  message: string;
}

export function SecurityPolicyTester() {
  const [testing, setTesting] = useState(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runTests = async () => {
    setTesting(true);
    const testResults: TestResult[] = [];

    // Test 1: Basic connection
    try {
      const { error } = await supabase.from('profiles').select('id').limit(1);
      if (error) {
        testResults.push({
          name: 'Conexão Básica',
          status: 'error',
          message: `Erro de conexão: ${error.message}`
        });
      } else {
        testResults.push({
          name: 'Conexão Básica',
          status: 'success',
          message: 'Conexão estabelecida com sucesso'
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Conexão Básica',
        status: 'error',
        message: 'Falha na conexão'
      });
    }

    // Test 2: RLS Status
    try {
      const { error } = await supabase.from('user_roles').select('*').limit(1);
      if (error && error.message.includes('RLS')) {
        testResults.push({
          name: 'RLS Habilitado',
          status: 'success',
          message: 'Row Level Security está ativo'
        });
      } else if (error) {
        testResults.push({
          name: 'RLS Habilitado',
          status: 'warning',
          message: 'RLS pode não estar configurado corretamente'
        });
      } else {
        testResults.push({
          name: 'RLS Habilitado',
          status: 'warning',
          message: 'RLS pode estar desabilitado'
        });
      }
    } catch (error) {
      testResults.push({
        name: 'RLS Habilitado',
        status: 'error',
        message: 'Erro ao testar RLS'
      });
    }

    // Test 3: Admin function
    try {
      const { error } = await supabase.rpc('is_admin');
      if (!error) {
        testResults.push({
          name: 'Função Admin',
          status: 'success',
          message: 'Função is_admin está funcionando'
        });
      } else {
        testResults.push({
          name: 'Função Admin',
          status: 'error',
          message: `Erro na função admin: ${error.message}`
        });
      }
    } catch (error) {
      testResults.push({
        name: 'Função Admin',
        status: 'error',
        message: 'Função admin não disponível'
      });
    }

    setResults(testResults);
    setTesting(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: TestResult['status']) => {
    const variants = {
      success: 'default',
      error: 'destructive',
      warning: 'secondary'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Teste de Políticas de Segurança</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <AlertDescription>
            Execute este teste para verificar se as políticas de segurança estão funcionando corretamente.
          </AlertDescription>
        </Alert>
        
        <Button 
          onClick={runTests} 
          disabled={testing}
          className="w-full"
        >
          {testing ? 'Executando Testes...' : 'Executar Testes de Segurança'}
        </Button>

        {results.length > 0 && (
          <div className="space-y-3">
            <h3 className="font-semibold">Resultados dos Testes:</h3>
            {results.map((result, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <div className="font-medium">{result.name}</div>
                    <div className="text-sm text-muted-foreground">{result.message}</div>
                  </div>
                </div>
                {getStatusBadge(result.status)}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}