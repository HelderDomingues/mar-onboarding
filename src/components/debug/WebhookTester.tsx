
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { testarConexaoWebhook } from '@/utils/webhookService';

const WebhookTester = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<{success: boolean, message: string} | null>(null);
  const { toast } = useToast();

  const handleTest = async () => {
    setIsLoading(true);
    setResult(null);
    
    try {
      const testResult = await testarConexaoWebhook();
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
          </Alert>
        )}
        
        <p className="text-sm text-gray-500 mb-4">
          Este teste verifica se o webhook configurado no sistema está respondendo corretamente.
          Nenhum dado será enviado para o Make.com durante este teste.
        </p>
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
