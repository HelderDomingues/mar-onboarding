
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  Upload, 
  FileText, 
  Video, 
  Music, 
  FilePresentation, 
  AlertTriangle 
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Material } from "@/types/material";
import { OnboardingContent } from "@/types/onboarding";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function AdminMaterialsManager() {
  // Estado para materiais e formulário
  const [materials, setMaterials] = useState<Material[]>([]);
  const [onboardingContent, setOnboardingContent] = useState<OnboardingContent | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("documents");
  const { toast } = useToast();
  
  // Estados para novo material
  const [newMaterial, setNewMaterial] = useState<{
    title: string;
    description: string;
    category: string;
    file_url: string;
    type: Material["type"];
    is_onboarding: boolean;
    plan_level: string;
  }>({
    title: "",
    description: "",
    category: "geral",
    file_url: "",
    type: "document",
    is_onboarding: false,
    plan_level: "basic"
  });
  
  const [newOnboarding, setNewOnboarding] = useState({
    title: "",
    content: "",
    video_url: "",
    is_active: true
  });
  
  // Estados para edição
  const [editingMaterial, setEditingMaterial] = useState<Material | null>(null);
  const [editingOnboarding, setEditingOnboarding] = useState<OnboardingContent | null>(null);
  
  // Carrega os materiais do Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true);
        
        // Carregar materiais
        const { data: materialsData, error: materialsError } = await supabase
          .from("materials")
          .select("*")
          .order("created_at", { ascending: false });
          
        if (materialsError) {
          throw materialsError;
        }
        
        setMaterials(materialsData as Material[]);
        
        // Carregar conteúdo de onboarding
        const { data: onboardingData, error: onboardingError } = await supabase
          .from("onboarding_content")
          .select("*")
          .eq("is_active", true)
          .single();
          
        if (onboardingError) {
          if (onboardingError.code !== 'PGRST116') { // No rows returned
            console.error("Erro ao carregar onboarding:", onboardingError);
          }
        } else {
          setOnboardingContent(onboardingData as OnboardingContent);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar materiais",
          description: "Não foi possível carregar a lista de materiais."
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, [toast]);
  
  // Função para adicionar novo material
  const handleAddMaterial = async () => {
    try {
      const { title, description, category, file_url, plan_level, type } = newMaterial;
      
      if (!title || !description || !file_url) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios."
        });
        return;
      }
      
      const { data, error } = await supabase
        .from("materials")
        .insert({
          title,
          description,
          category,
          file_url,
          plan_level,
          type
        })
        .select();
        
      if (error) throw error;
      
      setMaterials([data[0] as Material, ...materials]);
      
      // Resetar formulário
      setNewMaterial({
        title: "",
        description: "",
        category: "geral",
        file_url: "",
        type: "document",
        is_onboarding: false,
        plan_level: "basic"
      });
      
      toast({
        title: "Material adicionado",
        description: "O material foi adicionado com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao adicionar material:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar material",
        description: error.message || "Não foi possível adicionar o material."
      });
    }
  };
  
  // Função para atualizar material
  const handleUpdateMaterial = async () => {
    if (!editingMaterial) return;
    
    try {
      const { id, title, description, category, file_url, plan_level, type } = editingMaterial;
      
      if (!title || !description || !file_url) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios."
        });
        return;
      }
      
      const { error } = await supabase
        .from("materials")
        .update({
          title,
          description,
          category,
          file_url,
          plan_level,
          type,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
        
      if (error) throw error;
      
      // Atualizar a lista local
      setMaterials(materials.map(m => m.id === id ? editingMaterial : m));
      setEditingMaterial(null);
      
      toast({
        title: "Material atualizado",
        description: "O material foi atualizado com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao atualizar material:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar material",
        description: error.message || "Não foi possível atualizar o material."
      });
    }
  };
  
  // Função para excluir material
  const handleDeleteMaterial = async (id: string) => {
    try {
      const { error } = await supabase
        .from("materials")
        .delete()
        .eq("id", id);
        
      if (error) throw error;
      
      // Remover da lista local
      setMaterials(materials.filter(m => m.id !== id));
      
      toast({
        title: "Material excluído",
        description: "O material foi excluído com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao excluir material:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir material",
        description: error.message || "Não foi possível excluir o material."
      });
    }
  };
  
  // Funções para o conteúdo de onboarding
  const handleSaveOnboarding = async () => {
    try {
      const { title, content, video_url, is_active } = newOnboarding;
      
      if (!title || !content) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios."
        });
        return;
      }
      
      const { data, error } = await supabase
        .from("onboarding_content")
        .insert({
          title,
          content,
          video_url,
          is_active
        })
        .select();
        
      if (error) throw error;
      
      setOnboardingContent(data[0] as OnboardingContent);
      
      // Resetar formulário
      setNewOnboarding({
        title: "",
        content: "",
        video_url: "",
        is_active: true
      });
      
      toast({
        title: "Conteúdo de onboarding salvo",
        description: "O conteúdo de onboarding foi salvo com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao salvar onboarding:", error);
      toast({
        variant: "destructive",
        title: "Erro ao salvar conteúdo",
        description: error.message || "Não foi possível salvar o conteúdo de onboarding."
      });
    }
  };
  
  const handleUpdateOnboarding = async () => {
    if (!editingOnboarding) return;
    
    try {
      const { id, title, content, video_url, is_active } = editingOnboarding;
      
      if (!title || !content) {
        toast({
          variant: "destructive",
          title: "Campos obrigatórios",
          description: "Preencha todos os campos obrigatórios."
        });
        return;
      }
      
      const { error } = await supabase
        .from("onboarding_content")
        .update({
          title,
          content,
          video_url,
          is_active,
          updated_at: new Date().toISOString()
        })
        .eq("id", id);
        
      if (error) throw error;
      
      setOnboardingContent(editingOnboarding);
      setEditingOnboarding(null);
      
      toast({
        title: "Conteúdo atualizado",
        description: "O conteúdo de onboarding foi atualizado com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao atualizar onboarding:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar conteúdo",
        description: error.message || "Não foi possível atualizar o conteúdo de onboarding."
      });
    }
  };
  
  // Filtrar materiais por tipo
  const filteredMaterials = materials.filter(m => {
    switch (activeTab) {
      case "documents":
        return m.type === "document";
      case "videos":
        return m.type === "video";
      case "audio":
        return m.type === "audio";
      case "presentations":
        return m.type === "presentation";
      default:
        return true;
    }
  });

  // Ícones para os tipos de materiais
  const getTypeIcon = (type: Material["type"]) => {
    switch (type) {
      case "document":
        return <FileText className="h-4 w-4" />;
      case "video":
        return <Video className="h-4 w-4" />;
      case "audio":
        return <Music className="h-4 w-4" />;
      case "presentation":
        return <FilePresentation className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Materiais</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="documents">Documentos</TabsTrigger>
              <TabsTrigger value="videos">Vídeos</TabsTrigger>
              <TabsTrigger value="audio">Áudio</TabsTrigger>
              <TabsTrigger value="presentations">Apresentações</TabsTrigger>
              <TabsTrigger value="onboarding">Onboarding</TabsTrigger>
            </TabsList>
            
            <TabsContent value="onboarding">
              <Card>
                <CardHeader>
                  <CardTitle>Conteúdo de Onboarding</CardTitle>
                </CardHeader>
                <CardContent>
                  {onboardingContent ? (
                    <div>
                      <div className="space-y-4 mb-6">
                        <div>
                          <h3 className="text-lg font-semibold">{onboardingContent.title}</h3>
                          <p className="text-gray-500 text-sm">
                            Última atualização: {new Date(onboardingContent.updated_at).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                        
                        <div className="whitespace-pre-wrap bg-gray-50 p-4 rounded-md border">
                          {onboardingContent.content}
                        </div>
                        
                        {onboardingContent.video_url && (
                          <div>
                            <h4 className="font-medium mb-2">Vídeo:</h4>
                            <div className="aspect-video bg-gray-100 rounded-md flex items-center justify-center">
                              <iframe 
                                src={onboardingContent.video_url} 
                                className="w-full h-full rounded-md"
                                title="Vídeo de Onboarding"
                                allowFullScreen
                              ></iframe>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <div className="flex gap-2">
                        <Button 
                          variant="outline"
                          onClick={() => setEditingOnboarding(onboardingContent)}
                        >
                          <Pencil className="h-4 w-4 mr-2" /> Editar
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Alert className="mb-4">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription>
                          Nenhum conteúdo de onboarding ativo encontrado. Crie um novo conteúdo abaixo.
                        </AlertDescription>
                      </Alert>
                      
                      <div className="space-y-4">
                        <div>
                          <Label htmlFor="title">Título</Label>
                          <Input 
                            id="title" 
                            value={newOnboarding.title} 
                            onChange={e => setNewOnboarding({...newOnboarding, title: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="content">Conteúdo</Label>
                          <Textarea 
                            id="content"
                            rows={6}
                            value={newOnboarding.content}
                            onChange={e => setNewOnboarding({...newOnboarding, content: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="video_url">URL do Vídeo (opcional)</Label>
                          <Input 
                            id="video_url" 
                            value={newOnboarding.video_url} 
                            onChange={e => setNewOnboarding({...newOnboarding, video_url: e.target.value})}
                            placeholder="https://www.youtube.com/embed/..."
                          />
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <Switch 
                            checked={newOnboarding.is_active}
                            onCheckedChange={checked => setNewOnboarding({...newOnboarding, is_active: checked})}
                          />
                          <Label>Ativo</Label>
                        </div>
                        
                        <Button onClick={handleSaveOnboarding}>
                          Salvar Conteúdo
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value={activeTab} className={activeTab !== "onboarding" ? "block" : "hidden"}>
              <div className="flex justify-end mb-4">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" /> Adicionar Material
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Adicionar Novo Material</DialogTitle>
                    </DialogHeader>
                    
                    <div className="space-y-4 py-4">
                      <div className="grid grid-cols-1 gap-4">
                        <div>
                          <Label htmlFor="title">Título</Label>
                          <Input 
                            id="title" 
                            value={newMaterial.title} 
                            onChange={e => setNewMaterial({...newMaterial, title: e.target.value})}
                          />
                        </div>
                        
                        <div>
                          <Label htmlFor="description">Descrição</Label>
                          <Textarea 
                            id="description"
                            value={newMaterial.description}
                            onChange={e => setNewMaterial({...newMaterial, description: e.target.value})}
                          />
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="type">Tipo</Label>
                            <Select 
                              value={newMaterial.type} 
                              onValueChange={(value: Material["type"]) => 
                                setNewMaterial({...newMaterial, type: value})
                              }
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="document">Documento</SelectItem>
                                <SelectItem value="video">Vídeo</SelectItem>
                                <SelectItem value="audio">Áudio</SelectItem>
                                <SelectItem value="presentation">Apresentação</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div>
                            <Label htmlFor="category">Categoria</Label>
                            <Select 
                              value={newMaterial.category} 
                              onValueChange={value => setNewMaterial({...newMaterial, category: value})}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="geral">Geral</SelectItem>
                                <SelectItem value="marketing">Marketing</SelectItem>
                                <SelectItem value="vendas">Vendas</SelectItem>
                                <SelectItem value="financeiro">Financeiro</SelectItem>
                                <SelectItem value="operacional">Operacional</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        
                        <div>
                          <Label htmlFor="plan_level">Nível de Plano</Label>
                          <Select 
                            value={newMaterial.plan_level} 
                            onValueChange={value => setNewMaterial({...newMaterial, plan_level: value})}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="basic">Básico</SelectItem>
                              <SelectItem value="premium">Premium</SelectItem>
                              <SelectItem value="enterprise">Enterprise</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label htmlFor="file_url">URL do Arquivo</Label>
                          <Input 
                            id="file_url" 
                            value={newMaterial.file_url} 
                            onChange={e => setNewMaterial({...newMaterial, file_url: e.target.value})}
                            placeholder="https://..."
                          />
                        </div>
                      </div>
                    </div>
                    
                    <DialogFooter>
                      <DialogClose asChild>
                        <Button variant="outline">Cancelar</Button>
                      </DialogClose>
                      <Button onClick={handleAddMaterial}>Adicionar</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
              
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="h-10 w-10 animate-spin rounded-full border-2 border-gray-300 border-t-primary"></div>
                </div>
              ) : filteredMaterials.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Título</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Plano</TableHead>
                      <TableHead>Acessos</TableHead>
                      <TableHead className="text-right">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMaterials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">{material.title}</TableCell>
                        <TableCell>{material.category}</TableCell>
                        <TableCell className="flex items-center gap-1">
                          {getTypeIcon(material.type)}
                          <span>{material.type}</span>
                        </TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            material.plan_level === "basic" ? "bg-green-100 text-green-800" :
                            material.plan_level === "premium" ? "bg-blue-100 text-blue-800" :
                            "bg-purple-100 text-purple-800"
                          }`}>
                            {material.plan_level}
                          </span>
                        </TableCell>
                        <TableCell>{material.access_count || 0}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Pencil className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Editar Material</DialogTitle>
                                </DialogHeader>
                                
                                <div className="space-y-4 py-4">
                                  {editingMaterial && (
                                    <div className="grid grid-cols-1 gap-4">
                                      <div>
                                        <Label htmlFor="edit-title">Título</Label>
                                        <Input 
                                          id="edit-title" 
                                          value={editingMaterial.title} 
                                          onChange={e => setEditingMaterial({...editingMaterial, title: e.target.value})}
                                        />
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="edit-description">Descrição</Label>
                                        <Textarea 
                                          id="edit-description"
                                          value={editingMaterial.description}
                                          onChange={e => setEditingMaterial({...editingMaterial, description: e.target.value})}
                                        />
                                      </div>
                                      
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <Label htmlFor="edit-type">Tipo</Label>
                                          <Select 
                                            value={editingMaterial.type} 
                                            onValueChange={(value: Material["type"]) => 
                                              setEditingMaterial({...editingMaterial, type: value})
                                            }
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="document">Documento</SelectItem>
                                              <SelectItem value="video">Vídeo</SelectItem>
                                              <SelectItem value="audio">Áudio</SelectItem>
                                              <SelectItem value="presentation">Apresentação</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                        
                                        <div>
                                          <Label htmlFor="edit-category">Categoria</Label>
                                          <Select 
                                            value={editingMaterial.category} 
                                            onValueChange={value => setEditingMaterial({...editingMaterial, category: value})}
                                          >
                                            <SelectTrigger>
                                              <SelectValue placeholder="Selecione" />
                                            </SelectTrigger>
                                            <SelectContent>
                                              <SelectItem value="geral">Geral</SelectItem>
                                              <SelectItem value="marketing">Marketing</SelectItem>
                                              <SelectItem value="vendas">Vendas</SelectItem>
                                              <SelectItem value="financeiro">Financeiro</SelectItem>
                                              <SelectItem value="operacional">Operacional</SelectItem>
                                            </SelectContent>
                                          </Select>
                                        </div>
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="edit-plan_level">Nível de Plano</Label>
                                        <Select 
                                          value={editingMaterial.plan_level} 
                                          onValueChange={value => setEditingMaterial({...editingMaterial, plan_level: value})}
                                        >
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecione" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="basic">Básico</SelectItem>
                                            <SelectItem value="premium">Premium</SelectItem>
                                            <SelectItem value="enterprise">Enterprise</SelectItem>
                                          </SelectContent>
                                        </Select>
                                      </div>
                                      
                                      <div>
                                        <Label htmlFor="edit-file_url">URL do Arquivo</Label>
                                        <Input 
                                          id="edit-file_url" 
                                          value={editingMaterial.file_url} 
                                          onChange={e => setEditingMaterial({...editingMaterial, file_url: e.target.value})}
                                          placeholder="https://..."
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                                
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancelar</Button>
                                  </DialogClose>
                                  <Button onClick={handleUpdateMaterial}>Salvar</Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                            
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="destructive" size="icon">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Confirmar Exclusão</DialogTitle>
                                </DialogHeader>
                                <p className="py-4">
                                  Tem certeza que deseja excluir o material "{material.title}"? Esta ação não pode ser desfeita.
                                </p>
                                <DialogFooter>
                                  <DialogClose asChild>
                                    <Button variant="outline">Cancelar</Button>
                                  </DialogClose>
                                  <Button 
                                    variant="destructive" 
                                    onClick={() => handleDeleteMaterial(material.id)}
                                  >
                                    Excluir
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="py-8 text-center text-muted-foreground">
                  Nenhum material encontrado nesta categoria.
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Dialog para editar conteúdo de onboarding */}
      <Dialog open={!!editingOnboarding} onOpenChange={(open) => !open && setEditingOnboarding(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Conteúdo de Onboarding</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            {editingOnboarding && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-title-onboarding">Título</Label>
                  <Input 
                    id="edit-title-onboarding" 
                    value={editingOnboarding.title} 
                    onChange={e => setEditingOnboarding({...editingOnboarding, title: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-content-onboarding">Conteúdo</Label>
                  <Textarea 
                    id="edit-content-onboarding"
                    rows={6}
                    value={editingOnboarding.content}
                    onChange={e => setEditingOnboarding({...editingOnboarding, content: e.target.value})}
                  />
                </div>
                
                <div>
                  <Label htmlFor="edit-video_url-onboarding">URL do Vídeo (opcional)</Label>
                  <Input 
                    id="edit-video_url-onboarding" 
                    value={editingOnboarding.video_url || ''} 
                    onChange={e => setEditingOnboarding({...editingOnboarding, video_url: e.target.value})}
                    placeholder="https://www.youtube.com/embed/..."
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Switch 
                    checked={editingOnboarding.is_active}
                    onCheckedChange={checked => setEditingOnboarding({...editingOnboarding, is_active: checked})}
                  />
                  <Label>Ativo</Label>
                </div>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingOnboarding(null)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdateOnboarding}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

