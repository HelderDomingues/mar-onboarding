import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Save, TestTube } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { testWebhookConnection } from '@/utils/webhookUtils';
import { useToast } from '@/hooks/use-toast';

interface SystemConfig {
  webhook_url: string;
}

export const SystemConfigManager: React.FC = () => {
  const [config, setConfig] = useState<SystemConfig>({ webhook_url: '' });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar configuração atual
  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { data, error } = await supabase.rpc('get_system_config', {
        p_config_key: 'webhook_url'
      });

      if (error) {
        setError('Erro ao carregar configuração: ' + error.message);
        return;
      }

      setConfig({
        webhook_url: data || ''
      });
    } catch (error) {
      setError('Erro ao carregar configuração: ' + String(error));
    } finally {
      setIsLoading(false);
    }
  };

  const saveConfig = async () => {
    try {
      setIsSaving(true);
      setError(null);

      const { error } = await supabase.rpc('update_system_config', {
        p_config_key: 'webhook_url',
        p_config_value: config.webhook_url
      });

      if (error) {
        setError('Erro ao salvar configuração: ' + error.message);
        return;
      }

      // Registrar ação na auditoria
      await supabase.rpc('log_admin_action', {
        p_action: 'UPDATE_WEBHOOK_CONFIG',
        p_target_table: 'system_config',
        p_new_values: { webhook_url: config.webhook_url }
      });

      toast({
        title: "Configuração salva",
        description: "URL do webhook atualizada com sucesso.",
      });
    } catch (error) {
      setError('Erro ao salvar configuração: ' + String(error));
    } finally {
      setIsSaving(false);
    }
  };

  const testWebhook = async () => {
    try {
      setIsTesting(true);
      setError(null);

      const result = await testWebhookConnection();

      if (result.success) {
        toast({
          title: "Teste bem-sucedido",
          description: result.message,
        });
      } else {
        toast({
          title: "Teste falhou",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro no teste",
        description: "Erro inesperado durante o teste: " + String(error),
        variant: "destructive",
      });
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando configurações...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
        <CardDescription>
          Gerencie as configurações globais do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="webhook_url">URL do Webhook</Label>
            <Input
              id="webhook_url"
              type="url"
              placeholder="https://exemplo.com/webhook"
              value={config.webhook_url}
              onChange={(e) => setConfig(prev => ({ ...prev, webhook_url: e.target.value }))}
            />
            <p className="text-sm text-muted-foreground">
              URL para onde os dados do questionário serão enviados quando completados
            </p>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={saveConfig}
              disabled={isSaving || !config.webhook_url.trim()}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Salvando...
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  Salvar Configuração
                </>
              )}
            </Button>
            
            <Button
              variant="outline"
              onClick={testWebhook}
              disabled={isTesting || !config.webhook_url.trim()}
            >
              {isTesting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Testando...
                </>
              ) : (
                <>
                  <TestTube className="mr-2 h-4 w-4" />
                  Testar Webhook
                </>
              )}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};