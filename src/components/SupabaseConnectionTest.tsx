
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Database } from 'lucide-react';
import { checkSupabaseConnection } from '@/integrations/supabase/client';
import { addLogEntry } from '@/utils/projectLog';

export default function SupabaseConnectionTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    connected: boolean;
    error?: string;
    data?: any;
  } | null>(null);

  const testConnection = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      addLogEntry('info', 'Testando conexão com Supabase');
      
      const connectionResult = await checkSupabaseConnection();
      setResult(connectionResult);
      
      addLogEntry(
        connectionResult.connected ? 'info' : 'error',
        `Teste de conexão: ${connectionResult.connected ? 'Sucesso' : 'Falha'}`,
        connectionResult.connected ? undefined : { error: connectionResult.error }
      );
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      setResult({
        connected: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      addLogEntry('error', 'Exceção ao testar conexão com Supabase', {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          Teste de Conexão com Supabase
        </CardTitle>
        <CardDescription>
          Verifique se a aplicação consegue se conectar ao seu projeto Supabase
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {result && (
          <>
            {result.connected ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Conexão bem-sucedida!</AlertTitle>
                <AlertDescription>
                  A aplicação está conectada corretamente ao Supabase.
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <XCircle className="h-4 w-4" />
                <AlertTitle>Falha na conexão</AlertTitle>
                <AlertDescription>
                  {result.error || 'Não foi possível conectar ao Supabase.'}
                </AlertDescription>
              </Alert>
            )}
            
            {result.connected && result.data && (
              <div className="mt-4 p-3 bg-gray-50 rounded-md border text-sm">
                <p className="font-medium mb-1">Resposta do servidor:</p>
                <pre className="text-xs bg-white p-2 rounded overflow-auto max-h-32">
                  {JSON.stringify(result.data, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
        
        {!result && (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <Database className="h-12 w-12 text-gray-300 mb-3" />
            <p className="text-muted-foreground">
              Clique no botão abaixo para testar a conexão com o Supabase
            </p>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <Button
          onClick={testConnection}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testando conexão...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Testar Conexão
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
