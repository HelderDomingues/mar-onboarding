
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { addLogEntry } from "@/utils/projectLog";
import { useToast } from "@/components/ui/use-toast";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSearch } from "./users/UserSearch";
import { ServiceRoleSetup } from "./users/ServiceRoleSetup";
import { UsersTableView } from "@/components/admin/UsersTableView";
import { fetchUserProfiles, toggleAdminRole, setupEmailAccessService } from "./users/UsersService";
import type { UserProfile, ConfigResult } from "@/types/admin";

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
      const { users: fetchedUsers, hasEmailAccess } = await fetchUserProfiles(user?.id);
      setUsers(fetchedUsers);

      if (!hasEmailAccess) {
        setError("Service role key não configurada ou inválida. Configure para acessar os emails dos usuários.");
      }
    } catch (error: any) {
      toast({
        title: "Erro ao carregar usuários",
        description: "Verifique se a service role key está configurada corretamente.",
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
      const result = await setupEmailAccessService(serviceRoleKey);

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
    <div className="w-full max-w-7xl mx-auto space-y-4 md:space-y-6 px-2 md:px-0">
      <div className="flex flex-col gap-2">
        <h1 className="text-base md:text-2xl font-bold break-words">Gerenciamento de Usuários</h1>
        <p className="text-xs md:text-base text-muted-foreground">
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
        <CardHeader className="pb-3 border-b px-3 md:px-6 py-3 md:py-4">
          <CardTitle className="text-base md:text-xl break-words">Usuários do Sistema</CardTitle>
          <CardDescription className="text-xs md:text-sm">
            Total de {users.length} usuários registrados
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0 overflow-x-auto">
          <ServiceRoleSetup
            error={error}
            setupEmailAccess={setupEmailAccess}
            handleConfigureEmailAccess={handleConfigureEmailAccess}
            handleCancelConfig={handleCancelConfig}
            isConfiguring={isConfiguring}
            serviceRoleKey={serviceRoleKey}
            setServiceRoleKey={setServiceRoleKey}
            configResult={configResult}
            showConfigForm={showConfigForm}
          />

          <UsersTableView
            users={filteredUsers}
            isLoading={isLoading}
            searchQuery={searchQuery}
            onToggleAdmin={handleToggleAdmin}
            onSendEmail={handleSendEmail}
          />
        </CardContent>
        <CardFooter className="flex flex-col md:flex-row justify-between gap-2 border-t py-3 md:py-4 px-3 md:px-6 text-muted-foreground text-xs">
          <p>Atualizado em {new Date().toLocaleDateString('pt-BR')}</p>
          <div className="text-amber-600 font-medium text-xs">
            {error ? "Acesso limitado" : "Última atualização: " + new Date().toLocaleTimeString('pt-BR')}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default UsersPage;
