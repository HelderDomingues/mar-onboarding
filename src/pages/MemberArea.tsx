
import React, { useState, useEffect } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ChevronLeft, FileText, Settings, User, BookOpen, DownloadCloud, Share2 } from "lucide-react";

interface UserProfile {
  id: string;
  full_name?: string | null;
  email?: string | null;
  phone?: string | null;
  company_name?: string | null;
  company_address?: string | null;
  website?: string | null;
  avatar_url?: string | null;
  cpf?: string | null;
  cnpj?: string | null;
}

export default function MemberArea() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [materials, setMaterials] = useState<any[]>([]);

  const getInitials = (name?: string | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(part => part[0])
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  const fetchProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar seu perfil.",
          variant: "destructive",
        });
        return;
      }

      setProfile(data);
      setFormData(data);

      // Buscar materiais disponíveis
      const { data: materialsData, error: materialsError } = await supabase
        .from("materials")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);

      if (!materialsError && materialsData) {
        setMaterials(materialsData);
      }

    } catch (error: any) {
      console.error("Erro:", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchProfile();
      
      // Calcular progresso do preenchimento do perfil
      if (profile) {
        const fields = [profile.full_name, profile.email, profile.phone, profile.company_name, profile.website];
        const filledFields = fields.filter(field => field && field.trim() !== '').length;
        setProgress((filledFields / fields.length) * 100);
      }
    }
  }, [isAuthenticated, user, profile?.id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatarFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;

    try {
      // Se tiver um novo avatar, fazer upload
      let avatarUrl = profile?.avatar_url;
      
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const filePath = `avatars/${user.id}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile, { upsert: true });
          
        if (uploadError) {
          throw uploadError;
        }
        
        const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
        avatarUrl = data.publicUrl;
      }
      
      // Atualizar perfil com dados do formulário
      const updates = {
        ...formData,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString(),
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
        
      if (error) throw error;
      
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso.",
      });
      
      setProfile({ ...profile, ...updates });
      setIsEditing(false);
    } catch (error: any) {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAccessMaterial = async (materialId: string) => {
    try {
      // Registrar acesso ao material
      await supabase.rpc('increment_material_access_count', { material_id: materialId });
      
      // Registrar acesso do usuário
      if (user) {
        await supabase.from('material_accesses').insert({
          user_id: user.id,
          material_id: materialId
        });
      }
      
      // Buscar URL do material
      const { data, error } = await supabase
        .from('materials')
        .select('file_url')
        .eq('id', materialId)
        .single();
        
      if (error) throw error;
      
      // Abrir em nova aba
      window.open(data.file_url, '_blank');
    } catch (error: any) {
      toast({
        title: "Erro ao acessar material",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b py-4 px-6">
        <div className="container max-w-6xl mx-auto flex items-center justify-between">
          <Link to="/dashboard">
            <Button 
              variant="ghost" 
              className="text-slate-900 hover:bg-slate-100 hover:text-slate-900"
            >
              <ChevronLeft className="mr-2 h-5 w-5" />
              Voltar ao Dashboard
            </Button>
          </Link>
          
          <h1 className="text-xl font-semibold text-center flex-1">Área do Membro</h1>
          
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium hidden md:block">
              {profile?.full_name || user?.email}
            </span>
            <Avatar>
              <AvatarImage src={profile?.avatar_url || ""} />
              <AvatarFallback>{getInitials(profile?.full_name)}</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container max-w-6xl mx-auto py-6 px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">Meu Perfil</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center text-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src={profile?.avatar_url || ""} />
                  <AvatarFallback className="text-2xl">{getInitials(profile?.full_name)}</AvatarFallback>
                </Avatar>
                <h3 className="font-medium text-lg">{profile?.full_name || "Nome não definido"}</h3>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
                
                <div className="w-full mt-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span>Perfil completo</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <Progress value={progress} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  className="w-full" 
                  variant={isEditing ? "outline" : "default"}
                  onClick={() => setIsEditing(!isEditing)}
                >
                  {isEditing ? "Cancelar edição" : "Editar perfil"}
                </Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Menu</CardTitle>
              </CardHeader>
              <CardContent className="pb-2">
                <nav className="space-y-1">
                  <Button variant="ghost" className="w-full justify-start">
                    <User className="mr-2 h-4 w-4" />
                    <span>Meu Perfil</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <FileText className="mr-2 h-4 w-4" />
                    <span>Meu Diagnóstico</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <BookOpen className="mr-2 h-4 w-4" />
                    <span>Materiais</span>
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Configurações</span>
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-3">
            {isEditing ? (
              <Card>
                <CardHeader>
                  <CardTitle>Editar Perfil</CardTitle>
                  <CardDescription>
                    Atualize suas informações pessoais e de contato
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="avatar">Foto de Perfil</Label>
                      <Input 
                        id="avatar" 
                        type="file" 
                        accept="image/*" 
                        onChange={handleAvatarChange} 
                      />
                      <p className="text-xs text-muted-foreground">
                        Formatos aceitos: JPG, PNG, GIF (máx. 2MB)
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="full_name">Nome Completo</Label>
                        <Input 
                          id="full_name" 
                          name="full_name" 
                          value={formData.full_name || ''} 
                          onChange={handleChange}
                          placeholder="Seu nome completo"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          value={formData.email || ''} 
                          readOnly
                          disabled
                          className="bg-gray-100"
                          title="Email não pode ser alterado"
                        />
                        <p className="text-xs text-muted-foreground">
                          O email não pode ser alterado
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input 
                          id="phone" 
                          name="phone" 
                          value={formData.phone || ''} 
                          onChange={handleChange}
                          placeholder="(00) 00000-0000"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input 
                          id="website" 
                          name="website" 
                          value={formData.website || ''} 
                          onChange={handleChange}
                          placeholder="https://seusite.com.br"
                        />
                      </div>
                    </div>

                    <Separator className="my-4" />

                    <div className="space-y-2">
                      <Label htmlFor="company_name">Nome da Empresa</Label>
                      <Input 
                        id="company_name" 
                        name="company_name" 
                        value={formData.company_name || ''} 
                        onChange={handleChange}
                        placeholder="Nome da sua empresa"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="company_address">Endereço da Empresa</Label>
                      <Textarea 
                        id="company_address" 
                        name="company_address" 
                        value={formData.company_address || ''} 
                        onChange={handleChange}
                        placeholder="Endereço completo da empresa"
                        rows={3}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cpf">CPF</Label>
                        <Input 
                          id="cpf" 
                          name="cpf" 
                          value={formData.cpf || ''} 
                          onChange={handleChange}
                          placeholder="Somente números"
                          disabled={profile?.cpf ? true : false}
                          className={profile?.cpf ? "bg-gray-100" : ""}
                        />
                        {profile?.cpf && (
                          <p className="text-xs text-muted-foreground">
                            CPF não pode ser alterado
                          </p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        <Input 
                          id="cnpj" 
                          name="cnpj" 
                          value={formData.cnpj || ''} 
                          onChange={handleChange}
                          placeholder="Somente números"
                          disabled={profile?.cnpj ? true : false}
                          className={profile?.cnpj ? "bg-gray-100" : ""}
                        />
                        {profile?.cnpj && (
                          <p className="text-xs text-muted-foreground">
                            CNPJ não pode ser alterado
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsEditing(false)}
                      >
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Salvar alterações
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            ) : (
              <>
                <Tabs defaultValue="profile" className="space-y-6">
                  <TabsList>
                    <TabsTrigger value="profile">Meu Perfil</TabsTrigger>
                    <TabsTrigger value="materials">Materiais</TabsTrigger>
                    <TabsTrigger value="diagnostic">Diagnóstico</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="profile">
                    <Card>
                      <CardHeader>
                        <CardTitle>Informações Pessoais</CardTitle>
                        <CardDescription>
                          Visualize e gerencie suas informações pessoais
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">Nome Completo</h3>
                              <p>{profile?.full_name || "Não informado"}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">Email</h3>
                              <p>{profile?.email || "Não informado"}</p>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">Telefone</h3>
                              <p>{profile?.phone || "Não informado"}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">Website</h3>
                              <p>
                                {profile?.website ? (
                                  <a 
                                    href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="text-primary hover:underline"
                                  >
                                    {profile.website}
                                  </a>
                                ) : (
                                  "Não informado"
                                )}
                              </p>
                            </div>
                          </div>
                          
                          <Separator />
                          
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Empresa</h3>
                            <p>{profile?.company_name || "Não informado"}</p>
                          </div>
                          
                          <div>
                            <h3 className="text-sm font-medium text-muted-foreground mb-1">Endereço da Empresa</h3>
                            <p>{profile?.company_address || "Não informado"}</p>
                          </div>
                          
                          <Separator />
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">CPF</h3>
                              <p>{profile?.cpf || "Não informado"}</p>
                            </div>
                            <div>
                              <h3 className="text-sm font-medium text-muted-foreground mb-1">CNPJ</h3>
                              <p>{profile?.cnpj || "Não informado"}</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Button 
                          onClick={() => setIsEditing(true)}
                          className="w-full md:w-auto"
                        >
                          Editar Informações
                        </Button>
                      </CardFooter>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="materials">
                    <Card>
                      <CardHeader>
                        <CardTitle>Materiais Exclusivos</CardTitle>
                        <CardDescription>
                          Acesse materiais e recursos exclusivos para membros
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        {materials.length > 0 ? (
                          <div className="space-y-4">
                            {materials.map((material) => (
                              <Card key={material.id} className="overflow-hidden">
                                <div className="flex flex-col md:flex-row">
                                  {material.thumbnail_url && (
                                    <div className="md:w-1/4 h-[120px] overflow-hidden">
                                      <img 
                                        src={material.thumbnail_url} 
                                        alt={material.title} 
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <div className="p-4 flex-1">
                                    <h3 className="font-medium">{material.title}</h3>
                                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                                      {material.description}
                                    </p>
                                    <div className="flex items-center justify-between mt-3">
                                      <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-full">
                                        {material.category}
                                      </span>
                                      <div className="flex space-x-2">
                                        <Button 
                                          size="sm" 
                                          variant="outline"
                                          onClick={() => handleAccessMaterial(material.id)}
                                        >
                                          <DownloadCloud className="h-4 w-4 mr-1" />
                                          Acessar
                                        </Button>
                                        <Button size="sm" variant="ghost">
                                          <Share2 className="h-4 w-4" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </Card>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-12">
                            <h3 className="font-medium text-lg">Nenhum material disponível</h3>
                            <p className="text-muted-foreground mt-2">
                              Materiais exclusivos serão adicionados em breve.
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </TabsContent>
                  
                  <TabsContent value="diagnostic">
                    <Card>
                      <CardHeader>
                        <CardTitle>Meu Diagnóstico</CardTitle>
                        <CardDescription>
                          Veja os resultados do seu diagnóstico de marketing e recomendações personalizadas
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-12">
                          <h3 className="font-medium text-lg">Diagnóstico em processamento</h3>
                          <p className="text-muted-foreground mt-2">
                            Seus resultados personalizados estarão disponíveis em breve.
                          </p>
                          <Button className="mt-4" variant="outline">
                            <FileText className="mr-2 h-4 w-4" />
                            Ver questionário
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>
                </Tabs>
              </>
            )}
          </div>
        </div>
      </div>
      
      <footer className="bg-white border-t py-6 mt-12">
        <div className="container max-w-6xl mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Crie Valor Consultoria. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
}
