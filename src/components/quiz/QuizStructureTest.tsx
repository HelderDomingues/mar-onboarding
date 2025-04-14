
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { testSupabaseStructure } from '@/utils/testSupabaseStructure';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';

export function QuizStructureTest() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  
  const runTest = async () => {
    setLoading(true);
    try {
      const testResult = await testSupabaseStructure();
      setResult(testResult);
    } catch (error) {
      setResult({
        success: false,
        error: 'Erro ao executar teste',
        details: error
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card className="p-4 space-y-4">
      <h3 className="text-lg font-bold">Teste de Estrutura do Questionário MAR</h3>
      
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Este teste verifica se a estrutura do banco de dados do questionário MAR foi implementada corretamente,
          incluindo módulos, perguntas e opções.
        </p>
        
        <Button 
          onClick={runTest} 
          disabled={loading}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Verificando...
            </>
          ) : 'Verificar Estrutura do Questionário'}
        </Button>
      </div>
      
      {result && (
        <div className={`p-3 rounded-md ${result.success ? 'bg-green-50' : 'bg-red-50'}`}>
          <div className="flex items-start">
            {result.success ? (
              <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 mr-2" />
            ) : (
              <XCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2" />
            )}
            
            <div className="flex-1">
              <p className={`font-medium ${result.success ? 'text-green-700' : 'text-red-700'}`}>
                {result.success ? 'Estrutura verificada com sucesso!' : 'Erro na verificação da estrutura'}
              </p>
              
              {result.success ? (
                <div className="mt-2 text-sm space-y-1">
                  <p>Módulos: {result.data.modules}</p>
                  <p>Perguntas: {result.data.questions}</p>
                  <p>Opções: {result.data.options}</p>
                  <p>Tipos de pergunta: {result.data.questionTypes.join(', ')}</p>
                </div>
              ) : (
                <div className="mt-2 text-sm space-y-1">
                  <p>Etapa: {result.stage}</p>
                  <p>Erro: {result.error}</p>
                  {result.details && (
                    <pre className="text-xs bg-red-100 p-2 rounded overflow-auto">
                      {JSON.stringify(result.details, null, 2)}
                    </pre>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
