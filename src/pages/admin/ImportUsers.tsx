
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { ImportUsers as ImportUsersComponent } from "@/components/admin/ImportUsers";

const ImportUsersPage = () => {
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
        } else {
          navigate("/dashboard");
        }
      } catch (error) {
        console.error('Erro ao verificar papel do usuário:', error);
        navigate("/dashboard");
      }
    };
    
    if (isAuthenticated) {
      checkUserRole();
    } else if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);

  if (!isAuthenticated || !isAdmin) {
    return null; // Será redirecionado no useEffect
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <SidebarInset className="p-6 bg-gray-50">
          <div className="container max-w-5xl mx-auto">
            <ImportUsersComponent />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default ImportUsersPage;
