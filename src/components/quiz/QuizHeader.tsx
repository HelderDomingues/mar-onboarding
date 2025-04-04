
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate, Link } from "react-router-dom";
import { logger } from "@/utils/logger";
import { Home, LogOut, UserCircle, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";

interface QuizHeaderProps {
  isAdmin?: boolean;
}

interface UserProfile {
  full_name?: string;
  avatar_url?: string;
}

export function QuizHeader({
  isAdmin = false
}: QuizHeaderProps) {
  const {
    user,
    logout
  } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  
  useEffect(() => {
    const fetchProfile = async () => {
      if (user?.id) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, avatar_url')
            .eq('id', user.id)
            .single();
            
          if (!error && data) {
            setProfile(data);
          }
        } catch (error) {
          console.error('Erro ao buscar perfil:', error);
        }
      }
    };
    
    fetchProfile();
  }, [user]);
  
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

  const handleNavigateToMember = () => {
    navigate("/member");
  };

  const userInitials = profile?.full_name 
    ? profile.full_name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : user?.email 
      ? user.email.substring(0, 2).toUpperCase() 
      : "US";

  return (
    <header className={`${isAdmin ? 'bg-slate-800 text-white' : 'bg-primary text-white'} shadow-md py-4 px-6 lg:px-8 flex justify-between items-center font-sans sticky top-0 z-30 w-full`}>
      <div className="flex items-center gap-3">
        <Link to="/dashboard">
          <img alt="MAR - Mapa para Alto Rendimento" className="h-8" src="https://static.wixstatic.com/media/783feb_0e0fffdb3f3e4eafa422021dcea535d4~mv2.png" />
        </Link>
        {isAdmin && (
          <div className="bg-blue-600 text-white px-3 py-1 text-xs font-medium rounded-md flex items-center gap-1">
            <span className="font-sans">Admin</span>
          </div>
        )}
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={handleNavigateToDashboard} className="text-white hover:bg-white/10 hover:text-white">
          <Home className="h-4 w-4 mr-1" /> Dashboard
        </Button>
        
        <Button variant="ghost" size="sm" onClick={handleNavigateToMember} className="text-white hover:bg-white/10 hover:text-white">
          <User className="h-4 w-4 mr-1" /> Área do Membro
        </Button>
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
                <Avatar>
                  {profile?.avatar_url ? (
                    <AvatarImage src={profile.avatar_url} alt={profile.full_name || "Avatar do usuário"} />
                  ) : null}
                  <AvatarFallback className="bg-primary-700 text-white font-medium">
                    {userInitials}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex items-center gap-2">
                <UserCircle className="h-4 w-4" />
                <span>{profile?.full_name || user.email}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleNavigateToMember} className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Editar Perfil</span>
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
