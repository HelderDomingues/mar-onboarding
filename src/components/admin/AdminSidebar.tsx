import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarSeparator, SidebarTrigger } from "@/components/ui/sidebar";
import { Home, User, Settings, BarChart, Database, Book, HelpCircle, ChevronDown, ChevronRight, LogIn } from "lucide-react";
import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export function AdminSidebar() {
  const [isUsersOpen, setIsUsersOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Esta função será implementada posteriormente
    console.log("Fazendo logout");
  };

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Sidebar>
      <div className="flex flex-col h-full py-2">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <img
              src="/lovable-uploads/e109ec41-0f89-456d-8081-f73393ed4fd5.png"
              alt="Crie Valor"
              className="h-6"
            />
            <span className="font-semibold text-sm">Admin</span>
          </div>
          <SidebarTrigger />
        </div>

        <div className="flex-1 overflow-auto py-2">
          <div className="space-y-1 px-2">
            <Link to="/admin">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${isActive('/admin') ? 'bg-sidebar-accent' : ''}`}>
                <Home className="mr-2 h-4 w-4" />
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
                  className={`w-full justify-between ${isActive('/admin/users') ? 'bg-sidebar-accent' : ''}`}>
                  <div className="flex items-center">
                    <User className="mr-2 h-4 w-4" />
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
                    className={`w-full justify-start ${location.pathname === '/admin/users' ? 'bg-sidebar-accent' : ''}`}>
                    Todos os Usuários
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" className="w-full justify-start">
                  Adicionar Usuário
                </Button>
              </CollapsibleContent>
            </Collapsible>

            <Link to="/admin/data">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${isActive('/admin/data') ? 'bg-sidebar-accent' : ''}`}>
                <Database className="mr-2 h-4 w-4" />
                Dados
              </Button>
            </Link>

            <Link to="/admin/reports">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${isActive('/admin/reports') ? 'bg-sidebar-accent' : ''}`}>
                <BarChart className="mr-2 h-4 w-4" />
                Relatórios
              </Button>
            </Link>
            
            <Link to="/admin/settings">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${isActive('/admin/settings') ? 'bg-sidebar-accent' : ''}`}>
                <Settings className="mr-2 h-4 w-4" />
                Configurações
              </Button>
            </Link>

            <Link to="/admin/help">
              <Button
                variant="ghost"
                size="sm"
                className={`w-full justify-start ${isActive('/admin/help') ? 'bg-sidebar-accent' : ''}`}>
                <HelpCircle className="mr-2 h-4 w-4" />
                Ajuda
              </Button>
            </Link>
          </div>
        </div>

        <SidebarSeparator />

        <div className="p-2 space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => navigate('/dashboard')}>
                <Home className="mr-2 h-4 w-4" />
                Dashboard Usuário
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ir para o Dashboard do usuário</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full justify-start"
                onClick={() => navigate('/')}>
                <LogIn className="mr-2 h-4 w-4" />
                Autenticação
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Ir para a página de login</p>
            </TooltipContent>
          </Tooltip>

          <div className="flex items-center justify-center">
            <Badge variant="outline" className="text-xs text-muted-foreground">
              v1.0.0
            </Badge>
          </div>
        </div>
      </div>
    </Sidebar>
  );
}
