import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarFooter, useSidebar } from '@/components/ui/sidebar';
import { Users, Database, FileText, Settings, Home, BarChart2, FileCheck, Book, Calendar, ListChecks, LogOut, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
export const AdminSidebar = () => {
  const {
    logout
  } = useAuth();
  const {
    open,
    toggleSidebar
  } = useSidebar();
  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };
  return <Sidebar collapsible="icon" className={open ? "w-64" : "w-16"}>
      <SidebarHeader className="border-b">
        <div className="flex items-center justify-between p-4">
          {open && (
            <div>
              <h2 className="text-base md:text-lg font-semibold">Sistema MAR</h2>
              <p className="text-xs text-muted-foreground">Painel Admin</p>
            </div>
          )}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleSidebar} 
            className="ml-auto"
          >
            {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelRightClose className="h-4 w-4" />}
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
                }) => `flex items-center w-full ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'} ${!open ? 'justify-center' : ''}`}>
                    <Home className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Dashboard</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/test-connection" className={({
                  isActive
                }) => `flex items-center w-full ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'} ${!open ? 'justify-center' : ''}`}>
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
                }) => `flex items-center w-full ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'} ${!open ? 'justify-center' : ''}`}>
                    <Users className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Usuários</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/materials" className={({
                  isActive
                }) => `flex items-center w-full ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'} ${!open ? 'justify-center' : ''}`}>
                    <Book className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Materiais</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/quiz-responses" className={({
                  isActive
                }) => `flex items-center w-full ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'} ${!open ? 'justify-center' : ''}`}>
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
                }) => `flex items-center w-full ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'} ${!open ? 'justify-center' : ''}`}>
                    <FileText className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Editor de Questionário</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/seed-quiz" className={({
                  isActive
                }) => `flex items-center w-full ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'} ${!open ? 'justify-center' : ''}`}>
                    <Database className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Inicializar Questionário</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/recover-quiz" className={({
                  isActive
                }) => `flex items-center w-full ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'} ${!open ? 'justify-center' : ''}`}>
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
                }) => `flex items-center w-full ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'} ${!open ? 'justify-center' : ''}`}>
                    <Calendar className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Relatórios</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/metrics" className={({
                  isActive
                }) => `flex items-center w-full ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'} ${!open ? 'justify-center' : ''}`}>
                    <BarChart2 className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Métricas</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink to="/admin/logs" className={({
                  isActive
                }) => `flex items-center w-full ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'} ${!open ? 'justify-center' : ''}`}>
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
                }) => `flex items-center w-full ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'} ${!open ? 'justify-center' : ''}`}>
                    <Settings className="w-4 h-4 mr-2" />
                    <span className={open ? "opacity-100" : "opacity-0"}>Configurações</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="border-t">
        <div className="p-4">
          <Button 
            variant="destructive" 
            onClick={handleSignOut} 
            className={`w-full ${open ? 'justify-start' : 'justify-center'}`}
          >
            <LogOut className="w-4 h-4" />
            {open && <span className="ml-2">Sair</span>}
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>;
};
export default AdminSidebar;