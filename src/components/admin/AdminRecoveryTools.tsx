
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/components/ui/use-toast';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { forceQuizRecovery } from '@/scripts/force-quiz-recovery';
import { testSupabaseStructure } from '@/utils/testSupabaseStructure';

export function AdminRecoveryTools() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const handleForceRecovery = async () => {
    setIsLoading(true);
    try {
      const result = await forceQuizRecovery();
      
      setResult(result);
      
      toast({
        title: result.success ? "Recuperação concluída" : "Falha na recuperação",
        description: result.message,
        variant: result.success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Erro ao executar recuperação forçada:', error);
      setResult({
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao executar a recuperação",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTestStructure = async () => {
    setIsLoading(true);
    try {
      const testResult = await testSupabaseStructure();
      
      const success = testResult.results.connection && testResult.results.tables;
      const issueCount = testResult.issues.length;
      
      setResult({
        success,
        data: { modules: 0, questions: 0 }, // Placeholder data
        error: testResult.issues.join(', ') || null,
        message: success 
          ? `Estrutura verificada com sucesso. ${issueCount} problemas encontrados.` 
          : `Falha na verificação: ${testResult.issues.join(', ')}`
      });
      
      toast({
        title: success ? "Teste concluído" : "Falha no teste",
        description: success 
          ? `Estrutura verificada. ${issueCount} problemas encontrados.` 
          : `Falha: ${testResult.issues.join(', ')}`,
        variant: success ? "default" : "destructive",
      });
    } catch (error) {
      console.error('Erro ao testar estrutura:', error);
      setResult({
        success: false,
        message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao testar a estrutura",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Ferramentas de Recuperação</CardTitle>
        <CardDescription>
          Resolva problemas com o questionário e estrutura do sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button 
            onClick={handleTestStructure}
            disabled={isLoading}
            className="w-full"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>Verificar Estrutura do Sistema</>
            )}
          </Button>
          
          <Button 
            onClick={handleForceRecovery}
            disabled={isLoading}
            className="w-full"
            variant="destructive"
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Recuperando...
              </>
            ) : (
              <>Forçar Recuperação do Questionário</>
            )}
          </Button>
        </div>
        
        {result && (
          <Alert variant={result.success ? "default" : "destructive"}>
            {result.success ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <AlertTitle>{result.success ? "Sucesso" : "Erro"}</AlertTitle>
            <AlertDescription>
              {result.message}
              {result.success && result.data && (
                <div className="mt-2 text-xs">
                  <p>Módulos: {result.data.modules}</p>
                  <p>Perguntas: {result.data.questions}</p>
                  <p>Opções: {result.data.options}</p>
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

export default AdminRecoveryTools;
