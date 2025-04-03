
import { useEffect, useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { QuizSubmission } from "@/types/quiz";
import { Button } from "@/components/ui/button";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { UserDashboard } from "@/components/user/UserDashboard";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [isAdmin, setIsAdmin] = useState(false);
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  
  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        // Verificar se o usuário é admin
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
          
        if (!error && data) {
          setIsAdmin(true);
          logger.info("Usuário é administrador");
        }
        
        // Buscar submissão atual
        const { data: submissionData, error: submissionError } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (!submissionError && submissionData) {
          setSubmission(submissionData as unknown as QuizSubmission);
        } else if (submissionError && submissionError.code !== 'PGRST116') { // Não é erro de 'not found'
          console.error("Erro ao buscar submissão", submissionError);
        }
      } catch (error) {
        logger.error('Erro ao verificar papel do usuário', { tag: 'Dashboard', data: error });
        setLoadError("Erro ao verificar as permissões do usuário.");
      } finally {
        setIsLoading(false);
      }
    };
    
    if (user) {
      checkUserRole();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <QuizHeader isAdmin={isAdmin} />
        <main className="flex-1 container py-8 px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <SidebarProvider defaultOpen={true}>
        <div className="flex min-h-screen font-sans">
          <AdminSidebar />
          <SidebarInset className="p-6 bg-gray-100">
            <div className="container max-w-7xl mx-auto">
              <AdminDashboard 
                submission={submission}
                isAdmin={isAdmin}
              />
              
              {/* Área de testes e desenvolvimento */}
              <div className="mt-8 border-t pt-6">
                <h2 className="text-xl font-bold mb-4">Acesso direto para testes</h2>
                <div className="flex flex-wrap gap-4">
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/quiz/review'}
                  >
                    Página de Revisão
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/quiz/success'}
                  >
                    Página de Sucesso
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={() => window.location.href = '/member'}
                  >
                    Área do Membro
                  </Button>
                </div>
              </div>
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <QuizHeader isAdmin={isAdmin} />
      
      <main className="flex-1 container max-w-5xl py-8 px-4">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Dashboard Principal</h1>
          <Link to="/member">
            <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
              Acessar Área do Membro
            </Button>
          </Link>
        </div>
        
        <UserDashboard submission={submission} />
        
        {/* Área de testes */}
        <div className="mt-8 border-t pt-6">
          <h2 className="text-xl font-bold mb-4">Acesso direto para testes</h2>
          <div className="flex flex-wrap gap-4">
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/quiz/review'}
            >
              Página de Revisão
            </Button>
            
            <Button 
              variant="outline"
              onClick={() => window.location.href = '/quiz/success'}
            >
              Página de Sucesso
            </Button>
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-4 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Crie Valor. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
