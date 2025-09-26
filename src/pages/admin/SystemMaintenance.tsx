import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { SystemMaintenancePanel } from '@/components/admin/SystemMaintenancePanel';

const SystemMaintenance: React.FC = () => {
  const { isAdmin } = useAuth();

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <main className="container flex-grow mx-auto p-4">
        <div className="max-w-6xl mx-auto">
          <SystemMaintenancePanel isAdmin={isAdmin} />
        </div>
      </main>
      
      <SiteFooter />
    </div>
  );
};

export default SystemMaintenance;