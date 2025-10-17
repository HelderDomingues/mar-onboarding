import { useAuth } from "@/hooks/useAuth";
import { Navigate, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Login } from "@/components/auth/Login";
import { useEffect } from "react";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";
import marLogo from "@/assets/mar-logo-new.png";
const Index = () => {
  const {
    isAuthenticated,
    user,
    isLoading
  } = useAuth();
  const navigate = useNavigate();

  // Registrar carregamento inicial da página
  useEffect(() => {
    addLogEntry('info', 'Página inicial carregada', {
      isAuthenticated: isAuthenticated,
      isLoading: isLoading
    });
  }, [isAuthenticated, isLoading]);

  // Efeito para redirecionar o usuário após autenticação
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      logger.info('Usuário autenticado, redirecionando para dashboard', {
        tag: 'Navigation'
      });
      addLogEntry('auth', 'Usuário autenticado, redirecionando para dashboard', {}, user?.id);

      // Redirecionamento direto para o dashboard
      navigate('/dashboard', {
        replace: true
      });
    }
  }, [isAuthenticated, isLoading, navigate, user]);

  // Se já estiver autenticado, redirecionar para o dashboard
  if (isAuthenticated && !isLoading) {
    addLogEntry('auth', 'Redirecionamento direto para dashboard (já autenticado)', {}, user?.id);
    return <Navigate to="/dashboard" replace />;
  }
  return <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <img src="/lovable-uploads/e109ec41-0f89-456d-8081-f73393ed4fd5.png" alt="Crie Valor" className="h-7 object-scale-down" />
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-10 md:gap-20">
        <div className="max-w-md space-y-4 animate-slide-in">
          <img alt="MAR - Mapa para Alto Rendimento" src={marLogo} className="h-20 mb-10" />
          <h1 className="text-4xl font-bold text-blue-900">Área Exclusiva de Membros</h1>
          <p className="text-lg text-gray-600">Acesse e comece sua jornada exclusivamente desenvolvida para nossos membros.</p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button onClick={() => window.open("https://crievalor.com.br/mar", "_blank")} className="bg-quiz hover:bg-quiz-dark text-slate-50">
              Saiba Mais
            </Button>
            <Button variant="outline" className="border-quiz text-quiz hover:bg-quiz/10" onClick={() => window.open("https://crievalor.com.br/contato", "_blank")}>
              Entre em Contato
            </Button>
          </div>
        </div>
        
        <div className="w-full max-w-md">
          <Login />
        </div>
      </div>
      
      <footer className="bg-white py-6 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Crie Valor Consultoria. Todos os direitos reservados.</p>
      </footer>
    </div>;
};
export default Index;