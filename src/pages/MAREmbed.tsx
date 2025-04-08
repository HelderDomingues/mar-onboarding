
import React from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";

const MAREmbed = () => {
  const { isAuthenticated } = useAuth();

  // Redirecionamento se não estiver autenticado
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      
      <main className="flex-1 flex flex-col">
        <iframe 
          src="https://www.crievalor.com.br/mapa-para-alto-rendimento"
          className="w-full flex-1 border-0"
          title="Questionário MAR"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        />
      </main>
      
      <SiteFooter />
    </div>
  );
};

export default MAREmbed;
