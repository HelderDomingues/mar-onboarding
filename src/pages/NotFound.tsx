
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { addLogEntry } from "@/utils/projectLog";
import { Home, ArrowLeft } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    document.title = "Página não encontrada | MAR - Crie Valor";
    
    addLogEntry('navigation', 'Acesso a página inexistente', {
      rota: location.pathname,
      timestamp: new Date().toISOString()
    });
    
    console.error(
      "404 Error: Tentativa de acesso a rota inexistente:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white p-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl font-bold text-primary mb-4">404</h1>
        <p className="text-xl text-gray-700 mb-6">Oops! Página não encontrada</p>
        <p className="text-gray-600 mb-8">
          A página que você está procurando não existe ou pode ter sido movida.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild variant="default" className="flex items-center gap-2">
            <Link to="/">
              <Home className="h-4 w-4" />
              <span>Página Inicial</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="flex items-center gap-2">
            <Link to="/dashboard">
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar ao Dashboard</span>
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
