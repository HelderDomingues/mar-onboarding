
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  ChevronRight, 
  Users, 
  Settings as SettingsIcon, 
  LayoutDashboard, 
  HelpCircle, 
  FileBarChart2, 
  ListChecks, 
  FileEdit,
  Database,
  BarChart,
  BookOpen,
  PanelLeftClose,
  ShieldAlert,
  LogOut
} from "lucide-react";
import { 
  Sidebar, 
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu, 
  SidebarMenuItem, 
  SidebarMenuButton, 
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarTrigger
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";

export function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  
  const currentRoute = location.pathname;
  
  const handleLogout = async () => {
    try {
      logger.info('Iniciando logout a partir da sidebar', { tag: 'Admin' });
      addLogEntry('auth', 'Solicitação de logout via AdminSidebar');
      await logout();
    } catch (error) {
      logger.error('Erro durante logout a partir da sidebar', { 
        tag: 'Admin', 
        data: error 
      });
    }
  };
  
  return (
    <Sidebar className="fixed left-0 top-0 bottom-0 w-64 border-r bg-card text-card-foreground">
      <SidebarHeader className="sticky top-0 z-10 border-b bg-background px-6 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white">
            <span className="font-semibold">CV</span>
          </div>
          <div className="font-medium">
            <div className="text-lg font-semibold">Crie Valor</div>
            <div className="text-xs text-muted-foreground">Painel Administrativo</div>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-4 py-6">
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/admin/users" 
                    className={`${currentRoute === '/admin/users' ? 'bg-accent/50 text-accent-foreground' : ''}`}
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/admin/users" 
                    className={`${currentRoute === '/admin/users' ? 'bg-accent/50 text-accent-foreground' : ''}`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Usuários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/admin/quiz-responses" 
                    className={`${currentRoute === '/admin/quiz-responses' ? 'bg-accent/50 text-accent-foreground' : ''}`}
                  >
                    <ListChecks className="h-4 w-4" />
                    <span>Questionários</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/admin/quiz-editor" 
                    className={`${currentRoute === '/admin/quiz-editor' ? 'bg-accent/50 text-accent-foreground' : ''}`}
                  >
                    <FileEdit className="h-4 w-4" />
                    <span>Editor de Questionário</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/admin/seed-quiz" 
                    className={`${currentRoute === '/admin/seed-quiz' ? 'bg-accent/50 text-accent-foreground' : ''}`}
                  >
                    <Database className="h-4 w-4" />
                    <span>Configurar Questionário</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/admin/reports" 
                    className={`${currentRoute === '/admin/reports' ? 'bg-accent/50 text-accent-foreground' : ''}`}
                  >
                    <FileBarChart2 className="h-4 w-4" />
                    <span>Relatórios e Análises</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/admin/materials" 
                    className={`${currentRoute === '/admin/materials' ? 'bg-accent/50 text-accent-foreground' : ''}`}
                  >
                    <BookOpen className="h-4 w-4" />
                    <span>Materiais</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/admin/metrics" 
                    className={`${currentRoute === '/admin/metrics' ? 'bg-accent/50 text-accent-foreground' : ''}`}
                  >
                    <BarChart className="h-4 w-4" />
                    <span>Métricas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/admin/settings" 
                    className={`${currentRoute === '/admin/settings' ? 'bg-accent/50 text-accent-foreground' : ''}`}
                  >
                    <SettingsIcon className="h-4 w-4" />
                    <span>Configurações</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link 
                    to="/admin/logs" 
                    className={`${currentRoute === '/admin/logs' ? 'bg-accent/50 text-accent-foreground' : ''}`}
                  >
                    <ShieldAlert className="h-4 w-4" />
                    <span>Logs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t py-4 px-6">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-xs font-medium text-primary">
                  {user?.email ? user.email.substring(0, 2).toUpperCase() : 'AD'}
                </span>
              </div>
              <div className="text-sm font-medium">
                {user?.email ? user.email : 'Administrador'}
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="text-destructive hover:text-destructive/80"
              title="Sair"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full justify-between"
            onClick={() => document.querySelector('[data-sidebar="trigger"]')?.click()}
          >
            <span>Ocultar Sidebar</span>
            <PanelLeftClose className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
