import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { addLogEntry } from "@/utils/projectLog";
import { 
  Loader2, 
  User, 
  Clock, 
  CheckCircle, 
  Cog, 
  Upload, 
  Camera, 
  ArrowLeft,
  Settings,
  TrendingUp,
  UserCircle
} from "lucide-react";
import { useAvatarUpload } from '@/hooks/useAvatarUpload';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

const ProfilePage = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    full_name: "",
    user_email: "",
    phone: "",
    avatar_url: ""
  });
  const [quizStats, setQuizStats] = useState({
    completionStatus: "Não iniciado",
    currentModule: 0,
    completedAt: null,
    timeSpent: 0
  });
  const { uploadAvatar, deleteAvatar, uploading } = useAvatarUpload(user?.id || '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);

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
      const { data, error } = await supabase.from('profiles').select('*').eq('id', user?.id).single();
      if (error) throw error;
      if (data) {
        setProfileData({
          full_name: data.full_name || "",
          user_email: data.user_email || user?.email || "",
          phone: data.phone || "",
          avatar_url: data.avatar_url || ""
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
          timeSpent: 0 // Field total_time_spent not available in current schema
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

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      uploadAvatar(file);
    }
  };

  const handleDeleteAvatar = () => {
    deleteAvatar();
    setAvatarFile(null);
  };

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
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white relative">
      <div className="absolute top-4 right-4">
        <img 
          src="/lovable-uploads/688f0f25-3ab1-477c-b825-415931722359.png" 
          alt="Logo MAR" 
          className="h-12 w-auto object-contain"
        />
      </div>
      <div className="container mx-auto py-6 px-4 max-w-5xl">
        <div className="flex items-center mb-6 gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 text-primary hover:bg-primary/10"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-primary">Meu Perfil</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="md:col-span-1">
            <Card className="overflow-hidden">
              <div className="bg-gradient-to-r from-primary-700 to-primary-800 p-4">
                <div className="flex justify-center">
                  <div className="relative group">
                    <Avatar className="w-24 h-24 border-4 border-white">
                      <AvatarImage 
                        src={profileData.avatar_url || undefined} 
                        alt={profileData.full_name || 'Avatar do usuário'} 
                      />
                      <AvatarFallback className="bg-primary-600 text-white text-lg">
                        {profileData.full_name 
                          ? profileData.full_name.split(' ').map(n => n[0]).join('').toUpperCase() 
                          : 'US'}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <label 
                        htmlFor="avatar-upload" 
                        className="rounded-full bg-black/50 p-2 cursor-pointer hover:bg-black/70 transition-colors"
                      >
                        <Camera className="w-5 h-5 text-white" />
                      </label>
                      <input 
                        type="file" 
                        accept="image/jpeg,image/png,image/gif" 
                        onChange={handleAvatarChange} 
                        className="hidden" 
                        id="avatar-upload" 
                        disabled={uploading}
                      />
                    </div>
                  </div>
                </div>
                <div className="text-center mt-3 text-white">
                  <h2 className="font-semibold text-lg">{profileData.full_name || 'Usuário'}</h2>
                  <p className="text-sm text-white/80">{profileData.user_email}</p>
                </div>
              </div>
              <CardContent className="p-4">
                <nav className="space-y-1">
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm font-normal" 
                    onClick={() => navigate('/dashboard')}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm font-normal bg-slate-100" 
                  >
                    <User className="mr-2 h-4 w-4" />
                    Meu Perfil
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm font-normal" 
                    onClick={() => navigate('/quiz')}
                  >
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Questionário
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-sm font-normal" 
                    onClick={() => navigate('/materials')}
                  >
                    <Cog className="mr-2 h-4 w-4" />
                    Materiais
                  </Button>
                </nav>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-3">
            <Tabs defaultValue="personal" className="w-full">
              <TabsList className="mb-6 w-full justify-start bg-gray-100 p-1 rounded-xl">
                <TabsTrigger 
                  value="personal" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary rounded-lg transition-all duration-300"
                >
                  <UserCircle className="h-4 w-4" />
                  Dados Pessoais
                </TabsTrigger>
                <TabsTrigger 
                  value="progress" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary rounded-lg transition-all duration-300"
                >
                  <TrendingUp className="h-4 w-4" />
                  Progresso
                </TabsTrigger>
                <TabsTrigger 
                  value="preferences" 
                  className="flex items-center gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:text-primary rounded-lg transition-all duration-300"
                >
                  <Settings className="h-4 w-4" />
                  Preferências
                </TabsTrigger>
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
                      <Input 
                        id="fullName" 
                        value={profileData.full_name} 
                        onChange={e => setProfileData({
                          ...profileData,
                          full_name: e.target.value
                        })} 
                        placeholder="Seu nome completo" 
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        value={profileData.user_email} 
                        readOnly 
                        disabled 
                        className="bg-muted" 
                      />
                      <p className="text-xs text-muted-foreground">
                        Para alterar seu email, entre em contato com o suporte.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input 
                        id="phone" 
                        value={profileData.phone} 
                        onChange={e => setProfileData({
                          ...profileData,
                          phone: e.target.value
                        })} 
                        placeholder="Seu número de telefone" 
                      />
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" onClick={() => navigate('/dashboard')}>
                      Cancelar
                    </Button>
                    <Button onClick={handleSaveProfile} disabled={saving} className="text-slate-50">
                      {saving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Salvando...
                        </>
                      ) : "Salvar Alterações"}
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
                      <div className="border rounded-md p-4 shadow-sm hover:shadow transition-shadow">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Status</h3>
                        <p className="text-lg font-semibold">
                          {quizStats.completionStatus}
                        </p>
                      </div>
                      
                      <div className="border rounded-md p-4 shadow-sm hover:shadow transition-shadow">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Módulo Atual</h3>
                        <p className="text-lg font-semibold">
                          {quizStats.currentModule > 0 ? quizStats.currentModule : "Não iniciado"}
                        </p>
                      </div>
                      
                      <div className="border rounded-md p-4 shadow-sm hover:shadow transition-shadow">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Tempo Dedicado</h3>
                        <p className="text-lg font-semibold flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {formatTimeSpent(quizStats.timeSpent)}
                        </p>
                      </div>
                      
                      <div className="border rounded-md p-4 shadow-sm hover:shadow transition-shadow">
                        <h3 className="text-sm font-medium text-muted-foreground mb-1">Data de Conclusão</h3>
                        <p className="text-lg font-semibold">
                          {quizStats.completedAt ? new Date(quizStats.completedAt).toLocaleDateString('pt-BR') : "Não concluído"}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-center">
                    <Button onClick={() => navigate('/quiz')} className="text-slate-50">
                      {quizStats.completionStatus === "Completo" 
                        ? "Rever Questionário" 
                        : quizStats.currentModule > 0 
                          ? "Continuar Questionário" 
                          : "Iniciar Questionário"}
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
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
