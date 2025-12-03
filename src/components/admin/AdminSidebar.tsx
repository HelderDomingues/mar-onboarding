import React from 'react';
import { NavLink } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuItem, SidebarMenuButton, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, SidebarFooter, SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Users, Database, FileText, Settings, Home, BarChart2, FileCheck, Book, Calendar, ListChecks, LogOut, Menu, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useViewAsUser } from '@/contexts/ViewAsUserContext';

const SidebarMenuItems = ({ onLinkClick }: { onLinkClick?: () => void }) => {
  const { logout } = useAuth();
  const { open } = useSidebar();
  const { enableViewAsUser, isViewingAsUser } = useViewAsUser();

  const handleSignOut = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Erro ao sair:', error);
    }
  };

  return (
    <>
      <SidebarGroup>
        {open && <SidebarGroupLabel>Navegação</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink 
                  to="/dashboard" 
                  onClick={onLinkClick}
                  className={({ isActive }) => 
                    `flex items-center gap-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`
                  }
                >
                  <Home className="w-4 h-4 flex-shrink-0" />
                  {open && <span>Dashboard</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink 
                  to="/test-connection" 
                  onClick={onLinkClick}
                  className={({ isActive }) => 
                    `flex items-center gap-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`
                  }
                >
                  <Database className="w-4 h-4 flex-shrink-0" />
                  {open && <span>Teste de Conexão</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      
      <SidebarGroup>
        {open && <SidebarGroupLabel>Gerenciamento</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink 
                  to="/admin/users" 
                  onClick={onLinkClick}
                  className={({ isActive }) => 
                    `flex items-center gap-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`
                  }
                >
                  <Users className="w-4 h-4 flex-shrink-0" />
                  {open && <span>Usuários</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink 
                  to="/admin/materials" 
                  onClick={onLinkClick}
                  className={({ isActive }) => 
                    `flex items-center gap-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`
                  }
                >
                  <Book className="w-4 h-4 flex-shrink-0" />
                  {open && <span>Materiais</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink 
                  to="/admin/quiz-responses" 
                  onClick={onLinkClick}
                  className={({ isActive }) => 
                    `flex items-center gap-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`
                  }
                >
                  <FileCheck className="w-4 h-4 flex-shrink-0" />
                  {open && <span>Respostas do Questionário</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      
      <SidebarGroup>
        {open && <SidebarGroupLabel>Questionário</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink 
                  to="/admin/quiz-editor" 
                  onClick={onLinkClick}
                  className={({ isActive }) => 
                    `flex items-center gap-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`
                  }
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  {open && <span>Editor de Questionário</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink 
                  to="/admin/seed-quiz" 
                  onClick={onLinkClick}
                  className={({ isActive }) => 
                    `flex items-center gap-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`
                  }
                >
                  <Database className="w-4 h-4 flex-shrink-0" />
                  {open && <span>Inicializar Questionário</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink 
                  to="/admin/recover-quiz" 
                  onClick={onLinkClick}
                  className={({ isActive }) => 
                    `flex items-center gap-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`
                  }
                >
                  <ListChecks className="w-4 h-4 flex-shrink-0" />
                  {open && <span>Recuperar Questionário</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      
      <SidebarGroup>
        {open && <SidebarGroupLabel>Relatórios</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink 
                  to="/admin/reports" 
                  onClick={onLinkClick}
                  className={({ isActive }) => 
                    `flex items-center gap-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`
                  }
                >
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  {open && <span>Relatórios</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink 
                  to="/admin/metrics" 
                  onClick={onLinkClick}
                  className={({ isActive }) => 
                    `flex items-center gap-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`
                  }
                >
                  <BarChart2 className="w-4 h-4 flex-shrink-0" />
                  {open && <span>Métricas</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink 
                  to="/admin/logs" 
                  onClick={onLinkClick}
                  className={({ isActive }) => 
                    `flex items-center gap-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`
                  }
                >
                  <FileText className="w-4 h-4 flex-shrink-0" />
                  {open && <span>Logs do Sistema</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
      
      <SidebarGroup>
        {open && <SidebarGroupLabel>Sistema</SidebarGroupLabel>}
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink 
                  to="/admin/settings" 
                  onClick={onLinkClick}
                  className={({ isActive }) => 
                    `flex items-center gap-2 ${isActive ? 'text-primary font-medium' : 'text-muted-foreground'}`
                  }
                >
                  <Settings className="w-4 h-4 flex-shrink-0" />
                  {open && <span>Configurações</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <div className="mt-auto border-t pt-4 space-y-2">
        <Button 
          variant={isViewingAsUser ? "secondary" : "outline"}
          onClick={() => {
            enableViewAsUser();
            onLinkClick?.();
          }}
          className="w-full justify-start gap-2"
          disabled={isViewingAsUser}
        >
          <Eye className="w-4 h-4 flex-shrink-0" />
          {open && <span>{isViewingAsUser ? "Modo Usuário Ativo" : "Ver como Usuário"}</span>}
        </Button>
        <Button 
          variant="destructive" 
          onClick={handleSignOut} 
          className="w-full justify-start gap-2"
        >
          <LogOut className="w-4 h-4 flex-shrink-0" />
          {open && <span>Sair</span>}
        </Button>
      </div>
    </>
  );
};

export const AdminSidebar = () => {
  const { isMobile, openMobile, setOpenMobile } = useSidebar();

  // Mobile: Renderiza como Sheet (drawer overlay)
  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent side="left" className="w-72 p-0">
          <div className="flex flex-col h-full">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">Sistema MAR</h2>
              <p className="text-xs text-muted-foreground">Painel Admin</p>
            </div>
            <div className="flex-1 overflow-y-auto p-4">
              <SidebarMenuItems onLinkClick={() => setOpenMobile(false)} />
            </div>
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // Desktop: Sidebar colapsável tradicional
  return (
    <Sidebar collapsible="icon" className="hidden md:flex">
      <SidebarHeader className="border-b p-4 flex flex-row items-center justify-between">
        <div className={`flex-1 min-w-0 transition-opacity duration-200 ${open ? 'opacity-100' : 'opacity-0'}`}>
          {open && (
            <>
              <h2 className="text-lg font-semibold truncate">Sistema MAR</h2>
              <p className="text-xs text-muted-foreground truncate">Painel Admin</p>
            </>
          )}
        </div>
        <SidebarTrigger className="ml-2" />
      </SidebarHeader>
      
      <SidebarContent className="p-4">
        <SidebarMenuItems />
      </SidebarContent>
    </Sidebar>
  );
};

export default AdminSidebar;