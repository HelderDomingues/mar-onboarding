
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SystemConfigManager } from "@/components/admin/SystemConfigManager";
import { AdminAuditLog } from "@/components/admin/AdminAuditLog";
import { Settings as SettingsIcon, Shield, Cog } from "lucide-react";

const Settings = () => {
  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <SettingsIcon className="h-6 w-6" />
        <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
        <Badge variant="secondary">Admin</Badge>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="flex items-center gap-2">
            <Cog className="h-4 w-4" />
            Geral
          </TabsTrigger>
          <TabsTrigger value="webhook" className="flex items-center gap-2">
            <SettingsIcon className="h-4 w-4" />
            Webhook
          </TabsTrigger>
          <TabsTrigger value="audit" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Auditoria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status do Sistema</CardTitle>
              <CardDescription>
                Informações gerais sobre o estado atual do sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-green-600">Online</div>
                  <div className="text-sm text-muted-foreground">Status do Sistema</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">v2.0.0</div>
                  <div className="text-sm text-muted-foreground">Versão</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold">Seguro</div>
                  <div className="text-sm text-muted-foreground">Status de Segurança</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhook">
          <SystemConfigManager />
        </TabsContent>

        <TabsContent value="audit">
          <AdminAuditLog />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
