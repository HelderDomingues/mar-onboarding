
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { testWebhookConnection } from '@/utils/webhookUtils';
import { Separator } from '@/components/ui/separator';

const WebhookTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean, message: string, details?: any} | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const { toast } = useToast();

  const handleTest = async () => {
    setIsLoading(true);
    setResult(null);
    setShowDetails(false);
    
    try {
      const testResult = await testWebhookConnection();
      setResult(testResult);
      
      toast({
        title: testResult.success ? 'Teste concluído com sucesso' : 'Falha no teste',
        description: testResult.message,
        variant: testResult.success ? 'default' : 'destructive',
      });
    } catch (error) {
      setResult({
        success: false,
        message: `Erro: ${error.message || 'Falha desconhecida'}`
      });
      
      toast({
        title: 'Erro ao testar webhook',
        description: error.message || 'Ocorreu um erro desconhecido durante o teste',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Teste de Conexão - Webhook</CardTitle>
        <CardDescription>
          Verifique se a conexão com o webhook do Make.com está funcionando corretamente
        </CardDescription>
      </CardHeader>
      <CardContent>
        {result && (
          <Alert variant={result.success ? 'default' : 'destructive'} className="mb-4">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <AlertTitle>{result.success ? 'Sucesso' : 'Falha'}</AlertTitle>
            </div>
            <AlertDescription className="mt-2">
              {result.message}
            </AlertDescription>
            
            {result.details && (
              <>
                <div className="mt-2 flex items-center">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setShowDetails(!showDetails)}
                    className="text-xs px-2 h-6"
                  >
                    {showDetails ? 'Ocultar detalhes' : 'Mostrar detalhes'}
                  </Button>
                </div>
                
                {showDetails && (
                  <div className="mt-2 text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded overflow-auto max-h-[200px]">
                    <pre>{JSON.stringify(result.details, null, 2)}</pre>
                  </div>
                )}
              </>
            )}
          </Alert>
        )}
        
        <p className="text-sm text-gray-500 mb-4">
          Este teste verifica se o webhook configurado no sistema está respondendo corretamente.
          Nenhum dado será enviado para o Make.com durante este teste.
        </p>
        
        <Separator className="my-4" />
        
        <div className="rounded-md bg-blue-50 p-4 mb-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <Info className="h-5 w-5 text-blue-400" aria-hidden="true" />
            </div>
            <div className="ml-3 flex-1">
              <h3 className="text-sm font-medium text-blue-800">Importante</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>
                  Se o teste falhar, verifique:
                </p>
                <ul className="list-disc pl-5 mt-1 space-y-1">
                  <li>Se o webhook está ativo no Make.com</li>
                  <li>Se o token do webhook está correto</li>
                  <li>Se o servidor Supabase está online</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={handleTest} 
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Testando...
            </>
          ) : (
            'Testar Conexão com Webhook'
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default WebhookTester;
