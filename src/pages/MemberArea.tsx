
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { HomeIcon, Upload, Save, ArrowLeft } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface UserProfile {
  id: string;
  email?: string;
  full_name?: string;
  phone?: string;
  company_name?: string;
  company_address?: string;
  website?: string;
  cnpj?: string;
  cpf?: string;
  avatar_url?: string;
  has_asaas_customer?: boolean;
}

const MemberArea = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
      return;
    }
    
    fetchUserProfile();
  }, [isAuthenticated, user]);
  
  const fetchUserProfile = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) {
        console.error('Erro ao buscar perfil:', error);
        toast({
          title: "Erro ao carregar perfil",
          description: "Não foi possível carregar seus dados de perfil.",
          variant: "destructive"
        });
      } else if (data) {
        setProfile(data as UserProfile);
        setFormData(data as UserProfile);
      }
      
      // Verificar se o usuário tem dados no Asaas
      if (data && !data.has_asaas_customer) {
        const { data: asaasData } = await supabase
          .from('asaas_customers')
          .select('*')
          .eq('user_id', user.id)
          .single();
          
        if (asaasData) {
          // Atualizar o perfil com os dados do Asaas
          const updatedProfile = {
            ...data,
            has_asaas_customer: true,
            cpf: asaasData.cpf_cnpj ? asaasData.cpf_cnpj.toString() : data.cpf,
            phone: asaasData.telefone ? asaasData.telefone.toString() : data.phone,
          };
          
          await supabase
            .from('profiles')
            .update({
              has_asaas_customer: true,
              cpf: updatedProfile.cpf,
              phone: updatedProfile.phone
            })
            .eq('id', user.id);
          
          setProfile(updatedProfile as UserProfile);
          setFormData(updatedProfile as UserProfile);
        }
      }
      
    } catch (error) {
      console.error('Erro ao buscar dados:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };
  
  const uploadAvatar = async () => {
    if (!avatar || !user) return null;
    
    try {
      setIsUploading(true);
      
      const fileExt = avatar.name.split('.').pop();
      const filePath = `avatars/${user.id}_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('user-avatars')
        .upload(filePath, avatar);
        
      if (uploadError) {
        throw uploadError;
      }
      
      // Obter URL pública
      const { data } = supabase.storage
        .from('user-avatars')
        .getPublicUrl(filePath);
        
      return data.publicUrl;
    } catch (error) {
      console.error('Erro ao fazer upload de avatar:', error);
      return null;
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      let avatarUrl = formData.avatar_url;
      
      if (avatar) {
        const newAvatarUrl = await uploadAvatar();
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        }
      }
      
      const updatedProfile = {
        ...formData,
        avatar_url: avatarUrl,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(updatedProfile)
        .eq('id', user.id);
        
      if (error) {
        throw error;
      }
      
      // Atualizar Asaas Customer se existir
      if (profile?.has_asaas_customer) {
        await supabase
          .from('asaas_customers')
          .update({
            nome_completo: updatedProfile.full_name,
            telefone: updatedProfile.phone ? parseFloat(updatedProfile.phone.replace(/\D/g, '')) : null,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      }
      
      setProfile(updatedProfile as UserProfile);
      setIsEditing(false);
      
      toast({
        title: "Perfil atualizado",
        description: "Seus dados foram salvos com sucesso.",
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: "Erro ao salvar perfil",
        description: "Não foi possível atualizar seus dados.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleCancel = () => {
    setFormData(profile || {});
    setAvatar(null);
    setIsEditing(false);
  };
  
  const getAvatarFallback = () => {
    if (profile?.full_name) {
      return profile.full_name.split(' ').slice(0, 2).map(name => name[0]).join('').toUpperCase();
    }
    
    return user?.email ? user.email.substring(0, 2).toUpperCase() : "US";
  };
  
  const navigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans">
      {/* Cabeçalho */}
      <header className="bg-primary text-white py-4 px-6 shadow-md">
        <div className="container max-w-5xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Link to="/dashboard">
              <img alt="MAR - Mapa para Alto Rendimento" className="h-8" src="https://static.wixstatic.com/media/783feb_0e0fffdb3f3e4eafa422021dcea535d4~mv2.png" />
            </Link>
          </div>
          
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={navigateToDashboard}
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              Voltar ao Dashboard
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container max-w-5xl py-8 px-4 mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Área do Membro</h1>
          <p className="text-gray-600 mt-2">
            Gerencie suas informações e acesse os recursos exclusivos do programa MAR.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Coluna de perfil */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Seu Perfil</CardTitle>
                  <CardDescription>
                    Gerenciar suas informações pessoais
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="flex flex-col items-center">
                  <div className="mb-4 relative">
                    <Avatar className="h-24 w-24">
                      {formData.avatar_url ? (
                        <AvatarImage src={formData.avatar_url} alt="Foto de perfil" />
                      ) : null}
                      <AvatarFallback className="text-2xl bg-primary text-white">
                        {getAvatarFallback()}
                      </AvatarFallback>
                    </Avatar>
                    
                    {isEditing && (
                      <label 
                        htmlFor="avatar-upload" 
                        className="absolute bottom-0 right-0 p-1.5 bg-primary rounded-full cursor-pointer"
                      >
                        <Upload className="h-4 w-4 text-white" />
                        <input 
                          id="avatar-upload" 
                          type="file" 
                          accept="image/*" 
                          onChange={handleAvatarChange}
                          className="hidden" 
                        />
                      </label>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg">
                    {profile?.full_name || 'Nome não informado'}
                  </h3>
                  
                  <p className="text-sm text-gray-500 mt-1">
                    {user?.email}
                  </p>
                  
                  {!isEditing ? (
                    <Button 
                      className="mt-4 w-full" 
                      variant="outline"
                      onClick={() => setIsEditing(true)}
                    >
                      Editar Perfil
                    </Button>
                  ) : (
                    <div className="flex gap-2 mt-4 w-full">
                      <Button 
                        variant="outline"
                        className="flex-1"
                        onClick={handleCancel}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        className="flex-1"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                      >
                        {isSaving ? 'Salvando...' : 'Salvar'}
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              <Card className="mt-4">
                <CardHeader>
                  <CardTitle>Acesso Rápido</CardTitle>
                </CardHeader>
                
                <CardContent className="space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/dashboard')}
                  >
                    <HomeIcon className="h-4 w-4 mr-2" /> Dashboard
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="w-full justify-start"
                    onClick={() => navigate('/quiz')}
                  >
                    <HomeIcon className="h-4 w-4 mr-2" /> Questionário MAR
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Coluna de detalhes do perfil */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                  <CardDescription>
                    {isEditing ? 'Edite suas informações abaixo' : 'Seus dados registrados no sistema'}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome Completo</Label>
                      {isEditing ? (
                        <Input 
                          id="full_name"
                          name="full_name"
                          value={formData.full_name || ''}
                          onChange={handleInputChange}
                          placeholder="Digite seu nome completo"
                        />
                      ) : (
                        <p className="text-sm py-2">{profile?.full_name || 'Não informado'}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail</Label>
                      <Input 
                        id="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">O e-mail não pode ser alterado</p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      {isEditing ? (
                        <Input 
                          id="phone"
                          name="phone"
                          value={formData.phone || ''}
                          onChange={handleInputChange}
                          placeholder="(00) 00000-0000"
                        />
                      ) : (
                        <p className="text-sm py-2">{profile?.phone || 'Não informado'}</p>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input 
                        id="cpf"
                        name="cpf"
                        value={formData.cpf || ''}
                        onChange={handleInputChange}
                        placeholder="000.000.000-00"
                        disabled={profile?.has_asaas_customer}
                        className={profile?.has_asaas_customer ? "bg-gray-50" : ""}
                      />
                      {profile?.has_asaas_customer && (
                        <p className="text-xs text-gray-500">CPF associado ao cadastro financeiro</p>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <h3 className="font-medium">Informações da Empresa</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                      <div className="space-y-2">
                        <Label htmlFor="company_name">Nome da Empresa</Label>
                        {isEditing ? (
                          <Input 
                            id="company_name"
                            name="company_name"
                            value={formData.company_name || ''}
                            onChange={handleInputChange}
                            placeholder="Nome da sua empresa"
                          />
                        ) : (
                          <p className="text-sm py-2">{profile?.company_name || 'Não informado'}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="cnpj">CNPJ</Label>
                        {isEditing ? (
                          <Input 
                            id="cnpj"
                            name="cnpj"
                            value={formData.cnpj || ''}
                            onChange={handleInputChange}
                            placeholder="00.000.000/0000-00"
                          />
                        ) : (
                          <p className="text-sm py-2">{profile?.cnpj || 'Não informado'}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="company_address">Endereço</Label>
                        {isEditing ? (
                          <Input 
                            id="company_address"
                            name="company_address"
                            value={formData.company_address || ''}
                            onChange={handleInputChange}
                            placeholder="Endereço completo da empresa"
                          />
                        ) : (
                          <p className="text-sm py-2">{profile?.company_address || 'Não informado'}</p>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        {isEditing ? (
                          <Input 
                            id="website"
                            name="website"
                            value={formData.website || ''}
                            onChange={handleInputChange}
                            placeholder="https://www.example.com"
                          />
                        ) : (
                          <p className="text-sm py-2">
                            {profile?.website ? (
                              <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                                {profile.website}
                              </a>
                            ) : (
                              'Não informado'
                            )}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="mt-6">
                <CardHeader>
                  <CardTitle>Materiais Complementares</CardTitle>
                  <CardDescription>
                    Recursos exclusivos para membros do programa MAR
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <p className="text-gray-600">
                    Nesta área você terá acesso a materiais exclusivos desenvolvidos pela Crie Valor
                    para auxiliar na implementação das estratégias recomendadas.
                  </p>
                  
                  <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4 text-blue-700">
                    <p className="text-center italic">
                      Em breve novos materiais serão disponibilizados.
                    </p>
                  </div>
                </CardContent>
                
                <CardFooter>
                  <Button variant="outline" className="w-full" disabled>
                    <Save className="h-4 w-4 mr-2" /> Baixar Recursos
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
      
      <footer className="py-4 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Crie Valor. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default MemberArea;
