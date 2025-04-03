
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/use-toast";
import { FileText, Download, Clock, Settings } from "lucide-react";

interface Material {
  id: string;
  title: string;
  description: string;
  file_url: string;
  category: string;
  thumbnail_url: string | null;
  access_count: number;
}

interface UserProfile {
  full_name: string;
  username: string;
  email: string;
}

const MemberArea = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState<string>("materiais");

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/");
      toast({
        title: "Acesso restrito",
        description: "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
      return;
    }

    const loadUserData = async () => {
      setIsLoading(true);
      try {
        // Carregar perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("full_name, username, email")
          .eq("id", user?.id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Carregar materiais disponíveis para o usuário
        const { data: materialsData, error: materialsError } = await supabase
          .from("materials")
          .select("*")
          .order("created_at", { ascending: false });

        if (materialsError) throw materialsError;
        setMaterials(materialsData || []);
      } catch (error: any) {
        console.error("Erro ao carregar dados:", error.message);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar seus dados. Por favor, tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadUserData();
  }, [isAuthenticated, navigate, toast, user]);

  const handleAccessMaterial = async (materialId: string, fileUrl: string) => {
    try {
      // Registrar acesso ao material
      await supabase.rpc('increment_material_access_count', { material_id: materialId });
      
      // Registrar acesso do usuário
      await supabase.from('material_accesses').insert({
        user_id: user?.id,
        material_id: materialId
      });

      // Abrir o material em nova aba
      window.open(fileUrl, '_blank');
      
      toast({
        title: "Material acessado",
        description: "O material foi aberto em uma nova aba.",
      });
    } catch (error: any) {
      console.error("Erro ao acessar material:", error.message);
      toast({
        title: "Erro ao acessar material",
        description: "Não foi possível acessar o material. Por favor, tente novamente.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Área do Membro</h1>
        <p className="text-muted-foreground mt-2">
          Bem-vindo(a), {profile?.full_name || "Membro"}! Aqui você tem acesso exclusivo aos seus materiais e recursos.
        </p>
      </header>

      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-8">
          <TabsTrigger value="materiais">Materiais</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="perfil">Meu Perfil</TabsTrigger>
        </TabsList>

        <TabsContent value="materiais" className="space-y-6">
          <h2 className="text-2xl font-semibold mb-4">Materiais Disponíveis</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.length > 0 ? (
              materials.map((material) => (
                <Card key={material.id} className="overflow-hidden flex flex-col h-full">
                  <div className="aspect-video bg-muted relative">
                    {material.thumbnail_url ? (
                      <img 
                        src={material.thumbnail_url} 
                        alt={material.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full bg-muted">
                        <FileText size={48} className="text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xl">{material.title}</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-grow">
                    <p className="text-muted-foreground text-sm mb-2">
                      {material.description}
                    </p>
                    <div className="flex items-center text-xs text-muted-foreground mt-2">
                      <span className="bg-muted px-2 py-1 rounded-md">{material.category}</span>
                      <span className="ml-2 flex items-center">
                        <Clock size={14} className="mr-1" />
                        {material.access_count || 0} acessos
                      </span>
                    </div>
                  </CardContent>
                  
                  <div className="p-4 pt-0 mt-auto">
                    <Button 
                      onClick={() => handleAccessMaterial(material.id, material.file_url)}
                      className="w-full"
                    >
                      <Download size={16} className="mr-2" />
                      Acessar Material
                    </Button>
                  </div>
                </Card>
              ))
            ) : (
              <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
                <FileText size={64} className="text-muted-foreground mb-4" />
                <h3 className="text-xl font-medium mb-2">Nenhum material disponível</h3>
                <p className="text-muted-foreground max-w-md">
                  No momento não há materiais disponíveis para seu nível de acesso.
                  Novos materiais serão adicionados em breve.
                </p>
              </div>
            )}
          </div>
        </TabsContent>

        <TabsContent value="historico">
          <h2 className="text-2xl font-semibold mb-4">Seu Histórico de Acesso</h2>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-2">
                <p className="text-center text-muted-foreground py-8">
                  O histórico de acesso será implementado em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="perfil">
          <h2 className="text-2xl font-semibold mb-4">Seu Perfil</h2>
          
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Nome</p>
                  <p className="text-lg">{profile?.full_name || "Não informado"}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                  <p className="text-lg">{profile?.email || "Não informado"}</p>
                </div>
                
                <Separator />
                
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-1">Usuário</p>
                  <p className="text-lg">{profile?.username || "Não informado"}</p>
                </div>
              </div>
              
              <Button variant="outline" className="mt-6" onClick={() => navigate("/dashboard")}>
                <Settings size={16} className="mr-2" />
                Atualizar Perfil
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MemberArea;
