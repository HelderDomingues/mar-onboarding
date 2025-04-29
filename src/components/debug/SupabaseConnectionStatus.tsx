
import React, { useEffect, useState } from 'react';
import { verificarConexaoSupabase, obterInfoAmbiente } from '@/utils/debugUtils';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

export default function SupabaseConnectionStatus() {
  const [status, setStatus] = useState<{
    verificado: boolean;
    conectado: boolean;
    erro?: string;
    url?: string;
  }>({
    verificado: false,
    conectado: false
  });
  
  const [ambiente, setAmbiente] = useState(obterInfoAmbiente());
  
  useEffect(() => {
    verificarConexao();
  }, []);
  
  async function verificarConexao() {
    try {
      const resultado = await verificarConexaoSupabase();
      setStatus({
        verificado: true,
        conectado: resultado.conectado,
        erro: resultado.erro,
        url: resultado.url
      });
    } catch (error: any) {
      setStatus({
        verificado: true,
        conectado: false,
        erro: error?.message || 'Erro desconhecido'
      });
    }
  }
  
  function atualizarInfoAmbiente() {
    setAmbiente(obterInfoAmbiente());
  }
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Status da Conexão Supabase
          {status.verificado && (
            status.conectado ? (
              <span className="text-sm font-normal text-green-500 flex items-center">
                <CheckCircle className="h-4 w-4 mr-1" /> Conectado
              </span>
            ) : (
              <span className="text-sm font-normal text-red-500 flex items-center">
                <AlertCircle className="h-4 w-4 mr-1" /> Desconectado
              </span>
            )
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {status.verificado ? (
          <>
            {status.conectado ? (
              <Alert className="bg-green-50 border-green-200">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertTitle>Conexão estabelecida</AlertTitle>
                <AlertDescription>
                  Você está conectado ao projeto Supabase: <code className="font-mono text-xs bg-green-100 px-1 py-0.5 rounded">{status.url}</code>
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Falha na conexão</AlertTitle>
                <AlertDescription>
                  {status.erro || 'Não foi possível estabelecer conexão com o Supabase.'}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="mt-4">
              <h3 className="text-sm font-medium mb-2">Informações do Ambiente</h3>
              <div className="bg-gray-50 rounded border p-3 text-sm">
                <div className="grid grid-cols-2 gap-1">
                  <span className="font-semibold">Modo:</span>
                  <span>{ambiente.mode}</span>
                  
                  <span className="font-semibold">Ambiente:</span>
                  <span>{ambiente.produção ? 'Produção' : 'Desenvolvimento'}</span>
                  
                  <span className="font-semibold">URL Supabase:</span>
                  <span className="font-mono text-xs overflow-hidden overflow-ellipsis">
                    {ambiente.supabaseUrl}
                  </span>
                  
                  <span className="font-semibold">Chave Anônima:</span>
                  <span>{ambiente.temAnonKey ? 'Configurada' : 'Não configurada'}</span>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex justify-center py-8">
            <RefreshCw className="h-8 w-8 animate-spin text-gray-400" />
          </div>
        )}
      </CardContent>
      
      <Separator />
      
      <CardFooter className="pt-4">
        <div className="flex justify-between w-full">
          <Button 
            onClick={() => verificarConexao()}
            variant="outline"
            size="sm"
            className="flex items-center gap-1"
          >
            <RefreshCw className="h-3.5 w-3.5 mr-1" />
            Testar Conexão
          </Button>
          
          <Button 
            onClick={() => atualizarInfoAmbiente()}
            variant="ghost"
            size="sm"
          >
            Atualizar Informações
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
