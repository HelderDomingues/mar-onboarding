
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";
import { Home, LogOut } from "lucide-react";

interface QuizHeaderProps {
  isAdmin?: boolean;
}

export function QuizHeader({
  isAdmin = false
}: QuizHeaderProps) {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    logger.info('Usuário solicitou logout', {
      tag: 'Header'
    });
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const handleNavigateToDashboard = () => {
    navigate("/dashboard");
  };

  return (
    <header className={`${isAdmin ? 'bg-slate-800 text-white' : 'bg-primary text-white'} shadow-md py-4 px-6 flex justify-between items-center font-sans`}>
      <div className="flex items-center gap-3">
        {isAdmin && (
          <div className="bg-orange-500 text-white px-3 py-1 text-xs font-medium rounded-md">
            ADMIN
          </div>
        )}
        <img 
          alt="MAR - Mapa para Alto Rendimento" 
          src="/lovable-uploads/98e55723-efb7-42e8-bc10-a429fdf04ffb.png" 
          className="h-6 brightness-0 invert" 
        />
      </div>
      
      <div className="flex items-center gap-4">
        {isAdmin && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleNavigateToDashboard} 
            className="text-white hover:bg-slate-700 hover:text-white"
          >
            <Home className="h-4 w-4 mr-1" /> Dashboard
          </Button>
        )}
        
        {user && (
          <>
            <span className="text-sm hidden md:inline text-white font-sans">
              Bem-vindo, <strong>{user.email?.split('@')[0]}</strong>
            </span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleLogout} 
              className="text-white border-white hover:bg-white/20 hover:text-white font-sans"
              type="button"
            >
              <LogOut className="h-4 w-4 mr-1 rotate-180" />
              Sair
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
