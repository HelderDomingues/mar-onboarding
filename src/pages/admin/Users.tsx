
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { addLogEntry } from "@/utils/projectLog";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSearch } from "./users/UserSearch";
import { UsersTableView } from "@/components/admin/UsersTableView";
import { fetchUserProfiles, toggleAdminRole } from "./users/UsersService";
import type { UserProfile } from "@/types/admin";

const UsersPage = () => {
  const { isAuthenticated, user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState<string | null>(null);
  
  const fetchUsers = async () => {
    if (!user || !isAdmin) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { users: fetchedUsers } = await fetchUserProfiles(user?.id);
      setUsers(fetchedUsers);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: "Ocorreu um erro ao buscar os dados dos usuários. Verifique o console para mais detalhes.",
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
      await toggleAdminRole(userId, isCurrentlyAdmin);
      
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
      toast({
        title: "Erro ao atualizar permissão",
        description: "Não foi possível atualizar a permissão do usuário.",
        variant: "destructive",
      });
    }
  };
  
  if (!isAuthenticated) {
    return null;
  }
  
  return (
    <div className="container max-w-7xl mx-auto p-6">
      <div className="flex flex-col gap-2 mb-6">
        <h1 className="text-2xl font-bold">Gerenciamento de Usuários</h1>
        <p className="text-muted-foreground">
          Gerencie usuários, permissões e acesso ao sistema.
        </p>
      </div>
      
      <UserSearch 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        handleAddUser={handleAddUser}
        fetchUsers={fetchUsers}
        isLoading={isLoading}
      />
      
      <Card className="shadow-sm">
        <CardHeader className="pb-3 border-b">
          <CardTitle>Usuários do Sistema</CardTitle>
          <CardDescription>
            Total de {users.length} usuários registrados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <UsersTableView
            users={filteredUsers}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onToggleAdmin={handleToggleAdmin}
            onSendEmail={handleSendEmail}
          />
        </CardContent>
        <CardFooter className="flex justify-between border-t py-4 px-6 text-muted-foreground text-sm">
          <p>Atualizado em {new Date().toLocaleDateString('pt-BR')}</p>
          <div className="text-amber-600 font-medium text-xs">
            {error ? "Acesso limitado aos dados dos usuários" : "Última atualização: " + new Date().toLocaleTimeString('pt-BR')}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UsersPage;
