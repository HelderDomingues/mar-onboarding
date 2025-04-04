
import React, { useState, useEffect } from "react";
import { UserDashboard } from "@/components/user/UserDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAuth } from "@/hooks/useAuth";
import { GetStartedSection } from "@/components/onboarding/GetStartedSection";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { FileText, Phone, Mail } from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isFirstVisit, setIsFirstVisit] = useState(true);
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false);
  
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
    
    const checkFirstVisit = async () => {
      if (!user) return;
      
      try {
        // Verificando se o usuário já respondeu ao questionário
        const { data, error } = await supabase
          .from('quiz_submissions')
          .select('completed')
          .eq('user_id', user.id)
          .single();
          
        if (!error && data) {
          setHasCompletedQuiz(data.completed);
          setIsFirstVisit(false);
        }
      } catch (error) {
        console.error('Erro ao verificar primeiro acesso:', error);
      }
    };
    
    checkUserRole();
    checkFirstVisit();
  }, [user]);
  
  return (
    <div className="min-h-screen">
      {isAdmin ? (
        <AdminDashboard />
      ) : (
        <UserDashboard>
          {isFirstVisit && <GetStartedSection />}
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Meu Progresso</h2>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Questionário MAR</span>
                    <span className="text-sm font-medium">
                      {hasCompletedQuiz ? "Concluído" : "Pendente"}
                    </span>
                  </div>
                  <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full" 
                      style={{ width: hasCompletedQuiz ? '100%' : '0%' }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex flex-col space-y-2">
                  {hasCompletedQuiz ? (
                    <>
                      <Link to="/quiz/answers">
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="mr-2 h-4 w-4" />
                          Ver minhas respostas
                        </Button>
                      </Link>
                      <Link to="/quiz/diagnostic">
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="mr-2 h-4 w-4" />
                          Ver meu diagnóstico
                        </Button>
                      </Link>
                    </>
                  ) : (
                    <Link to="/quiz">
                      <Button className="w-full">
                        <FileText className="mr-2 h-4 w-4" />
                        Responder questionário
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </Card>
            
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Precisa de ajuda?</h2>
              <p className="text-gray-600 mb-4">
                Entre em contato com nossa equipe de suporte caso tenha dúvidas sobre o programa ou precise de assistência.
              </p>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="mailto:contato@crievalor.com.br">
                    <Mail className="mr-2 h-4 w-4" />
                    contato@crievalor.com.br
                  </a>
                </Button>
                <Button variant="outline" className="w-full justify-start" asChild>
                  <a href="tel:+5511912345678">
                    <Phone className="mr-2 h-4 w-4" />
                    (11) 91234-5678
                  </a>
                </Button>
              </div>
            </Card>
          </div>
        </UserDashboard>
      )}
    </div>
  );
};

export default Dashboard;
