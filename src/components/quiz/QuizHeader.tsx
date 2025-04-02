
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { logger } from "@/utils/logger";
import { Home, LogOut, UserCircle } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

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

  const userInitials = user?.email ? user.email.substring(0, 2).toUpperCase() : "US";

  return (
    <header className={`${isAdmin ? 'bg-slate-800 text-white' : 'bg-primary text-white'} shadow-md py-4 px-6 flex justify-between items-center font-sans`}>
      <div className="flex items-center gap-3">
        {isAdmin && (
          <div className="bg-blue-600 text-white px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1">
            <span className="font-sans">Admin</span>
          </div>
        )}
        <img 
          alt="MAR - Mapa para Alto Rendimento" 
          src="/lovable-uploads/fc26fbf8-6a4c-4016-9ab3-5be4628828c9.png" 
          className="h-8" 
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                <Avatar>
                  <AvatarFallback className="bg-primary-700 text-white font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                <span>{user.email}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600">
                <LogOut className="h-4 w-4 rotate-180" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
