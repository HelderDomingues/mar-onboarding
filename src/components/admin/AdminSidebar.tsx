import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Sidebar, SidebarNav, SidebarSection, SidebarLink } from "@/components/ui/sidebar";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  BarChart3, 
  BookOpen,
  FileEdit,
  BookCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export function AdminSidebar() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <Sidebar>
      <SidebarSection>
        <div className="flex items-center gap-2 px-4 py-2">
          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
            CV
          </div>
          <div>
            <h2 className="text-lg font-bold">Crie Valor</h2>
            <p className="text-xs text-muted-foreground">Painel Administrativo</p>
          </div>
        </div>
      </SidebarSection>
      
      <SidebarSection>
        <SidebarNav>
          <SidebarLink to="/admin" icon={<LayoutDashboard size={18} />} active={pathname === "/admin"}>
            Dashboard
          </SidebarLink>
          
          <SidebarLink to="/admin/users" icon={<Users size={18} />} active={pathname === "/admin/users"}>
            Usuários
          </SidebarLink>
          
          <SidebarLink to="/admin/quiz" icon={<FileText size={18} />} active={pathname.startsWith("/admin/quiz")}>
            Questionários
          </SidebarLink>
          
          <SidebarLink to="/admin/quiz-editor" icon={<FileEdit size={18} />} active={pathname === "/admin/quiz-editor"}>
            Editor de Questionário
          </SidebarLink>
          
          <SidebarLink to="/admin/seed-quiz" icon={<BookCheck size={18} />}>
            Importar Questionário
          </SidebarLink>
          
          <SidebarLink to="/admin/reports" icon={<BarChart3 size={18} />} active={pathname === "/admin/reports"}>
            Relatórios e Análises
          </SidebarLink>
          
          <SidebarLink to="/admin/materials" icon={<BookOpen size={18} />} active={pathname === "/admin/materials"}>
            Materiais
          </SidebarLink>
          
          <SidebarLink to="/admin/settings" icon={<Settings size={18} />} active={pathname === "/admin/settings"}>
            Configurações
          </SidebarLink>
        </SidebarNav>
      </SidebarSection>
      
      <SidebarSection className="mt-auto">
        <div className="px-3 py-2">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              {user?.email?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">Administrador</p>
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full justify-start" 
            size="sm"
            onClick={handleSignOut}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sair
          </Button>
        </div>
      </SidebarSection>
    </Sidebar>
  );
}
