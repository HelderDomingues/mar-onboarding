
import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarFooter
} from '@/components/ui/sidebar';
import {
  Users,
  Database,
  FileText,
  Settings,
  Home,
  BarChart2,
  FileCheck,
  Book,
  Calendar,
  ListChecks,
  LogOut
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const AdminSidebar = () => {
  const { logout } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };
  
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader>
        <div className="flex items-center p-4">
          <img 
            src="/lovable-uploads/e109ec41-0f89-456d-8081-f73393ed4fd5.png" 
            alt="Crie Valor" 
            className="h-8 mr-2" 
          />
          <div>
            <h2 className="text-lg font-semibold">Sistema MAR</h2>
            <p className="text-xs text-muted-foreground">Painel Administrativo</p>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard" className={({ isActive }) => 
                    isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"
                  }>
                    <Home className="w-4 h-4 mr-2" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/test-connection" className={({ isActive }) => 
                    isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"
                  }>
                    <Database className="w-4 h-4 mr-2" />
                    <span>Teste de Conexão</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Gerenciamento</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/users" className={({ isActive }) => 
                    isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"
                  }>
                    <Users className="w-4 h-4 mr-2" />
                    <span>Usuários</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/materials" className={({ isActive }) => 
                    isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"
                  }>
                    <Book className="w-4 h-4 mr-2" />
                    <span>Materiais</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/quiz-responses" className={({ isActive }) => 
                    isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"
                  }>
                    <FileCheck className="w-4 h-4 mr-2" />
                    <span>Respostas do Questionário</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Questionário</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/quiz-editor" className={({ isActive }) => 
                    isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"
                  }>
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Editor de Questionário</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/seed-quiz" className={({ isActive }) => 
                    isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"
                  }>
                    <Database className="w-4 h-4 mr-2" />
                    <span>Inicializar Questionário</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/recover-quiz" className={({ isActive }) => 
                    isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"
                  }>
                    <ListChecks className="w-4 h-4 mr-2" />
                    <span>Recuperar Questionário</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Relatórios</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/reports" className={({ isActive }) => 
                    isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"
                  }>
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Relatórios</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/metrics" className={({ isActive }) => 
                    isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"
                  }>
                    <BarChart2 className="w-4 h-4 mr-2" />
                    <span>Métricas</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/logs" className={({ isActive }) => 
                    isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"
                  }>
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Logs do Sistema</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/settings" className={({ isActive }) => 
                    isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"
                  }>
                    <Settings className="w-4 h-4 mr-2" />
                    <span>Configurações</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={handleSignOut}
          >
            <LogOut className="w-4 h-4 mr-2" />
            <span>Sair</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
