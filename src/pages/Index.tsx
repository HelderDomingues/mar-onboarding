import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Login } from "@/components/auth/Login";
const Index = () => {
  const {
    isAuthenticated
  } = useAuth();
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }
  return <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <img src="/lovable-uploads/e109ec41-0f89-456d-8081-f73393ed4fd5.png" alt="Crie Valor" className="h-5" />
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-10 md:gap-20">
        <div className="max-w-md space-y-4 animate-slide-in">
          
          <h1 className="text-4xl font-bold text-blue-900">Área Exclusiva de Membros</h1>
          <p className="text-lg text-gray-600">
            Acesse avaliações e questionários exclusivos desenvolvidos para nossos membros.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button className="bg-quiz hover:bg-quiz-dark" onClick={() => window.open("https://crievalor.com.br/mar", "_blank")}>
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