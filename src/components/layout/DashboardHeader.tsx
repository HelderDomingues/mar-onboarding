
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Home, User, FileText, Book, Settings, LogOut, BarChart } from "lucide-react";

interface DashboardHeaderProps {
  isAdmin?: boolean;
}

interface UserProfile {
  full_name?: string;
  avatar_url?: string;
}

export function DashboardHeader({ isAdmin = false }: DashboardHeaderProps) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
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
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const userInitials = profile?.full_name 
    ? profile.full_name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : user?.email 
      ? user.email.substring(0, 2).toUpperCase() 
      : "US";
      
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b bg-blue-800 text-white shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex items-center gap-2">
              <img 
                src="https://static.wixstatic.com/media/783feb_0e0fffdb3f3e4eafa422021dcea535d4~mv2.png" 
                alt="MAR - Mapa para Alto Rendimento" 
                className="h-8"
              />
              {isAdmin && (
                <div className="ml-2 bg-amber-500 text-white px-3 py-1 text-xs font-medium rounded-md">
                  Admin
                </div>
              )}
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-1">
            <Button 
              variant={isActive("/dashboard") ? "default" : "ghost"} 
              size="sm" 
              asChild
              className="gap-1.5 text-white hover:bg-blue-700"
            >
              <Link to="/dashboard">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </Button>
            
            <Button 
              variant={isActive("/quiz") || location.pathname.includes("/quiz/") ? "default" : "ghost"} 
              size="sm" 
              asChild
              className="gap-1.5 text-white hover:bg-blue-700"
            >
              <Link to="/quiz">
                <FileText className="h-4 w-4" />
                <span>Questionário</span>
              </Link>
            </Button>
            
            <Button 
              variant={location.pathname.includes("/quiz/review") ? "default" : "ghost"} 
              size="sm" 
              asChild
              className="gap-1.5 text-white hover:bg-blue-700"
            >
              <Link to="/quiz/review">
                <BarChart className="h-4 w-4" />
                <span>Análises</span>
              </Link>
            </Button>
            
            <Button 
              variant={isActive("/member") ? "default" : "ghost"} 
              size="sm" 
              asChild
              className="gap-1.5 text-white hover:bg-blue-700"
            >
              <Link to="/member">
                <User className="h-4 w-4" />
                <span>Área do Membro</span>
              </Link>
            </Button>
            
            <Button 
              variant={isActive("/materials") ? "default" : "ghost"} 
              size="sm" 
              asChild
              className="gap-1.5 text-white hover:bg-blue-700"
            >
              <Link to="/materials">
                <Book className="h-4 w-4" />
                <span>Materiais</span>
              </Link>
            </Button>
          </nav>
          
          <div className="flex items-center gap-4">
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0 hover:bg-blue-700">
                    <Avatar>
                      {profile?.avatar_url ? (
                        <AvatarImage src={profile.avatar_url} alt={profile.full_name || "Avatar do usuário"} />
                      ) : null}
                      <AvatarFallback className="bg-blue-600 text-white font-medium">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col">
                      <span className="font-medium">{profile?.full_name || 'Usuário'}</span>
                      <span className="text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/dashboard" className="flex items-center gap-2 cursor-pointer">
                      <Home className="h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/member" className="flex items-center gap-2 cursor-pointer">
                      <User className="h-4 w-4" />
                      <span>Meu Perfil</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/member?tab=settings" className="flex items-center gap-2 cursor-pointer">
                      <Settings className="h-4 w-4" />
                      <span>Configurações</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="flex items-center gap-2 text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4 rotate-180" />
                    <span>Sair</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
