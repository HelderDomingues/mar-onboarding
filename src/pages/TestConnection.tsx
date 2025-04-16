
import React from 'react';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TestConnectionPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teste de Conexão</h1>
          <p className="mt-2 text-lg text-gray-600">
            Verifique se a conexão com o Supabase está funcionando corretamente e inicialize o questionário se necessário.
          </p>
        </div>
        
        <div className="max-w-xl mx-auto">
          <SupabaseConnectionTest />
        </div>
        
        <div className="mt-8 bg-blue-50 p-6 rounded-lg max-w-xl mx-auto">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">Informações de recuperação</h2>
          <p className="text-blue-800 mb-4">
            Em caso de problemas com o questionário, você pode usar a API de recuperação para reinicializar os dados.
          </p>
          <div className="bg-white p-4 rounded border">
            <p className="font-mono text-sm mb-2">URL de recuperação:</p>
            <code className="bg-gray-100 text-sm p-2 rounded block overflow-auto">
              /api/recover-quiz?key=recover-quiz-mar
            </code>
          </div>
          <p className="text-sm text-blue-700 mt-3">
            Nota: Esta URL força uma reinicialização completa dos dados do questionário, limpando tudo e inserindo novamente.
          </p>
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
};

export default TestConnectionPage;
