
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase, supabaseAdmin, getUserEmails, configureEmailAccess } from "@/integrations/supabase/client";
import { addLogEntry } from "@/utils/projectLog";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, UserPlus, Mail, CheckCircle, XCircle, RefreshCw, Key, Loader2, AlertTriangle, Info } from "lucide-react";
import { 
  Alert,
  AlertDescription,
  AlertTitle
} from "@/components/ui/alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

type UserProfile = {
  id: string;
  email?: string;
  full_name?: string;
  username?: string;
  created_at?: string;
  is_admin?: boolean;
  has_submission?: boolean;
};

type ConfigResult = {
  success?: boolean;
  message?: string;
  detalhes?: string;
  codigo?: string;
};

const UsersPage = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [serviceRoleKey, setServiceRoleKey] = useState("");
  const [showConfigForm, setShowConfigForm] = useState(false);
  const [configResult, setConfigResult] = useState<ConfigResult | null>(null);
  
  const fetchUsers = async () => {
    if (!user || !isAdmin) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        toast({
          title: "Erro ao carregar perfis de usuários",
          description: profilesError.message,
          variant: "destructive",
        });
        setError("Erro ao carregar perfis: " + profilesError.message);
        return;
      }
      
      // Usar a nova função RPC atualizada
      const emailData = await getUserEmails();
        
      const { data: adminRoles, error: adminRolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      const { data: submissions, error: submissionsError } = await supabase
        .from('quiz_submissions')
        .select('user_id');
        
      const adminUserIds = adminRoles?.map(role => role.user_id) || [];
      const submissionUserIds = submissions?.map(sub => sub.user_id) || [];
      
      const emailMap = new Map<string, string>();
      if (emailData && Array.isArray(emailData)) {
        emailData.forEach((item: any) => {
          if (item && item.user_id && item.user_email) {
            emailMap.set(item.user_id, item.user_email);
          }
        });
      }
      
      const profilesArray = Array.isArray(profilesData) ? profilesData : [];
      const processedUsers = profilesArray.map(profile => {
        return {
          ...profile,
          email: emailMap.get(profile.id) || profile.email || "Email não disponível",
          is_admin: adminUserIds.includes(profile.id),
          has_submission: submissionUserIds.includes(profile.id)
        } as UserProfile;
      });
      
      setUsers(processedUsers);
      
      if (!emailData || emailMap.size === 0) {
        setError("Acesso limitado aos dados de email. A função get_users_with_emails pode não estar disponível ou você pode não ter permissões suficientes.");
      }
    } catch (error: any) {
      console.error('Erro ao buscar usuários:', error);
      
      addLogEntry('error', 'Erro ao buscar lista de usuários', { 
        error: error.message
      }, user?.id);
      
      toast({
        title: "Erro ao carregar usuários",
        description: "Ocorreu um problema ao buscar os dados dos usuários.",
        variant: "destructive",
      });
      
      setError("Erro ao buscar usuários: " + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated && user) {
      if (isAdmin) {
        fetchUsers();
      } else {
        navigate("/dashboard");
      }
    } else if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, user, isAdmin, navigate]);
  
  const filteredUsers = users.filter(user => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (user.email && user.email.toLowerCase().includes(searchLower)) ||
      (user.full_name && user.full_name.toLowerCase().includes(searchLower)) ||
      (user.username && user.username.toLowerCase().includes(searchLower))
    );
  });
  
  const handleSendEmail = (userId: string) => {
    toast({
      title: "Enviar e-mail",
      description: "Função para enviar e-mail ainda não implementada.",
    });
  };
  
  const handleAddUser = () => {
    navigate("/admin/users/new");
  };
  
  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
      } else {
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
      }
      
      setUsers(users.map(u => {
        if (u.id === userId) {
          return { ...u, is_admin: !isCurrentlyAdmin };
        }
        return u;
      }));
      
      toast({
        title: "Permissão atualizada",
        description: `Usuário ${isCurrentlyAdmin ? 'removido da' : 'adicionado à'} função de administrador.`,
      });
    } catch (error) {
      console.error('Erro ao atualizar permissão:', error);
      toast({
        title: "Erro ao atualizar permissão",
        description: "Não foi possível atualizar a permissão do usuário.",
        variant: "destructive",
      });
    }
  };
  
  const setupEmailAccess = () => {
    setShowConfigForm(true);
    setConfigResult(null);
  };
  
  const handleConfigureEmailAccess = async () => {
    if (!serviceRoleKey.trim()) {
      toast({
        title: "Erro",
        description: "A chave service_role é obrigatória.",
        variant: "destructive",
      });
      return;
    }
    
    setIsConfiguring(true);
    setConfigResult(null);
    
    try {
      const result = await configureEmailAccess(serviceRoleKey);
      
      setConfigResult(result);
      
      if (result.success) {
        toast({
          title: "Configuração concluída",
          description: result.message,
        });
        fetchUsers();
      } else {
        toast({
          title: "Erro na configuração",
          description: result.message,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao configurar acesso aos emails:', error);
      toast({
        title: "Erro ao configurar acesso",
        description: "Não foi possível configurar o acesso aos emails dos usuários.",
        variant: "destructive",
      });
      
      setConfigResult({
        success: false,
        message: "Erro inesperado ao configurar acesso aos emails."
      });
    } finally {
      setIsConfiguring(false);
    }
  };
  
  const handleCancelConfig = () => {
    setShowConfigForm(false);
    setServiceRoleKey("");
    setConfigResult(null);
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <SidebarInset className="p-6 bg-gray-50">
          <div className="container max-w-7xl mx-auto">
            <div className="flex flex-col gap-2 mb-6">
              <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
              <p className="text-muted-foreground">
                Gerencie usuários, permissões e acesso ao sistema.
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <Button 
                className="flex items-center gap-2 bg-primary" 
                onClick={handleAddUser}
              >
                <UserPlus className="h-4 w-4" />
                <span>Novo Usuário</span>
              </Button>
              
              <div className="relative flex-grow max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  className="pl-9 w-full" 
                  placeholder="Buscar usuários..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button 
                variant="outline" 
                size="icon"
                onClick={fetchUsers}
                disabled={isLoading}
                title="Atualizar lista de usuários"
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
            
            <Card className="shadow-sm">
              <CardHeader className="pb-3 border-b">
                <CardTitle>Usuários do Sistema</CardTitle>
                <CardDescription>
                  Total de {users.length} usuários registrados
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {error && (
                  <Alert variant="warning" className="m-4">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Atenção</AlertTitle>
                    <AlertDescription className="space-y-2">
                      <p>{error}</p>
                      <Button variant="outline" size="sm" onClick={setupEmailAccess} className="text-amber-800 hover:bg-amber-100">
                        Configurar acesso aos emails
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}
                
                {showConfigForm && (
                  <div className="p-4 bg-blue-50 border-l-4 border-blue-500">
                    <h3 className="font-medium mb-2">Configurar chave service_role do Supabase</h3>
                    <p className="text-sm mb-4">
                      Para acessar os emails dos usuários, insira a chave service_role do seu projeto Supabase.
                      Esta chave pode ser encontrada no painel do Supabase em Configurações do Projeto &gt; API.
                    </p>
                    
                    <div className="flex flex-col gap-4">
                      <div>
                        <Label htmlFor="service-role-key">Chave service_role</Label>
                        <Input 
                          id="service-role-key"
                          value={serviceRoleKey}
                          onChange={(e) => setServiceRoleKey(e.target.value)}
                          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                          className="font-mono text-xs"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          A chave deve começar com "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" e ter 3 seções separadas por pontos.
                        </p>
                      </div>
                      
                      {configResult && (
                        <Alert 
                          variant={configResult.success ? "default" : "destructive"}
                          className={configResult.success ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"}
                        >
                          {configResult.success ? (
                            <Info className="h-4 w-4" />
                          ) : (
                            <AlertTriangle className="h-4 w-4" />
                          )}
                          <AlertTitle>{configResult.success ? "Sucesso" : "Erro"}</AlertTitle>
                          <AlertDescription className="space-y-2">
                            <p>{configResult.message}</p>
                            {configResult.detalhes && (
                              <Accordion type="single" collapsible className="w-full">
                                <AccordionItem value="details">
                                  <AccordionTrigger className="text-sm py-2">
                                    Ver detalhes técnicos
                                  </AccordionTrigger>
                                  <AccordionContent className="text-sm bg-gray-50 p-3 rounded border">
                                    <div className="space-y-2">
                                      <p><strong>Detalhes:</strong> {configResult.detalhes}</p>
                                      {configResult.codigo && (
                                        <p><strong>Código de erro:</strong> {configResult.codigo}</p>
                                      )}
                                    </div>
                                  </AccordionContent>
                                </AccordionItem>
                              </Accordion>
                            )}
                          </AlertDescription>
                        </Alert>
                      )}
                      
                      <div className="flex gap-2 justify-end">
                        <Button variant="outline" onClick={handleCancelConfig} disabled={isConfiguring}>
                          Cancelar
                        </Button>
                        <Button 
                          onClick={handleConfigureEmailAccess} 
                          disabled={isConfiguring || !serviceRoleKey.trim()}
                        >
                          {isConfiguring ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Configurando...
                            </>
                          ) : (
                            "Salvar configuração"
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
                
                {isLoading ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <div className="rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Questionário</TableHead>
                          <TableHead>Admin</TableHead>
                          <TableHead className="text-right">Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredUsers.length === 0 ? (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                              {searchQuery ? 'Nenhum usuário encontrado com os critérios informados' : 'Nenhum usuário cadastrado'}
                            </TableCell>
                          </TableRow>
                        ) : (
                          filteredUsers.map((user) => (
                            <TableRow key={user.id} className="hover:bg-muted/50">
                              <TableCell className="font-medium">
                                {user.full_name || user.username || 'Sem nome'}
                              </TableCell>
                              <TableCell>{user.email || 'Email não disponível'}</TableCell>
                              <TableCell>
                                {user.has_submission ? (
                                  <div className="flex items-center gap-1 text-green-600">
                                    <CheckCircle className="h-4 w-4" />
                                    <span>Completo</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center gap-1 text-orange-500">
                                    <XCircle className="h-4 w-4" />
                                    <span>Pendente</span>
                                  </div>
                                )}
                              </TableCell>
                              <TableCell>
                                <Button 
                                  variant={user.is_admin ? "default" : "outline"}
                                  size="sm"
                                  onClick={() => handleToggleAdmin(user.id, !!user.is_admin)}
                                >
                                  {user.is_admin ? 'Admin' : 'Usuário'}
                                </Button>
                              </TableCell>
                              <TableCell className="text-right">
                                <Button variant="ghost" size="icon" onClick={() => handleSendEmail(user.id)}>
                                  <Mail className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between border-t py-4 px-6 text-muted-foreground text-sm">
                <p>Atualizado em {new Date().toLocaleDateString('pt-BR')}</p>
                <div className="text-amber-600 font-medium text-xs">
                  {error ? "Acesso limitado aos dados dos usuários" : "Última atualização: " + new Date().toLocaleTimeString('pt-BR')}
                </div>
              </CardFooter>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UsersPage;
