
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Database } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { addLogEntry } from '@/utils/projectLog';
import { useToast } from '@/components/ui/use-toast';

export default function SupabaseConnectionTest() {
  const { toast } = useToast();
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
      
      // Verificar conexão com Supabase
      const { data, error } = await supabase
        .from('quiz_modules')
        .select('count', { count: 'exact', head: true });
        
      if (error) {
        setResult({
          connected: false,
          error: `Erro de conexão: ${error.message}`
        });
        
        toast({
          title: "Falha na conexão",
          description: error.message,
          variant: "destructive"
        });
        
        addLogEntry('error', 'Falha ao testar conexão com Supabase', { error: error.message });
        return;
      }
      
      // Verificar contagem de dados
      const { count: modulesCount } = await supabase
        .from('quiz_modules')
        .select('*', { count: 'exact', head: true });
        
      const { count: questionsCount } = await supabase
        .from('quiz_questions')
        .select('*', { count: 'exact', head: true });
        
      const { count: optionsCount } = await supabase
        .from('quiz_options')
        .select('*', { count: 'exact', head: true });
      
      setResult({
        connected: true,
        message: "Conexão bem-sucedida!",
        data: {
          modules: modulesCount || 0,
          questions: questionsCount || 0, 
          options: optionsCount || 0
        }
      });
      
      toast({
        title: "Conexão verificada",
        description: "Conexão com o banco de dados está funcionando corretamente.",
      });
      
      addLogEntry('info', 'Teste de conexão com Supabase: Sucesso', {
        modules: modulesCount || 0,
        questions: questionsCount || 0, 
        options: optionsCount || 0
      });
    } catch (error) {
      console.error('Erro ao testar conexão:', error);
      
      setResult({
        connected: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      
      toast({
        title: "Erro ao verificar conexão",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      
      addLogEntry('error', 'Exceção ao testar conexão com Supabase', {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInitializeQuiz = async () => {
    try {
      setLoading(true);
      
      toast({
        title: "Inicializando questionário",
        description: "Aguarde enquanto configuramos os dados básicos...",
      });
      
      addLogEntry('info', 'Inicializando questionário pelo componente de teste');
      
      // Limpar dados existentes primeiro
      await limparDadosQuiz();
      
      // Executar seed com dados limpos
      const { seedQuizData } = await import('@/scripts/seed-quiz');
      const success = await seedQuizData();
      
      if (success) {
        toast({
          title: "Sucesso",
          description: "Questionário inicializado com sucesso!",
        });
        
        // Atualizar o resultado do teste
        testConnection();
      } else {
        toast({
          title: "Falha",
          description: "Não foi possível inicializar o questionário.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao inicializar questionário:', error);
      
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive"
      });
      
      addLogEntry('error', 'Erro ao inicializar questionário', {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Função para limpar dados do questionário
  const limparDadosQuiz = async () => {
    try {
      addLogEntry('info', 'Limpando dados existentes do questionário');
      
      // Limpar opções
      await supabase
        .from('quiz_options')
        .delete()
        .gt('id', '00000000-0000-0000-0000-000000000000');
      
      // Limpar perguntas
      await supabase
        .from('quiz_questions')
        .delete()
        .gt('id', '00000000-0000-0000-0000-000000000000');
      
      // Limpar módulos
      await supabase
        .from('quiz_modules')
        .delete()
        .gt('id', '00000000-0000-0000-0000-000000000000');
      
      addLogEntry('info', 'Dados do questionário limpos com sucesso');
      return true;
    } catch (error) {
      addLogEntry('error', 'Erro ao limpar dados do questionário', {
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      });
      return false;
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
                <p className="font-medium mb-1">Estado do questionário:</p>
                <ul className="space-y-1 pl-2">
                  <li>Módulos: {result.data.modules || 0}</li>
                  <li>Questões: {result.data.questions || 0}</li>
                  <li>Opções: {result.data.options || 0}</li>
                </ul>
                
                {(result.data.modules === 0 || 
                  result.data.questions === 0 || 
                  result.data.options === 0) && (
                  <div className="mt-3 p-3 bg-amber-50 rounded-md text-amber-800 text-sm">
                    <p className="font-medium">Dados insuficientes</p>
                    <p className="mt-1">O questionário não possui dados ou está incompleto. Clique em "Inicializar Questionário" abaixo para configurar o básico.</p>
                  </div>
                )}
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
      
      <CardFooter className="flex flex-col gap-2">
        <Button
          onClick={testConnection}
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando conexão...
            </>
          ) : (
            <>
              <Database className="mr-2 h-4 w-4" />
              Testar Conexão
            </>
          )}
        </Button>
        
        {result && result.connected && (result.data?.modules === 0 || result.data?.questions === 0) && (
          <Button
            onClick={handleInitializeQuiz}
            disabled={loading}
            variant="secondary"
            className="w-full mt-2"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Inicializando...
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-4 w-4" />
                Inicializar Questionário
              </>
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
