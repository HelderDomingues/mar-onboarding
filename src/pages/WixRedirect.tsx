
import React, { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

const WixRedirect = () => {
  const { isAuthenticated, user } = useAuth();
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    // URL da página Wix que contém o questionário
    const wixUrl = "https://www.crievalor.com.br/mapa-para-alto-rendimento";
    
    // Verificar se a página está acessível
    fetch(wixUrl, { method: 'HEAD', mode: 'no-cors' })
      .then(() => {
        console.log("Conexão com a página Wix estabelecida");
      })
      .catch((err) => {
        console.error("Erro ao tentar acessar a página Wix:", err);
        setError("Não foi possível conectar com a página do questionário. Por favor, tente abrir diretamente.");
      });
      
    // Atualizar o título da página
    document.title = "Mapa para Alto Rendimento | Crie Valor";
  }, []);
  
  // Redirecionamento se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  const handleOpenExternal = () => {
    window.open("https://www.crievalor.com.br/mapa-para-alto-rendimento", "_blank");
  };
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-2 text-slate-900">Mapa para Alto Rendimento</h1>
            <p className="text-slate-600">
              Este é o questionário oficial do MAR - Mapa para Alto Rendimento da Crie Valor.
            </p>
          </div>
          
          {error ? (
            <Card className="p-6 mb-6 border-orange-200 bg-orange-50">
              <div className="flex flex-col items-center text-center">
                <div className="text-amber-600 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="12" y1="8" x2="12" y2="12"></line>
                    <line x1="12" y1="16" x2="12.01" y2="16"></line>
                  </svg>
                </div>
                <h3 className="text-lg font-medium mb-2">Não foi possível carregar o questionário no modo integrado</h3>
                <p className="mb-4 text-slate-600">{error}</p>
                <Button onClick={handleOpenExternal} className="flex items-center gap-2">
                  <ExternalLink className="h-4 w-4" />
                  Abrir em Nova Janela
                </Button>
              </div>
            </Card>
          ) : (
            <>
              <Card className="p-4 mb-6 border-blue-200 bg-blue-50">
                <p className="text-blue-700 text-sm">
                  <strong>Nota:</strong> O questionário está sendo carregado de forma integrada. Se tiver problemas, você pode 
                  <Button variant="link" onClick={handleOpenExternal} className="px-1 py-0 h-auto text-blue-600 font-medium">
                    abrir em uma nova janela
                  </Button>.
                </p>
              </Card>
              
              <div className="border rounded-lg shadow-md overflow-hidden bg-white">
                <div className="w-full h-[800px]">
                  {!iframeLoaded && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                  <iframe 
                    src="https://www.crievalor.com.br/mapa-para-alto-rendimento"
                    className={`w-full h-full border-0 ${iframeLoaded ? 'block' : 'hidden'}`}
                    onLoad={() => setIframeLoaded(true)}
                    title="Questionário MAR"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  />
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <Button 
                  onClick={handleOpenExternal} 
                  variant="outline" 
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="h-4 w-4" />
                  Abrir em Nova Janela
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
};

export default WixRedirect;
