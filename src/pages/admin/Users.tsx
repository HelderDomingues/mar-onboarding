
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
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
import { Search, UserPlus, Mail, CheckCircle, XCircle, RefreshCw } from "lucide-react";

type UserProfile = {
  id: string;
  email: string;
  full_name?: string;
  username?: string;
  created_at?: string;
  is_admin?: boolean;
  has_submission?: boolean;
};

const UsersPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  const fetchUsers = async () => {
    if (!user) return;
    
    setIsLoading(true);
    
    try {
      // Verificar se o usuário atual é admin
      const { data: roleData, error: roleError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();
        
      if (roleError || !roleData) {
        navigate("/dashboard");
        return;
      }
      
      setIsAdmin(true);
      
      // Buscar todos os perfis de usuários
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*');
        
      if (profilesError) {
        toast({
          title: "Erro ao carregar perfis de usuários",
          description: profilesError.message,
          variant: "destructive",
        });
        return;
      }
      
      // Buscar emails dos usuários 
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        toast({
          title: "Erro ao carregar emails dos usuários",
          description: "Não foi possível acessar emails dos usuários",
          variant: "destructive",
        });
      }
      
      // Buscar roles de admin
      const { data: adminRoles, error: adminRolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'admin');
      
      // Buscar submissões
      const { data: submissions, error: submissionsError } = await supabase
        .from('quiz_submissions')
        .select('user_id');
        
      // Transformar dados
      const adminUserIds = adminRoles?.map(role => role.user_id) || [];
      const submissionUserIds = submissions?.map(sub => sub.user_id) || [];
      
      // Criar um mapa de emails usando os dados do auth.users
      const emailMap = new Map<string, string>();
      
      if (authData && authData.users) {
        authData.users.forEach((authUser: any) => {
          if (authUser && authUser.id && authUser.email) {
            emailMap.set(authUser.id, authUser.email);
          }
        });
      }
      
      // Combinar os dados de perfis com emails
      const profilesArray = Array.isArray(profilesData) ? profilesData : [];
      const processedUsers = profilesArray.map(profile => {
        return {
          ...profile,
          email: emailMap.get(profile.id) || 'Email não disponível',
          is_admin: adminUserIds.includes(profile.id),
          has_submission: submissionUserIds.includes(profile.id)
        } as UserProfile;
      });
      
      setUsers(processedUsers);
      
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      toast({
        title: "Erro ao carregar usuários",
        description: "Ocorreu um problema ao buscar os dados dos usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchUsers();
    } else if (!isAuthenticated) {
      navigate("/");
    }
  }, [isAuthenticated, user, navigate]);
  
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
  
  const handleToggleAdmin = async (userId: string, isCurrentlyAdmin: boolean) => {
    try {
      if (isCurrentlyAdmin) {
        // Remover permissão de admin
        await supabase
          .from('user_roles')
          .delete()
          .eq('user_id', userId)
          .eq('role', 'admin');
      } else {
        // Adicionar permissão de admin
        await supabase
          .from('user_roles')
          .insert({ user_id: userId, role: 'admin' });
      }
      
      // Atualizar a lista de usuários
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
  
  if (!isAuthenticated) {
    return null; // Será redirecionado no useEffect
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
              <Button className="flex items-center gap-2 bg-primary">
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
                              <TableCell>{user.email || 'Sem email'}</TableCell>
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
              </CardFooter>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default UsersPage;
