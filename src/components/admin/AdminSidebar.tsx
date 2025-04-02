
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Users,
  FileText,
  Settings,
  Database,
  BarChart3,
  HelpCircle,
  LogOut,
  CheckSquare,
  Award,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/use-toast";
import { logger } from "@/utils/logger";

export function AdminSidebar() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeSection, setActiveSection] = useState<string>("dashboard");

  const handleLogout = async () => {
    try {
      logger.info('Administrador solicitou logout', {
        tag: 'AdminSidebar'
      });
      await logout();
      navigate("/");
    } catch (error) {
      toast({
        title: "Erro ao fazer logout",
        description: "Ocorreu um erro ao tentar fazer logout.",
        variant: "destructive",
      });
    }
  };

  const handleNavigation = (section: string) => {
    setActiveSection(section);
    
    if (section === "dashboard") {
      navigate("/dashboard");
    } else if (section === "users") {
      navigate("/admin/users");
    } else if (section === "quiz") {
      navigate("/quiz?admin=true");
    } else if (section === "quizReview") {
      navigate("/quiz/review?admin=true");
    } else if (section === "quizSuccess") {
      navigate("/quiz/success?admin=true");
    } else if (section === "data") {
      navigate("/admin/data");
    } else if (section === "reports") {
      navigate("/admin/reports");
    } else if (section === "settings") {
      navigate("/admin/settings");
    } else if (section === "help") {
      navigate("/admin/help");
    }
  };

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border px-5 py-4 flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <img 
            src="/lovable-uploads/98e55723-efb7-42e8-bc10-a429fdf04ffb.png" 
            alt="MAR - Mapa para Alto Rendimento" 
            className="h-6" 
          />
          <SidebarTrigger />
        </div>
        <div className="py-1">
          <p className="text-xs text-sidebar-foreground/60">
            Painel Administrativo
          </p>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navegação</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => handleNavigation("dashboard")}
                  isActive={activeSection === "dashboard"}
                  tooltip="Dashboard"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => handleNavigation("users")}
                  isActive={activeSection === "users"}
                  tooltip="Usuários"
                >
                  <Users className="h-4 w-4" />
                  <span>Usuários</span>
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
                <SidebarMenuButton 
                  onClick={() => handleNavigation("quiz")}
                  isActive={activeSection === "quiz"}
                  tooltip="Questionário MAR"
                >
                  <FileText className="h-4 w-4" />
                  <span>Questionário MAR</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => handleNavigation("quizReview")}
                  isActive={activeSection === "quizReview"}
                  tooltip="Validação"
                >
                  <CheckSquare className="h-4 w-4" />
                  <span>Validação</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => handleNavigation("quizSuccess")}
                  isActive={activeSection === "quizSuccess"}
                  tooltip="Sucesso"
                >
                  <Award className="h-4 w-4" />
                  <span>Sucesso</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        
        <SidebarGroup>
          <SidebarGroupLabel>Análise</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => handleNavigation("data")}
                  isActive={activeSection === "data"}
                  tooltip="Dados"
                >
                  <Database className="h-4 w-4" />
                  <span>Dados</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => handleNavigation("reports")}
                  isActive={activeSection === "reports"}
                  tooltip="Relatórios"
                >
                  <BarChart3 className="h-4 w-4" />
                  <span>Relatórios</span>
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
                <SidebarMenuButton 
                  onClick={() => handleNavigation("settings")}
                  isActive={activeSection === "settings"}
                  tooltip="Configurações"
                >
                  <Settings className="h-4 w-4" />
                  <span>Configurações</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              
              <SidebarMenuItem>
                <SidebarMenuButton 
                  onClick={() => handleNavigation("help")}
                  isActive={activeSection === "help"}
                  tooltip="Ajuda"
                >
                  <HelpCircle className="h-4 w-4" />
                  <span>Ajuda</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter>
        <Button
          variant="outline"
          className="w-full justify-start"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
