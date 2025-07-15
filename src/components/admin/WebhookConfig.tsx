
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle, Loader2, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sendQuizDataToWebhook } from '@/utils/webhookUtils';
import { useToast } from '@/components/ui/use-toast';

export function WebhookConfig() {
  const { toast } = useToast();
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!webhookUrl) {
      toast({
        title: "URL não fornecida",
        description: "Por favor, insira a URL do webhook do Make.com",
        variant: "destructive"
      });
      return;
    }
    
    setIsLoading(true);
    setTestResult(null);
    
    try {
      // Test webhook by attempting to send test data
      const testSuccess = await sendQuizDataToWebhook('test-user', 'test-submission');
      
      const result = {
        success: testSuccess,
        message: testSuccess ? 'Webhook conectado com sucesso' : 'Falha ao conectar com webhook'
      };
      
      setTestResult(result);
      
      if (testSuccess) {
        toast({
          title: "Webhook configurado",
          description: "URL do webhook configurada com sucesso",
          variant: "default"
        });
      } else {
        toast({
          title: "Falha na conexão",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : 'Erro desconhecido ao configurar webhook',
        variant: "destructive"
      });
      
      setTestResult({
        success: false,
        message: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Configuração do Webhook (Make.com)</CardTitle>
        <CardDescription>
          Configure a URL do webhook para envio dos dados do questionário para o Make.com
        </CardDescription>
      </CardHeader>
      
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="webhook-url">URL do Webhook</Label>
              <Input
                id="webhook-url"
                placeholder="https://hook.eu1.make.com/seu-token-aqui"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                disabled={isLoading}
                required
              />
              <p className="text-sm text-muted-foreground">
                Insira a URL completa do webhook fornecida pelo Make.com
              </p>
            </div>
            
            {testResult && (
              <Alert variant={testResult.success ? "default" : "destructive"} className="mt-4">
                {testResult.success ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <AlertCircle className="h-4 w-4" />
                )}
                <AlertTitle>
                  {testResult.success ? "Conexão estabelecida" : "Falha na conexão"}
                </AlertTitle>
                <AlertDescription>
                  {testResult.message}
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
        
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button" disabled={isLoading}>
            Cancelar
          </Button>
          
          <Button type="submit" disabled={isLoading || !webhookUrl}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Testando...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Testar e Salvar
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
