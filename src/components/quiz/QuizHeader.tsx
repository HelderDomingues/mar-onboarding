
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";
import { Home } from "lucide-react";

interface QuizHeaderProps {
  isAdmin?: boolean;
}

export function QuizHeader({ isAdmin = false }: QuizHeaderProps) {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    logger.info('Usuário solicitou logout', {
      tag: 'Header'
    });
    await logout();
    navigate("/");
  };
  
  const handleNavigateToDashboard = () => {
    navigate("/dashboard");
  };
  
  return (
    <header className={`${isAdmin ? 'bg-slate-800 text-white' : 'bg-white text-gray-800'} border-b shadow-sm py-4 px-6 flex justify-between items-center`}>
      <div className="flex items-center gap-3">
        {isAdmin && (
          <div className="bg-orange-500 text-white px-2 py-0.5 text-xs font-medium rounded-sm">
            ADMIN
          </div>
        )}
        <img 
          alt="MAR - Mapa para Alto Rendimento" 
          src="/lovable-uploads/98e55723-efb7-42e8-bc10-a429fdf04ffb.png" 
          className={`h-5 ${isAdmin ? 'brightness-0 invert' : ''}`} 
        />
      </div>
      
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNavigateToDashboard}
            className={`${isAdmin ? 'text-white hover:bg-slate-700' : ''}`}
          >
            <Home className="h-4 w-4 mr-1" /> Dashboard
          </Button>
        )}
        
        {user && (
          <>
            <span className={`text-sm hidden md:inline ${isAdmin ? 'text-white/80' : ''}`}>
              Bem-vindo, <strong>{user.email?.split('@')[0]}</strong>
            </span>
            <Button 
              variant={isAdmin ? "secondary" : "outline"} 
              size="sm" 
              onClick={handleLogout} 
              className={isAdmin ? "text-white bg-slate-700 hover:bg-slate-600" : "border-quiz text-quiz hover:bg-quiz/10"}
            >
              Sair
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
