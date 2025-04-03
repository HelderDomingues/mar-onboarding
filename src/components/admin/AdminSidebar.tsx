
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";
import { 
  Settings, 
  BarChart, 
  Database, 
  HelpCircle, 
  ChevronDown, 
  ChevronRight, 
  LogOut,
  Users,
  LayoutDashboard,
  UserPlus,
  FileUp
} from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

export function AdminSidebar() {
  const [isUsersOpen, setIsUsersOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    }
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Sidebar>
      <div className="flex flex-col h-full py-2">
        <div className="flex flex-col items-center gap-2 px-4 py-3 border-b mb-4">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center">
              <img
                src="/lovable-uploads/fc26fbf8-6a4c-4016-9ab3-5be4628828c9.png"
                alt="MAR - Mapa para Alto Rendimento"
                className="h-8"
              />
              <Badge variant="default" className="ml-2 bg-blue-600 text-white px-2 py-1 text-xs font-medium rounded">
                Admin
              </Badge>
            </div>
            <SidebarTrigger />
          </div>
          <div className="flex justify-center w-full mt-2">
            <img
              src="/lovable-uploads/ab2ed2e2-b060-4ec5-8ebb-06a38b16e0f7.png"
              alt="Crie Valor"
              className="h-4"
            />
          </div>
        </div>

        <div className="flex-1 overflow-auto py-2">
          <div className="space-y-1 px-2 font-sans">
            <Link to="/admin">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${isActive('/admin') && !isActive('/admin/users') && !isActive('/admin/settings') ? 'bg-sidebar-accent text-primary' : ''}`}>
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </Link>
            
            <Collapsible
              open={isUsersOpen}
              onOpenChange={setIsUsersOpen}
              className="w-full">
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`w-full justify-between ${isActive('/admin/users') ? 'bg-sidebar-accent text-primary' : ''}`}>
                  <div className="flex items-center">
                    <Users className="mr-2 h-4 w-4" />
                    <span>Usuários</span>
                  </div>
                  {isUsersOpen ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pl-6 space-y-1">
                <Link to="/admin/users">
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`w-full justify-start ${location.pathname === '/admin/users' ? 'bg-sidebar-accent text-primary' : ''}`}>
                    Todos os Usuários
                  </Button>
                </Link>
                <Link to="/admin/users/new">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`w-full justify-start ${location.pathname === '/admin/users/new' ? 'bg-sidebar-accent text-primary' : ''}`}>
                    Adicionar Usuário
                  </Button>
                </Link>
                <Link to="/admin/users/import">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className={`w-full justify-start ${location.pathname === '/admin/users/import' ? 'bg-sidebar-accent text-primary' : ''}`}>
                    <FileUp className="mr-2 h-4 w-4" />
                    Importar do Asaas
                  </Button>
                </Link>
              </CollapsibleContent>
            </Collapsible>

            <Link to="/admin/data">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${isActive('/admin/data') ? 'bg-sidebar-accent text-primary' : ''}`}>
                <Database className="mr-2 h-4 w-4" />
                Dados
              </Button>
            </Link>

            <Link to="/admin/reports">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${isActive('/admin/reports') ? 'bg-sidebar-accent text-primary' : ''}`}>
                <BarChart className="mr-2 h-4 w-4" />
                Relatórios
              </Button>
            </Link>
            
            <Link to="/admin/settings">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${isActive('/admin/settings') ? 'bg-sidebar-accent text-primary' : ''}`}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Button>
            </Link>

            <Link to="/admin/help">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${isActive('/admin/help') ? 'bg-sidebar-accent text-primary' : ''}`}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Ajuda
              </Button>
            </Link>
          </div>
        </div>

        <SidebarSeparator />

        <div className="p-2 space-y-2">
          {user && (
            <div className="flex items-center p-2 rounded-md bg-muted">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user.email}</p>
                <p className="text-xs text-muted-foreground">Administrador</p>
              </div>
            </div>
          )}
          
          <Button 
            variant="destructive" 
            size="sm" 
            className="w-full justify-start opacity-90 hover:opacity-100"
            onClick={handleLogout}
            type="button">
            <LogOut className="mr-2 h-4 w-4 rotate-180" />
            Sair
          </Button>

          <div className="flex items-center justify-center pt-2">
            <Badge variant="outline" className="text-xs text-muted-foreground font-sans">
              v1.0.0
            </Badge>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
