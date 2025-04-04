
import React, { useState, useEffect } from "react";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { ChevronLeft, FileText, Download, ExternalLink } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";

interface Material {
  id: string;
  title: string;
  description: string;
  file_url: string;
  thumbnail_url?: string;
  category: string;
  plan_level: string;
  access_count: number;
  created_at: string;
}

const Materials = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("all");
  
  useEffect(() => {
    const fetchMaterials = async () => {
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('materials')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        setMaterials(data || []);
      } catch (error: any) {
        console.error('Erro ao buscar materiais:', error);
        toast({
          title: "Erro ao carregar materiais",
          description: "Não foi possível carregar os materiais. Por favor, tente novamente.",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchMaterials();
  }, [toast]);
  
  const handleAccessMaterial = async (material: Material) => {
    try {
      if (!user) return;
      
      // Registrar acesso
      await supabase
        .from('material_accesses')
        .insert([
          {
            material_id: material.id,
            user_id: user.id,
          }
        ]);
        
      // Incrementar contador de acessos
      await supabase
        .from('materials')
        .update({ access_count: material.access_count + 1 })
        .eq('id', material.id);
        
      // Abrir o material em nova aba
      window.open(material.file_url, '_blank');
    } catch (error) {
      console.error('Erro ao registrar acesso ao material:', error);
    }
  };
  
  const categories = ["all", ...new Set(materials.map(material => material.category))];
  
  const filteredMaterials = activeCategory === "all" 
    ? materials 
    : materials.filter(material => material.category === activeCategory);
  
  return (
    <div className="min-h-screen flex flex-col quiz-container">
      <QuizHeader isAdmin={false} />
      
      <main className="flex-1 container py-8 px-4">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2 mb-6"
        >
          <ChevronLeft className="h-4 w-4" />
          Voltar ao Dashboard
        </Button>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Biblioteca de Materiais</CardTitle>
            <CardDescription>
              Acesse artigos, guias, planilhas e recursos exclusivos para membros do programa MAR
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeCategory} onValueChange={setActiveCategory} className="mb-6">
              <TabsList className="mb-4">
                {categories.map(category => (
                  <TabsTrigger key={category} value={category}>
                    {category === "all" ? "Tudo" : category}
                  </TabsTrigger>
                ))}
              </TabsList>
              
              <TabsContent value={activeCategory} className="mt-0">
                {loading ? (
                  <div className="flex justify-center items-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : filteredMaterials.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMaterials.map(material => (
                      <Card key={material.id} className="flex flex-col h-full">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {material.category}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {new Date(material.created_at).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <CardTitle className="text-lg">{material.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3 flex-grow">
                          <p className="text-sm text-muted-foreground">
                            {material.description}
                          </p>
                        </CardContent>
                        <CardFooter className="pt-3 border-t">
                          <Button 
                            variant="outline" 
                            className="w-full flex items-center justify-center gap-2"
                            onClick={() => handleAccessMaterial(material)}
                          >
                            <ExternalLink className="h-4 w-4" />
                            Acessar Material
                          </Button>
                        </CardFooter>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-10 bg-slate-50 rounded-md">
                    <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      Nenhum material encontrado
                    </h3>
                    <p className="text-muted-foreground">
                      Não há materiais disponíveis para esta categoria.
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </main>
      
      <footer className="py-4 border-t border-[hsl(var(--quiz-border))] text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Crie Valor. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default Materials;
