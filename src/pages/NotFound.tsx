
import { useLocation, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle, ArrowLeft, Home, ExternalLink } from "lucide-react";

const NotFound = () => {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    console.error(
      "404 Error: Usuário tentou acessar rota inexistente:",
      location.pathname
    );
    
    // Definir o título da página
    document.title = "Página não encontrada | Crie Valor";
  }, [location.pathname]);

  const handleOpenWixQuestionnaire = () => {
    window.open("https://www.crievalor.com.br/mapa-para-alto-rendimento", "_blank");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-6">
          <AlertTriangle className="h-10 w-10 text-red-600" />
        </div>
        
        <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
        <p className="text-xl text-gray-600 mb-6">Oops! Página não encontrada</p>
        
        <p className="text-gray-500 mb-8">
          A página que você está tentando acessar não existe ou foi movida.
        </p>
        
        <div className="flex flex-col gap-3">
          <Button 
            variant="outline" 
            className="gap-2"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          
          <Button 
            className="gap-2"
            onClick={() => navigate("/wix-redirect")}
          >
            <Home className="h-4 w-4" />
            Ir para o Questionário MAR
          </Button>
          
          <Button 
            variant="outline"
            className="gap-2 border-blue-200 text-blue-700 hover:bg-blue-50 mt-2"
            onClick={handleOpenWixQuestionnaire}
          >
            <ExternalLink className="h-4 w-4" />
            Abrir Questionário Original
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
