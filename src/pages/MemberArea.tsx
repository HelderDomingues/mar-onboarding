
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/utils/logger";

const MemberArea = () => {
  const { user, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.title = "Área do Membro | MAR - Crie Valor";
    
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    setIsLoading(false);
    
    // Registrar acesso à área do membro
    if (user) {
      logger.info('Acesso à área do membro', {
        tag: 'MemberArea',
        userId: user.id
      });
    }
  }, [isAuthenticated, navigate, user]);

  if (isLoading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-slate-800 mb-6">Área do Membro</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Bem-vindo à sua área exclusiva</h2>
              <p className="text-slate-600 mb-4">
                Este é seu espaço para acesso a conteúdos e recursos exclusivos do método MAR.
              </p>
              <Button 
                className="w-full" 
                onClick={() => navigate('/materials')}
              >
                Acessar Materiais
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Diagnóstico MAR</h2>
              <p className="text-slate-600 mb-4">
                Acesse os resultados do seu diagnóstico e compreenda melhor a situação atual da sua empresa.
              </p>
              <Button 
                className="w-full" 
                onClick={() => navigate('/quiz/diagnostic')}
              >
                Ver Diagnóstico
              </Button>
            </CardContent>
          </Card>
          
          <Card className="shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <h2 className="text-xl font-semibold text-slate-800 mb-3">Precisa de Ajuda?</h2>
              <p className="text-slate-600 mb-4">
                Veja as perguntas frequentes ou entre em contato com nossa equipe.
              </p>
              <Button 
                className="w-full" 
                onClick={() => navigate('/faq')}
              >
                Acessar FAQ
              </Button>
            </CardContent>
          </Card>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
};

export default MemberArea;
