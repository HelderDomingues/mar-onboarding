
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, BookOpen, Clock, FileText, User, Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

// Tipo para os dados do perfil do usuário
type UserProfile = {
  id: string;
  email?: string;
  full_name?: string;
  username?: string;
  avatar_url?: string;
  has_asaas_customer?: boolean;
  subscription_status?: string;
  subscription_end_date?: string;
};

const MemberArea = () => {
  const { isAuthenticated, user } = useAuth();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [materials, setMaterials] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;
      
      try {
        setIsLoading(true);
        
        // Buscar perfil do usuário
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileError) {
          logger.error("Erro ao carregar perfil do usuário", { tag: 'MemberArea', data: profileError });
          toast({
            variant: "destructive",
            title: "Erro ao carregar dados",
            description: "Não foi possível carregar os dados do seu perfil.",
          });
          return;
        }
        
        setProfile(profileData);
        
        // Buscar assinatura do usuário (se existir)
        const { data: subscriptionData } = await supabase
          .from('subscriptions')
          .select('*')
          .eq('user_id', user.id)
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(1)
          .single();
          
        if (subscriptionData) {
          setProfile(prev => ({
            ...prev!,
            subscription_status: subscriptionData.status,
            subscription_end_date: subscriptionData.current_period_end
          }));
        }
        
        // Buscar materiais disponíveis
        const { data: materialsData } = await supabase
          .from('materials')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);
          
        if (materialsData) {
          setMaterials(materialsData);
        }
        
      } catch (error) {
        logger.error("Erro ao carregar dados da área de membro", { tag: 'MemberArea', data: error });
      } finally {
        setIsLoading(false);
      }
    };
    
    if (isAuthenticated && user) {
      fetchUserData();
    }
  }, [user, isAuthenticated, toast]);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
        <QuizHeader isAdmin={false} />
        <main className="flex-1 container py-8 px-4 flex items-center justify-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans">
      <QuizHeader isAdmin={false} />
      
      <main className="flex-1 container max-w-6xl py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Bem-vindo à Área Exclusiva, {profile?.full_name || profile?.username || 'Membro'}</h1>
          <p className="text-gray-600">Acesse seus materiais exclusivos e aproveite todos os benefícios do MAR.</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-primary" />
                Seu Perfil
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">Email:</span> {profile?.email}
                </div>
                {profile?.has_asaas_customer && (
                  <div className="flex items-center gap-1 text-green-600 font-medium">
                    Assinante registrado
                  </div>
                )}
                {profile?.subscription_status === 'active' && profile?.subscription_end_date && (
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4 text-primary" />
                    <span>
                      Assinatura válida até {new Date(profile.subscription_end_date).toLocaleDateString('pt-BR')}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <BarChart className="h-5 w-5 text-primary" />
                Progresso MAR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1 text-sm">
                    <span>Questionário MAR</span>
                    <span>Em progresso</span>
                  </div>
                  <Progress value={30} className="h-2" />
                </div>
                <Button variant="outline" size="sm" className="w-full">
                  Continuar questionário
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Clock className="h-5 w-5 text-primary" />
                Atividade Recente
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm">
              <div className="space-y-2">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <FileText className="h-4 w-4" />
                  <span>Acessou o material "Introdução ao MAR"</span>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span>Completou o módulo 1 do questionário</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <h2 className="text-2xl font-bold">Materiais Exclusivos</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {materials.length > 0 ? materials.map((material) => (
              <Card key={material.id} className="shadow-sm hover:shadow-md transition-all">
                <CardHeader>
                  <CardTitle className="text-lg">{material.title}</CardTitle>
                  <CardDescription className="line-clamp-2">{material.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  {material.thumbnail_url && (
                    <div className="aspect-video bg-gray-200 rounded-md mb-4 overflow-hidden">
                      <img 
                        src={material.thumbnail_url} 
                        alt={material.title} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Categoria: {material.category}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    className="w-full"
                    variant="outline"
                    onClick={() => {
                      // Registrar acesso ao material
                      supabase.functions.invoke('increment_material_access_count', {
                        body: { material_id: material.id }
                      });
                      // Abrir material em nova aba
                      window.open(material.file_url, '_blank');
                    }}
                  >
                    Acessar Material
                  </Button>
                </CardFooter>
              </Card>
            )) : (
              <div className="col-span-full py-8 text-center text-muted-foreground">
                <p className="mb-2">Nenhum material disponível ainda.</p>
                <p>Os materiais serão adicionados em breve.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      <footer className="bg-white py-4 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Crie Valor. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default MemberArea;
