
import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ServiceRoleConfig from '@/components/admin/ServiceRoleConfig';
import { WebhookConfig } from '@/components/admin/WebhookConfig';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { SiteFooter } from '@/components/layout/SiteFooter';
import { useAuth } from '@/hooks/useAuth';
import { Separator } from '@/components/ui/separator';

export default function SettingsPage() {
  const { isAdmin } = useAuth();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <main className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
          <p className="mt-2 text-gray-500">
            Gerencie as configurações do Sistema MAR
          </p>
          <Separator className="my-6" />
        </div>
        
        <Tabs defaultValue="chaves" className="w-full">
          <TabsList className="mb-8">
            <TabsTrigger value="chaves">Chaves de API</TabsTrigger>
            <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
            <TabsTrigger value="backup">Backups</TabsTrigger>
          </TabsList>
          
          <TabsContent value="chaves" className="space-y-4">
            <div className="grid gap-6">
              <ServiceRoleConfig />
            </div>
          </TabsContent>
          
          <TabsContent value="webhooks" className="space-y-4">
            <div className="grid gap-6">
              <WebhookConfig />
            </div>
          </TabsContent>
          
          <TabsContent value="backup" className="space-y-4">
            <div className="grid gap-6">
              <div className="p-6 bg-white rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Configurações de Backup</h2>
                <p className="text-gray-500 mb-4">
                  Configure o intervalo e as configurações de backup automático do sistema
                </p>
                <p className="text-blue-500 italic">
                  Funcionalidade em desenvolvimento. Disponível em breve.
                </p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
      
      <SiteFooter />
    </div>
  );
}
