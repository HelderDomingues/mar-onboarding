import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { addLogEntry } from "@/utils/projectLog";
import { Loader2, User, Clock, CheckCircle } from "lucide-react";
const ProfilePage = () => {
  const {
    user
  } = useAuth();
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    user_email: "",
    phone: ""
  });
  const [quizStats, setQuizStats] = useState({
    completionStatus: "Não iniciado",
    currentModule: 0,
    completedAt: null,
    timeSpent: 0
  });
  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadQuizStats();
    }
  }, [user]);
  const loadUserProfile = async () => {
    try {
      setLoading(true);
      addLogEntry('info', 'Carregando perfil do usuário', {
        userId: user?.id
      });
      const {
        data,
        error
      } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      if (error) throw error;
      if (data) {
        setProfileData({
          full_name: data.full_name || "",
          user_email: data.user_email || user?.email || "",
          phone: data.phone || ""
        });
      }
    } catch (error: any) {
      console.error("Erro ao carregar perfil:", error);
      addLogEntry('error', 'Erro ao carregar perfil', {
        error: error.message
      });
      toast({
        title: "Erro ao carregar perfil",
        description: "Não foi possível carregar seus dados de perfil.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  const loadQuizStats = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('quiz_submissions').select('*').eq('user_id', user?.id).single();
      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setQuizStats({
          completionStatus: data.completed ? "Completo" : "Em progresso",
          currentModule: data.current_module || 0,
          completedAt: data.completed_at,
          timeSpent: data.total_time_spent || 0
        });
      }
    } catch (error: any) {
      console.error("Erro ao carregar estatísticas do quiz:", error);
      addLogEntry('error', 'Erro ao carregar estatísticas do quiz', {
        error: error.message
      });
    }
  };
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      addLogEntry('info', 'Atualizando perfil do usuário', {
        userId: user?.id
      });
      const {
        error
      } = await supabase.from('profiles').update({
        full_name: profileData.full_name,
        phone: profileData.phone
      }).eq('id', user?.id);
      if (error) throw error;
      toast({
        title: "Perfil atualizado",
        description: "Suas informações foram atualizadas com sucesso."
      });
    } catch (error: any) {
      console.error("Erro ao atualizar perfil:", error);
      addLogEntry('error', 'Erro ao atualizar perfil', {
        error: error.message
      });
      toast({
        title: "Erro ao atualizar perfil",
        description: "Não foi possível atualizar suas informações.",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  // Função para formatar o tempo em horas e minutos
  const formatTimeSpent = (seconds: number) => {
    if (!seconds) return "0 minutos";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor(seconds % 3600 / 60);
    if (hours > 0) {
      return `${hours}h ${minutes}min`;
    } else {
      return `${minutes} minutos`;
    }
  };
  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>;
  }
  return <div className="container mx-auto py-8 px-4">
      <h1 className="text-2xl font-bold mb-6">Meu Perfil</h1>
      
      <Tabs defaultValue="personal">
        <TabsList className="mb-6">
          <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="progress">Progresso</TabsTrigger>
          <TabsTrigger value="preferences">Preferências</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5 text-primary" />
                Informações Pessoais
              </CardTitle>
              <CardDescription>
                Atualize seus dados pessoais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo</Label>
                <Input id="fullName" value={profileData.full_name} onChange={e => setProfileData({
                ...profileData,
                full_name: e.target.value
              })} placeholder="Seu nome completo" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={profileData.user_email} readOnly disabled className="bg-muted" />
                <p className="text-xs text-muted-foreground">
                  Para alterar seu email, entre em contato com o suporte.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input id="phone" value={profileData.phone} onChange={e => setProfileData({
                ...profileData,
                phone: e.target.value
              })} placeholder="Seu número de telefone" />
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProfile} disabled={saving} className="text-slate-50">
                {saving ? <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </> : "Salvar Alterações"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="progress">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-primary" />
                Progresso no Questionário MAR
              </CardTitle>
              <CardDescription>
                Acompanhe seu progresso no questionário
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                  <p className="text-lg font-semibold">
                    {quizStats.completionStatus}
                  </p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Módulo Atual</h3>
                  <p className="text-lg font-semibold">
                    {quizStats.currentModule > 0 ? quizStats.currentModule : "Não iniciado"}
                  </p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Tempo Dedicado</h3>
                  <p className="text-lg font-semibold flex items-center gap-1">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    {formatTimeSpent(quizStats.timeSpent)}
                  </p>
                </div>
                
                <div className="border rounded-md p-4">
                  <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Conclusão</h3>
                  <p className="text-lg font-semibold">
                    {quizStats.completedAt ? new Date(quizStats.completedAt).toLocaleDateString('pt-BR') : "Não concluído"}
                  </p>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-center">
              <Button onClick={() => navigate('/quiz')} className="text-slate-50">
                {quizStats.completionStatus === "Completo" ? "Rever Questionário" : quizStats.currentModule > 0 ? "Continuar Questionário" : "Iniciar Questionário"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>Preferências</CardTitle>
              <CardDescription>
                Configure suas preferências de uso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Preferências serão adicionadas em breve.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>;
};
export default ProfilePage;