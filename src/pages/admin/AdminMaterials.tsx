
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { addLogEntry } from "@/utils/projectLog";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { FileText, Plus, Trash, Edit, Link as LinkIcon, ExternalLink } from "lucide-react";
import { AdminMaterialsManager } from "@/components/admin/AdminMaterialsManager";

const AdminMaterials = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("list");

  useEffect(() => {
    // Atualiza o título da página
    document.title = "Gerenciar Materiais | MAR - Crie Valor";
    
    // Redirecionar se não estiver autenticado ou não for admin
    if (!isAuthenticated) {
      navigate('/');
    } else if (!isAdmin) {
      navigate('/dashboard');
    }

    // Registrar acesso à página
    if (user) {
      addLogEntry('navigation', 'Acesso à página de gerenciamento de materiais', {
        userId: user.id
      }, user.id);
    }
  }, [isAuthenticated, isAdmin, navigate, user]);

  if (!isAuthenticated || !isAdmin) {
    return null; // Será redirecionado no useEffect
  }

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <SidebarInset className="bg-gray-50">
          <DashboardHeader isAdmin={true} />
          
          <main className="container mx-auto p-6">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-2xl font-bold">Gerenciamento de Materiais</h1>
              <p className="text-muted-foreground">
                Adicione, edite e gerencie materiais disponíveis para os usuários.
              </p>
            </div>
            
            <Tabs defaultValue="list" value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-6">
                <TabsTrigger value="list">Lista de Materiais</TabsTrigger>
                <TabsTrigger value="add">Adicionar Material</TabsTrigger>
                <TabsTrigger value="stats">Estatísticas</TabsTrigger>
              </TabsList>
              
              <TabsContent value="list" className="space-y-6">
                <AdminMaterialsManager />
              </TabsContent>
              
              <TabsContent value="add">
                <Card>
                  <CardHeader>
                    <CardTitle>Adicionar Novo Material</CardTitle>
                    <CardDescription>
                      Cadastre um novo material para disponibilizar aos membros do programa MAR.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label htmlFor="title" className="font-medium">Título</label>
                        <Input id="title" placeholder="Título do material" />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="category" className="font-medium">Categoria</label>
                        <Select>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="estrategia">Estratégia</SelectItem>
                            <SelectItem value="conteudo">Conteúdo</SelectItem>
                            <SelectItem value="midias-sociais">Mídias Sociais</SelectItem>
                            <SelectItem value="vendas">Vendas</SelectItem>
                            <SelectItem value="marketing">Marketing</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="description" className="font-medium">Descrição</label>
                      <Textarea id="description" placeholder="Descreva o material..." rows={3} />
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="file_url" className="font-medium">URL do Material</label>
                      <div className="flex gap-2">
                        <Input id="file_url" placeholder="https://" className="flex-1" />
                        <Button variant="outline" size="icon" title="Testar link">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Insira o link para o material (Google Drive, Dropbox, etc)
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <label htmlFor="plan_level" className="font-medium">Nível de Acesso</label>
                      <Select defaultValue="todos">
                        <SelectTrigger>
                          <SelectValue placeholder="Nível de acesso" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="todos">Todos os usuários</SelectItem>
                          <SelectItem value="premium">Apenas Premium</SelectItem>
                          <SelectItem value="vip">Apenas VIP</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setActiveTab("list")}>Cancelar</Button>
                    <Button>Salvar Material</Button>
                  </CardFooter>
                </Card>
              </TabsContent>
              
              <TabsContent value="stats">
                <Card>
                  <CardHeader>
                    <CardTitle>Estatísticas de Acesso</CardTitle>
                    <CardDescription>
                      Acompanhe os acessos aos materiais disponibilizados.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-10">
                      <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">
                        Estatísticas em desenvolvimento
                      </h3>
                      <p className="text-muted-foreground max-w-md mx-auto">
                        Esta funcionalidade estará disponível em breve. Você poderá acompanhar
                        quais materiais são mais acessados e por quais usuários.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
          
          <SiteFooter />
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default AdminMaterials;
