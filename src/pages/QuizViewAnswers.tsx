import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { QuizViewAnswers } from "@/components/quiz/QuizViewAnswers";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
const QuizViewAnswersPage = () => {
  const {
    isAuthenticated,
    user,
    isAdmin
  } = useAuth();
  const navigate = useNavigate();
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
  return <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-slate-800">
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 text-slate-200">Minhas Respostas</h1>
          <p className="text-slate-100">Veja abaixo as respostas que você forneceu no questionário MAR.</p>
        </div>
        <QuizViewAnswers />
      </div>
      
      <SiteFooter />
    </div>;
};
export default QuizViewAnswersPage;