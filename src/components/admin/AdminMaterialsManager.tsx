
import React, { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { MoreHorizontal, Plus, Pencil, Trash2, UploadCloud, FileText, Video, Link2, ExternalLink } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Json } from "@/integrations/supabase/types";

interface Material {
  id: string;
  title: string;
  description: string;
  file_url: string;
  thumbnail_url: string | null;
  category: string;
  created_at: string;
  access_count: number;
  plan_level: string;
  type: 'document' | 'video' | 'link' | 'other';
  is_onboarding?: boolean;
}

interface OnboardingContent {
  id: string;
  title: string;
  content: string;
  video_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export const AdminMaterialsManager = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [onboardingContent, setOnboardingContent] = useState<OnboardingContent | null>(null);
  const [loading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploadLoading, setUploadLoading] = useState(false);
  const [currentMaterial, setCurrentMaterial] = useState<Partial<Material> | null>(null);
  const [onboardingForm, setOnboardingForm] = useState({
    title: '',
    content: '',
    video_url: '',
  });
  
  // Formulário para adicionar/editar material
  const [materialForm, setMaterialForm] = useState({
    title: '',
    description: '',
    category: 'documento',
    file_url: '',
    type: 'document' as Material['type'],
    is_onboarding: false,
    plan_level: 'basic',
  });
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [thumbnailToUpload, setThumbnailToUpload] = useState<File | null>(null);
  
  useEffect(() => {
    fetchData();
  }, []);
  
  const fetchData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar materiais
      const { data: materialsData, error: materialsError } = await supabase
        .from('materials')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (materialsError) throw materialsError;
      
      // Precisamos garantir que todos os registros tenham o campo 'type'
      const materialsWithType = (materialsData || []).map(material => ({
        ...material,
        type: material.type || 'document'
      })) as Material[];
      
      setMaterials(materialsWithType);
      
      try {
        // Buscar conteúdo de onboarding
        const { data: onboardingData, error: onboardingError } = await supabase
          .from('onboarding_content')
          .select('*')
          .eq('is_active', true)
          .single();
        
        if (!onboardingError && onboardingData) {
          setOnboardingContent(onboardingData as OnboardingContent);
          setOnboardingForm({
            title: onboardingData.title,
            content: onboardingData.content,
            video_url: onboardingData.video_url || '',
          });
        }
      } catch (error) {
        console.error("Erro ao buscar dados de onboarding:", error);
      }
      
    } catch (error: any) {
      console.error('Erro ao buscar dados:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os dados",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleMaterialFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setMaterialForm(prev => ({
        ...prev,
        [name]: checked
      }));
    } else {
      setMaterialForm(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };
  
  const handleOnboardingFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setOnboardingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleCategoryChange = (value: string) => {
    setMaterialForm(prev => ({
      ...prev,
      category: value
    }));
  };
  
  const handleTypeChange = (value: Material['type']) => {
    setMaterialForm(prev => ({
      ...prev,
      type: value
    }));
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFileToUpload(e.target.files[0]);
    }
  };
  
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setThumbnailToUpload(e.target.files[0]);
    }
  };
  
  const handleCreateMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!materialForm.title || (!materialForm.file_url && !fileToUpload && materialForm.type !== 'link')) {
      toast({
        title: "Campos obrigatórios",
        description: materialForm.type === 'link' 
          ? "Por favor, preencha o título e o link"
          : "Por favor, preencha o título e selecione um arquivo",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUploadLoading(true);
      
      let fileUrl = materialForm.file_url;
      let thumbnailUrl = null;
      
      // Upload do arquivo se houver
      if (fileToUpload) {
        const filePath = `materials/${Date.now()}-${fileToUpload.name}`;
        const { error: uploadError } = await supabase.storage
          .from('materials')
          .upload(filePath, fileToUpload);
          
        if (uploadError) throw uploadError;
        
        const { data: fileData } = supabase.storage.from('materials').getPublicUrl(filePath);
        fileUrl = fileData.publicUrl;
      }
      
      // Upload da thumbnail se houver
      if (thumbnailToUpload) {
        const filePath = `thumbnails/${Date.now()}-${thumbnailToUpload.name}`;
        const { error: uploadError } = await supabase.storage
          .from('materials')
          .upload(filePath, thumbnailToUpload);
          
        if (uploadError) throw uploadError;
        
        const { data: fileData } = supabase.storage.from('materials').getPublicUrl(filePath);
        thumbnailUrl = fileData.publicUrl;
      }
      
      // Se estiver editando, atualiza o material
      if (currentMaterial?.id) {
        const { error } = await supabase
          .from('materials')
          .update({
            title: materialForm.title,
            description: materialForm.description,
            category: materialForm.category,
            file_url: fileUrl,
            thumbnail_url: thumbnailUrl || currentMaterial.thumbnail_url,
            type: materialForm.type,
            plan_level: materialForm.plan_level,
            updated_at: new Date().toISOString()
          })
          .eq('id', currentMaterial.id);
          
        if (error) throw error;
        
        toast({
          title: "Material atualizado",
          description: "O material foi atualizado com sucesso"
        });
      } else {
        // Se for novo, cria o material
        const { error } = await supabase
          .from('materials')
          .insert({
            title: materialForm.title,
            description: materialForm.description,
            category: materialForm.category,
            file_url: fileUrl,
            thumbnail_url: thumbnailUrl,
            type: materialForm.type,
            plan_level: materialForm.plan_level,
            access_count: 0
          });
          
        if (error) throw error;
        
        toast({
          title: "Material criado",
          description: "O material foi criado com sucesso"
        });
      }
      
      // Limpar formulário e recarregar dados
      setMaterialForm({
        title: '',
        description: '',
        category: 'documento',
        file_url: '',
        type: 'document',
        is_onboarding: false,
        plan_level: 'basic',
      });
      setFileToUpload(null);
      setThumbnailToUpload(null);
      setCurrentMaterial(null);
      setDialogOpen(false);
      fetchData();
      
    } catch (error: any) {
      console.error('Erro ao criar material:', error);
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadLoading(false);
    }
  };
  
  const handleDeleteMaterial = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este material?')) return;
    
    try {
      const { error } = await supabase
        .from('materials')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: "Material excluído",
        description: "O material foi excluído com sucesso"
      });
      
      fetchData();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    }
  };
  
  const handleEditMaterial = (material: Material) => {
    setCurrentMaterial(material);
    setMaterialForm({
      title: material.title,
      description: material.description,
      category: material.category,
      file_url: material.file_url,
      type: material.type,
      is_onboarding: material.is_onboarding || false,
      plan_level: material.plan_level,
    });
    setDialogOpen(true);
  };
  
  const handleUpdateOnboarding = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!onboardingForm.title || !onboardingForm.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha o título e o conteúdo",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setUploadLoading(true);
      
      if (onboardingContent) {
        // Atualizar conteúdo existente
        const { error } = await supabase
          .from('onboarding_content')
          .update({
            title: onboardingForm.title,
            content: onboardingForm.content,
            video_url: onboardingForm.video_url,
            updated_at: new Date().toISOString()
          })
          .eq('id', onboardingContent.id);
          
        if (error) throw error;
      } else {
        // Criar novo conteúdo
        const { error } = await supabase
          .from('onboarding_content')
          .insert({
            title: onboardingForm.title,
            content: onboardingForm.content,
            video_url: onboardingForm.video_url,
            is_active: true
          });
          
        if (error) throw error;
      }
      
      toast({
        title: "Conteúdo de onboarding atualizado",
        description: "As informações de onboarding foram atualizadas com sucesso"
      });
      
      fetchData();
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setUploadLoading(false);
    }
  };
  
  const getMaterialTypeIcon = (type: Material['type']) => {
    switch (type) {
      case 'document': return <FileText className="h-4 w-4" />;
      case 'video': return <Video className="h-4 w-4" />;
      case 'link': return <Link2 className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="space-y-8">
      <Tabs defaultValue="materials" className="w-full">
        <TabsList>
          <TabsTrigger value="materials">Materiais</TabsTrigger>
          <TabsTrigger value="onboarding">Conteúdo de Onboarding</TabsTrigger>
        </TabsList>
        
        <TabsContent value="materials" className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Gerenciar Materiais</h2>
            
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Adicionar Material
                </Button>
              </DialogTrigger>
              
              <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{currentMaterial ? "Editar Material" : "Adicionar Novo Material"}</DialogTitle>
                  <DialogDescription>
                    Preencha os campos para {currentMaterial ? "editar o" : "adicionar um novo"} material ao sistema.
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleCreateMaterial} className="space-y-4 pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Título *</Label>
                      <Input 
                        id="title"
                        name="title"
                        placeholder="Título do material"
                        value={materialForm.title}
                        onChange={handleMaterialFormChange}
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="category">Categoria</Label>
                      <Select 
                        value={materialForm.category} 
                        onValueChange={handleCategoryChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma categoria" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="documento">Documento</SelectItem>
                          <SelectItem value="video">Vídeo</SelectItem>
                          <SelectItem value="apresentacao">Apresentação</SelectItem>
                          <SelectItem value="planilha">Planilha</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Descrição</Label>
                    <Textarea 
                      id="description"
                      name="description"
                      placeholder="Descreva o material"
                      rows={3}
                      value={materialForm.description}
                      onChange={handleMaterialFormChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tipo de Material</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={materialForm.type === 'document' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => handleTypeChange('document')}
                      >
                        <FileText className="mr-2 h-4 w-4" />
                        Documento
                      </Button>
                      <Button
                        type="button"
                        variant={materialForm.type === 'video' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => handleTypeChange('video')}
                      >
                        <Video className="mr-2 h-4 w-4" />
                        Vídeo
                      </Button>
                      <Button
                        type="button"
                        variant={materialForm.type === 'link' ? 'default' : 'outline'}
                        className="flex-1"
                        onClick={() => handleTypeChange('link')}
                      >
                        <Link2 className="mr-2 h-4 w-4" />
                        Link
                      </Button>
                    </div>
                  </div>
                  
                  {materialForm.type === 'link' ? (
                    <div className="space-y-2">
                      <Label htmlFor="file_url">URL do Link *</Label>
                      <Input 
                        id="file_url"
                        name="file_url"
                        placeholder="https://..."
                        value={materialForm.file_url}
                        onChange={handleMaterialFormChange}
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="file">Arquivo {currentMaterial ? "(deixe em branco para manter o atual)" : "*"}</Label>
                      <Input 
                        id="file"
                        type="file"
                        onChange={handleFileChange}
                      />
                      {currentMaterial?.file_url && (
                        <div className="text-sm text-muted-foreground">
                          Arquivo atual: <a href={currentMaterial.file_url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">{currentMaterial.file_url.split('/').pop()}</a>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Imagem de Miniatura (opcional)</Label>
                    <Input 
                      id="thumbnail"
                      type="file"
                      accept="image/*"
                      onChange={handleThumbnailChange}
                    />
                    {currentMaterial?.thumbnail_url && (
                      <div className="text-sm text-muted-foreground flex items-center gap-2 mt-2">
                        <span>Miniatura atual:</span>
                        <img 
                          src={currentMaterial.thumbnail_url} 
                          alt="Thumbnail" 
                          className="w-12 h-12 object-cover rounded"
                        />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      id="is_onboarding"
                      name="is_onboarding"
                      type="checkbox"
                      checked={materialForm.is_onboarding}
                      onChange={(e) => setMaterialForm(prev => ({
                        ...prev,
                        is_onboarding: e.target.checked
                      }))}
                      className="h-4 w-4"
                    />
                    <Label htmlFor="is_onboarding" className="cursor-pointer">
                      Incluir no onboarding
                    </Label>
                  </div>
                  
                  <DialogFooter>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setDialogOpen(false);
                        setCurrentMaterial(null);
                        setMaterialForm({
                          title: '',
                          description: '',
                          category: 'documento',
                          file_url: '',
                          type: 'document',
                          is_onboarding: false,
                        });
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" disabled={uploadLoading}>
                      {uploadLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : currentMaterial ? "Atualizar" : "Adicionar"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Categoria</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-right">Acessos</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {materials.length > 0 ? (
                    materials.map((material) => (
                      <TableRow key={material.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            {material.thumbnail_url && (
                              <div className="h-8 w-8 rounded overflow-hidden flex-shrink-0">
                                <img 
                                  src={material.thumbnail_url} 
                                  alt={material.title} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <div className="truncate max-w-xs">{material.title}</div>
                              {material.is_onboarding && (
                                <div className="text-xs text-blue-600 mt-0.5">
                                  Incluído no onboarding
                                </div>
                              )}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className="inline-block px-2 py-1 bg-slate-100 rounded-full text-xs">
                            {material.category}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {getMaterialTypeIcon(material.type)}
                            <span className="capitalize">
                              {material.type}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          {material.access_count || 0}
                        </TableCell>
                        <TableCell>
                          {new Date(material.created_at).toLocaleDateString('pt-BR')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => window.open(material.file_url, '_blank')}
                            >
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                            
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditMaterial(material)}>
                                  <Pencil className="mr-2 h-4 w-4" />
                                  Editar
                                </DropdownMenuItem>
                                <DropdownMenuItem 
                                  onClick={() => handleDeleteMaterial(material.id)}
                                  className="text-red-600"
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Excluir
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        Nenhum material encontrado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="onboarding" className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Conteúdo de Onboarding</h2>
            {!isEditing && (
              <Button onClick={() => setIsEditing(true)}>
                Editar Conteúdo
              </Button>
            )}
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Seção "Comece Aqui"</CardTitle>
              <CardDescription>
                Este conteúdo será exibido para os novos usuários na seção "Comece Aqui" do dashboard.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <form onSubmit={handleUpdateOnboarding} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Título</Label>
                    <Input 
                      id="title"
                      name="title"
                      value={onboardingForm.title}
                      onChange={handleOnboardingFormChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="content">Conteúdo</Label>
                    <Textarea 
                      id="content"
                      name="content"
                      rows={6}
                      value={onboardingForm.content}
                      onChange={handleOnboardingFormChange}
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Use texto simples ou formatação Markdown para formatar o conteúdo.
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="video_url">URL do Vídeo (opcional)</Label>
                    <Input 
                      id="video_url"
                      name="video_url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={onboardingForm.video_url}
                      onChange={handleOnboardingFormChange}
                    />
                    <p className="text-xs text-muted-foreground">
                      Insira a URL de um vídeo do YouTube ou Vimeo.
                    </p>
                  </div>
                  
                  <div className="flex justify-end gap-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => {
                        setIsEditing(false);
                        if (onboardingContent) {
                          setOnboardingForm({
                            title: onboardingContent.title,
                            content: onboardingContent.content,
                            video_url: onboardingContent.video_url || '',
                          });
                        }
                      }}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit"
                      disabled={uploadLoading}
                    >
                      {uploadLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Salvando...
                        </>
                      ) : "Salvar Conteúdo"}
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  {onboardingContent ? (
                    <>
                      <div>
                        <h3 className="text-lg font-semibold mb-2">{onboardingContent.title}</h3>
                        <div className="text-muted-foreground whitespace-pre-line">
                          {onboardingContent.content}
                        </div>
                      </div>
                      
                      {onboardingContent.video_url && (
                        <div className="mt-4">
                          <h4 className="font-medium mb-2">Vídeo de Introdução:</h4>
                          <div className="aspect-video bg-slate-100 rounded-md flex items-center justify-center">
                            {/* Aqui poderia ser implementado um player de vídeo */}
                            <div className="text-center">
                              <Video className="h-12 w-12 mx-auto text-muted-foreground" />
                              <p className="mt-2 text-sm">{onboardingContent.video_url}</p>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div className="text-sm text-muted-foreground mt-4">
                        Última atualização: {new Date(onboardingContent.updated_at).toLocaleDateString('pt-BR')}
                      </div>
                    </>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">
                        Nenhum conteúdo de onboarding configurado.
                      </p>
                      <Button 
                        onClick={() => setIsEditing(true)}
                        className="mt-4"
                      >
                        Criar Conteúdo de Onboarding
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
