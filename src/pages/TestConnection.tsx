
import React from 'react';
import SupabaseConnectionTest from '@/components/SupabaseConnectionTest';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useAuth } from '@/hooks/useAuth';

const TestConnectionPage = () => {
  const { isAdmin } = useAuth();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teste de Conexão</h1>
          <p className="mt-2 text-lg text-gray-600">
            Verifique se a conexão com o Supabase está funcionando corretamente.
          </p>
        </div>
        
        <SupabaseConnectionTest />
      </main>
      
      <SiteFooter />
    </div>
  );
};

export default TestConnectionPage;
