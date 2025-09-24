import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { testWebhookConnection } from '@/utils/webhookUtils';
import { toast } from 'sonner';
import { CheckCircle, AlertCircle, Globe } from 'lucide-react';

const WebhookConfig = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [testResult, setTestResult] = useState<{success: boolean, message: string} | null>(null);

  const handleTestConnection = async () => {
    setIsLoading(true);
    setTestResult(null);
    
    try {
      const result = await testWebhookConnection();
      
      setTestResult(result);
      
      if (result.success) {
        toast.success('Conexão com Make.com bem-sucedida!');
      } else {
        toast.error('Falha na conexão com Make.com');
      }
    } catch (error) {
      console.error('Erro ao testar webhook:', error);
      setTestResult({
        success: false,
        message: 'Erro inesperado ao testar a conexão.'
      });
      toast.error('Erro inesperado ao testar a conexão');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Webhook Make.com
        </CardTitle>
        <CardDescription>
          Sistema integrado com Make.com para automação. O webhook está pré-configurado e pronto para uso.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-slate-50 p-4 rounded-lg">
          <h4 className="font-medium mb-2">Status da Configuração</h4>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <CheckCircle className="h-4 w-4 text-green-500" />
            Webhook configurado com Make.com
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            URL: https://hook.eu2.make.com/*** (oculta por segurança)
          </div>
        </div>
        
        {testResult && (
          <Alert variant={testResult.success ? "default" : "destructive"}>
            <AlertDescription className="flex items-center gap-2">
              {testResult.success ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-500" />
              )}
              {testResult.message}
            </AlertDescription>
          </Alert>
        )}
        
        <Button 
          onClick={handleTestConnection}
          disabled={isLoading}
          className="w-full"
          variant="outline"
        >
          {isLoading ? 'Testando Conexão...' : 'Testar Conexão com Make.com'}
        </Button>
        
        <div className="text-xs text-muted-foreground mt-4">
          <p>ℹ️ O webhook é ativado automaticamente quando um questionário é completado.</p>
          <p>⚡ Você também pode reenviar dados manualmente através da lista de respostas.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default WebhookConfig;