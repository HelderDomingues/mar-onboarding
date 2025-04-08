
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarTrigger
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  FileClock,
  FileCheck,
  User,
  BarChart
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfile {
  full_name?: string;
  avatar_url?: string;
}

export function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const { user, logout } = useAuth();
  
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
    ? profile.full_name.split(' ').slice(0, 2).map(name => name[0]).join('').toUpperCase()
    : user?.email 
      ? user.email.substring(0, 2).toUpperCase() 
      : "AD";
      
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  return (
    <Sidebar className="hidden md:flex">
      <SidebarHeader className="border-b">
        <div className="flex items-center p-4">
          <img
            src="https://static.wixstatic.com/media/783feb_0e0fffdb3f3e4eafa422021dcea535d4~mv2.png"
            className="h-8 mr-3"
            alt="MAR - Mapa para Alto Rendimento"
          />
          <div className="bg-blue-600 text-white px-3 py-1 text-xs font-medium rounded-md">
            Admin
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <div className="w-full flex pt-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative w-full justify-start rounded-none px-4 h-auto py-2">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    {profile?.avatar_url ? (
                      <AvatarImage src={profile.avatar_url} alt="Avatar" />
                    ) : null}
                    <AvatarFallback className="bg-primary-700 text-white font-medium">
                      {userInitials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium">{profile?.full_name || "Administrador"}</p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/member" className="cursor-pointer">
                  <User className="h-4 w-4 mr-2" />
                  <span>Meu Perfil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/admin/settings" className="cursor-pointer">
                  <Settings className="h-4 w-4 mr-2" />
                  <span>Configurações</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleLogout}
                className="text-red-600 cursor-pointer"
              >
                <LogOut className="h-4 w-4 mr-2 rotate-180" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <nav className="mt-6">
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight">
              Administração
            </h2>
            <div className="space-y-1">
              <Button
                variant={isActive("/dashboard") || isActive("/admin") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate('/dashboard')}
              >
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
              
              <Button
                variant={isActive("/admin/users") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate('/admin/users')}
              >
                <Users className="h-4 w-4 mr-2" />
                Usuários
              </Button>
              
              <Button
                variant={isActive("/admin/reports") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate('/admin/reports')}
              >
                <BarChart className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
              
              <Button
                variant={isActive("/admin/settings") ? "secondary" : "ghost"}
                className="w-full justify-start"
                onClick={() => navigate('/admin/settings')}
              >
                <Settings className="h-4 w-4 mr-2" />
                Configurações
              </Button>
            </div>
          </div>
          
          <div className="px-3 py-2">
            <h2 className="mb-2 px-4 text-xs font-semibold tracking-tight">
              Páginas Especiais
            </h2>
            <div className="space-y-1">
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate('/quiz/review')}
              >
                <FileClock className="h-4 w-4 mr-2" />
                Página de Revisão
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate('/quiz/diagnostic')}
              >
                <FileCheck className="h-4 w-4 mr-2" />
                Página de Diagnóstico
              </Button>
              
              <Button
                variant="ghost"
                className="w-full justify-start"
                onClick={() => navigate('/member')}
              >
                <User className="h-4 w-4 mr-2" />
                Página de Membro
              </Button>
            </div>
          </div>
        </nav>
      </SidebarContent>
      
      <SidebarFooter className="border-t">
        <div className="p-3">
          <SidebarTrigger className="mb-1 w-full text-slate-900">
            <LogOut className="h-4 w-4 mr-2 rotate-180" />
            Ocultar Menu
          </SidebarTrigger>
          <p className="text-xs text-center text-muted-foreground">v1.0.0</p>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
