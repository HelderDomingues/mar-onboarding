
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Sidebar, SidebarFooter, SidebarHeader } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { LogOut, Users, Settings, FileText, Home, Clipboard, LineChart, History, FolderPlus } from "lucide-react";

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
      <div className="flex flex-col gap-2 p-4">
        <h2 className="text-lg font-semibold pb-2">Administração</h2>
        
        <Link to="/dashboard">
          <Button 
            variant={isActive("/dashboard") ? "default" : "ghost"} 
            className="w-full justify-start gap-2"
          >
            <Home className="h-4 w-4" />
            Dashboard
          </Button>
        </Link>
        
        <Link to="/admin/users">
          <Button 
            variant={isActive("/admin/users") ? "default" : "ghost"} 
            className="w-full justify-start gap-2"
          >
            <Users className="h-4 w-4" />
            Usuários
          </Button>
        </Link>
        
        <Link to="/admin/quiz-responses">
          <Button 
            variant={isActive("/admin/quiz-responses") ? "default" : "ghost"} 
            className="w-full justify-start gap-2"
          >
            <Clipboard className="h-4 w-4" />
            Respostas
          </Button>
        </Link>
        
        <Link to="/admin/materials">
          <Button 
            variant={isActive("/admin/materials") ? "default" : "ghost"} 
            className="w-full justify-start gap-2"
          >
            <FolderPlus className="h-4 w-4" />
            Materiais
          </Button>
        </Link>
        
        <Link to="/admin/logs">
          <Button 
            variant={isActive("/admin/logs") ? "default" : "ghost"} 
            className="w-full justify-start gap-2"
          >
            <History className="h-4 w-4" />
            Logs do Sistema
          </Button>
        </Link>
        
        <Link to="/admin/settings">
          <Button 
            variant={isActive("/admin/settings") ? "default" : "ghost"} 
            className="w-full justify-start gap-2"
          >
            <Settings className="h-4 w-4" />
            Configurações
          </Button>
        </Link>
        
        <Separator className="my-2" />
        
        <Button 
          variant="ghost" 
          className="w-full justify-start gap-2 text-red-500 hover:text-red-700 hover:bg-red-50"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </Button>
      </div>
    </Sidebar>
  );
}
