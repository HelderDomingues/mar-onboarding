
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";

export function QuizHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    logger.info('Usuário solicitou logout', { tag: 'Header' });
    await logout();
    navigate("/");
  };
  
  return (
    <header className="bg-white border-b shadow-sm py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <img 
          src="/lovable-uploads/19c7913c-2c4f-40f0-902b-d687b026e7c9.png" 
          alt="MAR - Mapa para Alto Rendimento" 
          className="h-10"
        />
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm hidden md:inline">
              Bem-vindo, <strong>{user.email?.split('@')[0]}</strong>
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="border-quiz text-quiz hover:bg-quiz/10"
            >
              Sair
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
