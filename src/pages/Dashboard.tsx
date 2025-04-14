
import React, { useState, useEffect } from "react";
import { UserDashboard } from "@/components/user/UserDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { QuizSubmission } from "@/types/quiz";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";

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
        addLogEntry('info', 'Verificando permissões de usuário no dashboard', { userId: user.id });
        
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
          
        if (!error && data) {
          setIsAdmin(true);
          logger.info('Usuário identificado como administrador', {
            tag: 'Dashboard',
            userId: user.id
          });
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
        logger.error('Erro ao verificar permissões de usuário', {
          tag: 'Dashboard',
          error
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchSubmission = async () => {
      if (!user) return;
      
      try {
        addLogEntry('info', 'Buscando questionário do usuário', { userId: user.id });
        
        const { data, error } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (!error && data) {
          setSubmission(data as QuizSubmission);
          logger.info('Questionário do usuário carregado com sucesso', {
            tag: 'Dashboard',
            userId: user.id
          });
        }
      } catch (error) {
        console.error('Erro ao buscar questionário:', error);
        logger.error('Erro ao buscar questionário do usuário', {
          tag: 'Dashboard',
          error
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
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {isAdmin ? (
          <AdminDashboard isAdmin={isAdmin} submission={submission} />
        ) : (
          <UserDashboard submission={submission} />
        )}
      </div>
      
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} Crie Valor. Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Dashboard;
