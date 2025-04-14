
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import { Card } from "@/components/ui/card";
import { QuizStructureTest } from "@/components/quiz/QuizStructureTest";
import { InstagramField } from "@/components/quiz/question-types/InstagramField";
import { UrlField } from "@/components/quiz/question-types/UrlField";
import { LimitedCheckbox } from "@/components/quiz/question-types/LimitedCheckbox";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const QuizTest = () => {
  const { isAdmin } = useAuth();
  const [instagram, setInstagram] = useState('');
  const [url, setUrl] = useState('');
  const [checkboxValues, setCheckboxValues] = useState<string[]>([]);
  const [testResults, setTestResults] = useState<any>(null);
  
  const runModuleTest = async () => {
    try {
      const { data, error } = await supabase
        .from('quiz_modules')
        .select('*')
        .order('order_number');
      
      if (error) throw error;
      
      setTestResults({
        success: true,
        message: 'Consulta de módulos com sucesso',
        data
      });
    } catch (error: any) {
      setTestResults({
        success: false,
        message: 'Erro ao consultar módulos',
        error: error.message
      });
    }
  };
  
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader isAdmin={isAdmin} />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Testes do Questionário MAR</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <QuizStructureTest />
          
          <Card className="p-4 space-y-4">
            <h3 className="text-lg font-bold">Teste de Componentes</h3>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-md font-medium mb-2">Campo Instagram</h4>
                <InstagramField
                  id="instagram-test"
                  value={instagram}
                  onChange={setInstagram}
                  hint="Digite seu nome de usuário do Instagram"
                  placeholder="exemplo.usuario"
                />
                <p className="mt-1 text-sm">Valor atual: {instagram || '(vazio)'}</p>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-2">Campo URL</h4>
                <UrlField
                  id="url-test"
                  value={url}
                  onChange={setUrl}
                  hint="Digite o endereço do site"
                  placeholder="www.exemplo.com.br"
                />
                <p className="mt-1 text-sm">Valor atual: {url || '(vazio)'}</p>
              </div>
              
              <div>
                <h4 className="text-md font-medium mb-2">Checkbox com Limite (máx: 3)</h4>
                <LimitedCheckbox
                  id="checkbox-test"
                  options={[
                    "Opção 1 - Lorem ipsum dolor sit amet",
                    "Opção 2 - Consectetur adipiscing elit",
                    "Opção 3 - Sed do eiusmod tempor incididunt",
                    "Opção 4 - Ut labore et dolore magna aliqua",
                    "Opção 5 - Ut enim ad minim veniam"
                  ]}
                  value={checkboxValues}
                  onChange={setCheckboxValues}
                  maxOptions={3}
                  hint="Selecione até 3 opções"
                />
                <p className="mt-1 text-sm">Valores selecionados: {checkboxValues.length > 0 ? checkboxValues.join(', ') : '(nenhum)'}</p>
              </div>
            </div>
          </Card>
          
          <Card className="p-4 space-y-4">
            <h3 className="text-lg font-bold">Teste de Consulta</h3>
            
            <Button onClick={runModuleTest}>Consultar Módulos</Button>
            
            {testResults && (
              <div className={`p-3 rounded-md ${testResults.success ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`font-medium ${testResults.success ? 'text-green-700' : 'text-red-700'}`}>
                  {testResults.message}
                </p>
                
                {testResults.success && testResults.data && (
                  <div className="mt-2 text-sm">
                    <p>Total de módulos: {testResults.data.length}</p>
                    <ul className="list-disc pl-5 mt-1">
                      {testResults.data.map((module: any) => (
                        <li key={module.id}>
                          {module.order_number}: {module.title}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {testResults.error && (
                  <p className="mt-2 text-sm text-red-700">
                    {testResults.error}
                  </p>
                )}
              </div>
            )}
          </Card>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
};

export default QuizTest;
