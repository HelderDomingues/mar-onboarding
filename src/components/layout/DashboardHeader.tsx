
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Cog, Home, LogOut, ChevronDown, User } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { logger } from "@/utils/logger";

interface DashboardHeaderProps {
  isAdmin?: boolean;
}

export function DashboardHeader({ isAdmin = false }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    try {
      logger.info('Iniciando logout a partir do header', { tag: 'Header' });
      await logout();
      // Navegação feita após o logout para garantir que estados são limpos
      navigate('/');
      logger.info('Navegação após logout concluída', { tag: 'Header' });
    } catch (error) {
      logger.error('Erro durante o processo de logout', { 
        tag: 'Header', 
        data: error 
      });
    }
  };
  
  // Determinar as iniciais do usuário de forma segura
  const userInitials = React.useMemo(() => {
    if (!user) return "??";
    if (!user.email) return "??";
    return user.email.slice(0, 2).toUpperCase();
  }, [user]);
  
  return (
    <header className="bg-white border-b py-3 px-4 sm:px-6 lg:px-8 sticky top-0 z-30">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Link to="/dashboard">
            <img 
              src="/lovable-uploads/e109ec41-0f89-456d-8081-f73393ed4fd5.png" 
              alt="Crie Valor" 
              className="h-7 object-scale-down"
            />
          </Link>
        </div>
        
        <div className="flex items-center gap-2">
          {isAdmin && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/admin/users')}
              className="mr-2 text-slate-600 hover:text-slate-900 gap-2"
            >
              <Cog className="h-4 w-4" />
              <span className="hidden sm:inline">Admin</span>
            </Button>
          )}
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="text-slate-600 hover:text-slate-900 gap-2"
          >
            <Home className="h-4 w-4" />
            <span className="hidden sm:inline">Dashboard</span>
          </Button>
          
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/profile')}
            className="text-slate-600 hover:text-slate-900 gap-2"
          >
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </Button>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-blue-600 text-white text-xs">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden sm:inline text-slate-600">
                  {user?.email ? user.email.split('@')[0] : 'Usuário'}
                </span>
                <ChevronDown className="h-4 w-4 text-slate-600" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                Dashboard
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate('/profile')}>
                Perfil
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={() => navigate('/member')}>
                Área do Membro
              </DropdownMenuItem>
              
              <DropdownMenuSeparator />
              
              <DropdownMenuItem className="text-red-600" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
