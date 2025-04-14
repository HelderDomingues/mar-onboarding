
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarFooter, SidebarHeader, SidebarContent, SidebarMenu, SidebarMenuItem, SidebarMenuButton } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Users, Settings, FileText, Home, Clipboard, LineChart, History, FolderPlus, BarChart } from "lucide-react";

export function AdminSidebar() {
  const { logout } = useAuth();
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };
  
  const handleLogout = async () => {
    await logout();
  };
  
  return (
    <Sidebar className="border-r bg-white">
      <SidebarHeader className="h-16 flex items-center px-6 border-b">
        <Link to="/dashboard">
          <img src="/lovable-uploads/e109ec41-0f89-456d-8081-f73393ed4fd5.png" alt="Crie Valor" className="h-7" />
        </Link>
      </SidebarHeader>
      <SidebarContent className="flex flex-col gap-2 p-4">
        <h2 className="text-lg font-semibold pb-2">Administração</h2>
        
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard")}>
              <Link to="/dashboard" className="w-full justify-start gap-2">
                <Home className="h-4 w-4" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/users")}>
              <Link to="/admin/users" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                <span>Usuários</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/quiz-responses")}>
              <Link to="/admin/quiz-responses" className="w-full justify-start gap-2">
                <Clipboard className="h-4 w-4" />
                <span>Respostas</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/reports")}>
              <Link to="/admin/reports" className="w-full justify-start gap-2">
                <BarChart className="h-4 w-4" />
                <span>Relatórios</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/materials")}>
              <Link to="/admin/materials" className="w-full justify-start gap-2">
                <FolderPlus className="h-4 w-4" />
                <span>Materiais</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/logs")}>
              <Link to="/admin/logs" className="w-full justify-start gap-2">
                <History className="h-4 w-4" />
                <span>Logs do Sistema</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/admin/settings")}>
              <Link to="/admin/settings" className="w-full justify-start gap-2">
                <Settings className="h-4 w-4" />
                <span>Configurações</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        
        <Separator className="my-2" />
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </SidebarContent>
    </Sidebar>
  );
}
