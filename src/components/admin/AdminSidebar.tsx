import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarFooter, useSidebar } from '@/components/ui/sidebar';
import { Users, Database, FileText, Settings, Home, BarChart2, FileCheck, Book, Calendar, ListChecks, LogOut, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export const AdminSidebar = () => {
  const { logout } = useAuth();
  const { open, toggleSidebar } = useSidebar();
  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };
  return <Sidebar>
      <SidebarHeader>
        <div className="flex items-center p-4 justify-between">
          
          <div>
            <h2 className="text-lg font-semibold">Sistema MAR</h2>
            <p className="text-xs text-muted-foreground">Painel Administrativo</p>
          </div>
          <Button variant="ghost" size="icon" onClick={toggleSidebar}>
            {open ? <PanelLeftClose /> : <PanelRightClose />}
          </Button>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/dashboard" className={({
                  isActive
                }) => isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"}>
                    <Home className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/test-connection" className={({
                  isActive
                }) => isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"}>
                    <Database className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Teste de Conexão</span>
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
                  <NavLink to="/admin/users" className={({
                  isActive
                }) => isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"}>
                    <Users className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Usuários</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/materials" className={({
                  isActive
                }) => isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"}>
                    <Book className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Materiais</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/quiz-responses" className={({
                  isActive
                }) => isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"}>
                    <FileCheck className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Respostas do Questionário</span>
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
                  <NavLink to="/admin/quiz-editor" className={({
                  isActive
                }) => isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"}>
                    <FileText className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Editor de Questionário</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/seed-quiz" className={({
                  isActive
                }) => isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"}>
                    <Database className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Inicializar Questionário</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/recover-quiz" className={({
                  isActive
                }) => isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"}>
                    <ListChecks className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Recuperar Questionário</span>
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
                  <NavLink to="/admin/reports" className={({
                  isActive
                }) => isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"}>
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Relatórios</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/metrics" className={({
                  isActive
                }) => isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"}>
                    <BarChart2 className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Métricas</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/logs" className={({
                  isActive
                }) => isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"}>
                    <FileText className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Logs do Sistema</span>
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
                  <NavLink to="/admin/settings" className={({
                  isActive
                }) => isActive ? "text-primary font-medium flex items-center w-full" : "text-muted-foreground flex items-center w-full"}>
                    <Settings className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Configurações</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <div className="p-4">
          <Button variant="outline" onClick={handleSignOut} className="w-full justify-start bg-red-600 hover:bg-red-500">
            <LogOut className="w-4 h-4 mr-2" />
            <span className={open ? "opacity-100" : "opacity-0"}>Sair</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>;
};
export default AdminSidebar;