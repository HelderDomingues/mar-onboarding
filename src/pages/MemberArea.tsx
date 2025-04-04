
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

const MemberArea = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    if (isAuthenticated) {
      setLoading(false);
    }
  }, [isAuthenticated]);
  
  if (!isAuthenticated && !loading) {
    return <Navigate to="/" />;
  }
  
  const handleBack = () => {
    navigate("/dashboard");
  };
  
  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-primary text-white shadow-md py-4 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img 
              alt="MAR - Mapa para Alto Rendimento" 
              className="h-8" 
              src="https://static.wixstatic.com/media/783feb_0e0fffdb3f3e4eafa422021dcea535d4~mv2.png" 
            />
          </div>
          
          <Button 
            variant="outline" 
            className="border-white text-white hover:bg-white/20"
            onClick={handleBack}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar ao Dashboard
          </Button>
        </div>
      </header>
      
      <main className="container mx-auto py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Área do Membro</h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados Pessoais</CardTitle>
                <CardDescription>Suas informações pessoais</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div>
                    <span className="font-semibold">Email:</span> {user?.email}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Progresso</CardTitle>
                <CardDescription>Acompanhe seu desenvolvimento</CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  variant="default"
                  onClick={() => navigate("/quiz")}
                  className="w-full"
                >
                  Ir para Questionário MAR
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="mt-8">
            <Card>
              <CardHeader>
                <CardTitle>Materiais Complementares</CardTitle>
                <CardDescription>Recursos exclusivos para membros</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Nesta área você terá acesso a materiais exclusivos desenvolvidos pela Crie Valor para auxiliar na implementação das estratégias recomendadas.
                </p>
                
                <div className="flex justify-center">
                  <p className="text-center text-muted-foreground italic">
                    Em breve novos materiais serão disponibilizados.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      
      <footer className="py-4 border-t border-gray-200 mt-8">
        <div className="container mx-auto text-center text-sm text-gray-600">
          <p>© {new Date().getFullYear()} Crie Valor. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default MemberArea;
