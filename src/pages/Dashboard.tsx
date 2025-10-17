import React, { useState, useEffect } from "react";
import { UserDashboard } from "@/components/user/UserDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { QuizSubmission } from "@/types/quiz";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";
import { SidebarProvider, useSidebar } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

const AdminDashboardLayout = ({ isAdmin, submission }: { isAdmin: boolean; submission: QuizSubmission | null }) => {
  const { toggleSidebar } = useSidebar();
  
  return (
    <div className="min-h-screen w-full md:flex">
      <AdminSidebar />
      
      <div className="flex-1 flex flex-col w-full">
        {/* Header mobile com trigger */}
        <header className="md:hidden h-14 flex items-center border-b bg-background px-4 sticky top-0 z-30">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleSidebar}
            className="mr-2"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-sm font-semibold">Sistema MAR</h1>
        </header>

        {/* Conteúdo principal */}
        <main className="flex-1 bg-gradient-to-b from-blue-50 to-white p-4 md:p-8 overflow-auto overflow-x-hidden">
          <AdminDashboard isAdmin={isAdmin} submission={submission} />
        </main>
      </div>
    </div>
  );
};

const Dashboard = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [submission, setSubmission] = useState<QuizSubmission | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) {
        setIsLoading(false);
        return;
      }
      try {
        setIsLoading(true);
        addLogEntry("info", "Verificando permissões de usuário no dashboard", {
          userId: user.id,
        });

        const { data: rolesData, error } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id);

        if (error) {
          logger.error("Erro ao buscar roles do usuário", {
            tag: "Dashboard",
            error,
          });
        }

        if (rolesData && rolesData.some((r) => r.role === "admin")) {
          setIsAdmin(true);
          logger.info("Usuário identificado como administrador", {
            tag: "Dashboard",
            userId: user.id,
          });
        }
      } catch (error) {
        console.error("Erro ao verificar permissões:", error);
        logger.error("Erro ao verificar permissões de usuário", {
          tag: "Dashboard",
          error,
        });
      } finally {
        setIsLoading(false);
      }
    };

    const fetchSubmission = async () => {
      if (!user) return;
      try {
        addLogEntry("info", "Buscando questionário do usuário", {
          userId: user.id,
        });
        const { data, error } = await supabase
          .from("quiz_submissions")
          .select("*")
          .eq("user_id", user.id)
          .single();

        if (!error && data) {
          setSubmission(data as QuizSubmission);
          logger.info("Questionário do usuário carregado com sucesso", {
            tag: "Dashboard",
            userId: user.id,
          });
        }
      } catch (error) {
        console.error("Erro ao buscar questionário:", error);
        logger.error("Erro ao buscar questionário do usuário", {
          tag: "Dashboard",
          error,
        });
      }
    };

    checkUserRole();
    fetchSubmission();
  }, [user]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (isAdmin) {
    return (
      <SidebarProvider>
        <AdminDashboardLayout isAdmin={isAdmin} submission={submission} />
      </SidebarProvider>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={false} />

      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-200">
        <UserDashboard submission={submission} />
      </div>

      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>
            © {new Date().getFullYear()} Crie Valor. Todos os direitos
            reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
