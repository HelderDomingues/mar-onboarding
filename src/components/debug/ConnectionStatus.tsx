import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, RefreshCw } from 'lucide-react';

/**
 * Componente de diagnóstico para verificar o status da conexão com o Supabase
 * e as permissões de acesso do usuário atual.
 */
const ConnectionStatus: React.FC = () => {
  const [status, setStatus] = useState<'checking' | 'success' | 'error'>('checking');
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionStatus, setSessionStatus] = useState<'authenticated' | 'anonymous' | 'error'>('anonymous');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const checkConnection = async () => {
    setStatus('checking');
    setErrorMessage(null);
    
    try {
      // Verificar conexão básica
      const { data: testData, error: testError } = await supabase
        .from('profiles')
        .select('count(*)')
        .limit(1);
        
      if (testError) throw testError;
      
      // Verificar sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) throw sessionError;
      
      if (session) {
        setSessionStatus('authenticated');
        setUserId(session.user.id);
        
        // Verificar se é admin
        const { data: adminData, error: adminError } = await supabase.rpc('is_admin');
        
        if (adminError) {
          console.warn('Erro ao verificar admin status:', adminError);
          setIsAdmin(null);
        } else {
          setIsAdmin(adminData === true);
        }
      } else {
        setSessionStatus('anonymous');
        setUserId(null);
        setIsAdmin(null);
      }
      
      setStatus('success');
      setLastCheck(new Date());
    } catch (error: any) {
      console.error('Erro no teste de conexão:', error);
      setStatus('error');
      setErrorMessage(error.message || 'Erro desconhecido na conexão');
      setLastCheck(new Date());
    }
  };
  
  useEffect(() => {
    checkConnection();
  }, []);
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center justify-between">
          <span>Status da Conexão</span>
          {status === 'checking' ? (
            <Badge variant="outline" className="bg-amber-50 text-amber-700">
              Verificando...
            </Badge>
          ) : status === 'success' ? (
            <Badge variant="outline" className="bg-green-50 text-green-700">
              Conectado
            </Badge>
          ) : (
            <Badge variant="outline" className="bg-red-50 text-red-700">
              Erro
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-3 pt-0">
        <div className="text-sm grid grid-cols-2 gap-2">
          <div className="font-medium">URL do Supabase:</div>
          <div className="truncate">
            {'https://btzvozqajqknqfoymxpg.supabase.co'}
          </div>
          
          <div className="font-medium">Status da Sessão:</div>
          <div>
            {sessionStatus === 'authenticated' ? (
              <span className="flex items-center gap-1 text-green-600">
                <CheckCircle className="h-3.5 w-3.5" /> Autenticado
              </span>
            ) : sessionStatus === 'anonymous' ? (
              <span className="text-amber-600">Anônimo</span>
            ) : (
              <span className="text-red-600">Erro</span>
            )}
          </div>
          
          {userId && (
            <>
              <div className="font-medium">ID do Usuário:</div>
              <div className="truncate text-xs font-mono">{userId}</div>
            </>
          )}
          
          {isAdmin !== null && (
            <>
              <div className="font-medium">Admin:</div>
              <div>
                {isAdmin ? (
                  <span className="text-green-600">Sim</span>
                ) : (
                  <span className="text-slate-600">Não</span>
                )}
              </div>
            </>
          )}
        </div>
        
        {errorMessage && (
          <Alert variant="destructive" className="mt-2">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>
      
      <CardFooter className="border-t pt-3">
        <div className="w-full flex items-center justify-between">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={checkConnection} 
            disabled={status === 'checking'}
            className="flex items-center gap-1"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${status === 'checking' ? 'animate-spin' : ''}`} />
            <span>Verificar Novamente</span>
          </Button>
          
          {lastCheck && (
            <span className="text-xs text-muted-foreground">
              Última verificação: {lastCheck.toLocaleTimeString('pt-BR')}
            </span>
          )}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ConnectionStatus;
