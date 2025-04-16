
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
  const { signOut } = useAuth();
  
  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };
  
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center p-4">
          <img 
            src="/logo-crie-valor.png" 
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
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  }>
                    <Home className="w-4 h-4 mr-2" />
                    <span>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/test-connection" className={({ isActive }) => 
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
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
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  }>
                    <Users className="w-4 h-4 mr-2" />
                    <span>Usuários</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/materials" className={({ isActive }) => 
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  }>
                    <Book className="w-4 h-4 mr-2" />
                    <span>Materiais</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/quiz-responses" className={({ isActive }) => 
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
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
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  }>
                    <FileText className="w-4 h-4 mr-2" />
                    <span>Editor de Questionário</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/seed-quiz" className={({ isActive }) => 
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  }>
                    <Database className="w-4 h-4 mr-2" />
                    <span>Inicializar Questionário</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/recover-quiz" className={({ isActive }) => 
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
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
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  }>
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>Relatórios</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/metrics" className={({ isActive }) => 
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
                  }>
                    <BarChart2 className="w-4 h-4 mr-2" />
                    <span>Métricas</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/logs" className={({ isActive }) => 
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
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
                    isActive ? "text-primary font-medium" : "text-muted-foreground"
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
