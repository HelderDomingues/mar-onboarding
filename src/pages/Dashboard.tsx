
import React, { useState, useEffect } from "react";
import { UserDashboard } from "@/components/user/UserDashboard";
import { AdminDashboard } from "@/components/admin/AdminDashboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { QuizSubmission } from "@/types/quiz";

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
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchSubmission = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('quiz_submissions')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (!error && data) {
          setSubmission(data as QuizSubmission);
        }
      } catch (error) {
        console.error('Erro ao buscar questionário:', error);
      }
    };
    
    checkUserRole();
    fetchSubmission();
  }, [user]);
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen">
      {isAdmin ? (
        <AdminDashboard isAdmin={isAdmin} submission={submission} />
      ) : (
        <UserDashboard submission={submission} />
      )}
    </div>
  );
};

export default Dashboard;
