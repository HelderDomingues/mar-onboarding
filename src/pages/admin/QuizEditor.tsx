
import React, { useState } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { FileEdit, PlusCircle, FolderPlus, Edit, AlertCircle } from "lucide-react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

const QuizEditor = () => {
  const [selectedTab, setSelectedTab] = useState("modules");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen bg-background font-sans">
        <AdminSidebar />
        
        <div className="flex-1">
          <div className="container mx-auto py-6 space-y-6">
            <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-2xl font-bold">Editor do Questionário</h1>
                <p className="text-muted-foreground">
                  Gerencie os módulos e questões do programa MAR
                </p>
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" className="flex items-center gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Novo Módulo
                </Button>
                <Button className="flex items-center gap-2">
                  <FileEdit className="h-4 w-4" />
                  Nova Questão
                </Button>
              </div>
            </div>
            
            <Alert variant="warning">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Funcionalidade em desenvolvimento</AlertTitle>
              <AlertDescription>
                O editor do questionário estará disponível em breve. Esta página é um preview da interface.
              </AlertDescription>
            </Alert>
            
            <Tabs defaultValue="modules" value={selectedTab} onValueChange={setSelectedTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="modules">Módulos</TabsTrigger>
                <TabsTrigger value="questions">Questões</TabsTrigger>
                <TabsTrigger value="options">Opções de Resposta</TabsTrigger>
              </TabsList>
              
              <TabsContent value="modules">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FolderPlus className="h-5 w-5 text-primary" />
                      Módulos do Questionário
                    </CardTitle>
                    <CardDescription>
                      Gerencie os módulos do questionário MAR
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md p-6 text-center">
                      <p className="text-muted-foreground mb-4">
                        Aqui serão exibidos os módulos do questionário para edição.
                      </p>
                      <Button variant="outline">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Adicionar Módulo
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="questions">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileEdit className="h-5 w-5 text-primary" />
                      Perguntas
                    </CardTitle>
                    <CardDescription>
                      Gerencie as perguntas do questionário
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md p-6 text-center">
                      <p className="text-muted-foreground mb-4">
                        Aqui serão exibidas as perguntas do questionário para edição.
                      </p>
                      <Button variant="outline">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Adicionar Pergunta
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="options">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Edit className="h-5 w-5 text-primary" />
                      Opções de Resposta
                    </CardTitle>
                    <CardDescription>
                      Gerencie as opções de resposta para perguntas de múltipla escolha
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="border rounded-md p-6 text-center">
                      <p className="text-muted-foreground mb-4">
                        Aqui serão exibidas as opções de resposta para edição.
                      </p>
                      <Button variant="outline">
                        <PlusCircle className="h-4 w-4 mr-2" />
                        Adicionar Opção
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default QuizEditor;
