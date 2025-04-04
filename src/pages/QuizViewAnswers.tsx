
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { QuizViewAnswers } from "@/components/quiz/QuizViewAnswers";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooler } from "@/components/layout/SiteFooter";

const QuizViewAnswersPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .eq('role', 'admin')
          .single();
          
        if (!error && data) {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
      }
    };
    
    checkUserRole();
  }, [user]);

  useEffect(() => {
    // Atualiza o título da página
    document.title = "Minhas Respostas | MAR - Crie Valor";
    
    // Redirecionar se não estiver autenticado
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Será redirecionado no useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Minhas Respostas</h1>
          <p className="text-slate-600">Veja abaixo as respostas que você forneceu no questionário MAR.</p>
        </div>
        <QuizViewAnswers />
      </div>
      
      <SiteFooler />
    </div>
  );
};

export default QuizViewAnswersPage;
