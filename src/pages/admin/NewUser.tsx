
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { Button } from "@/components/ui/button";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2 } from "lucide-react";

const NewUserPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [makeAdmin, setMakeAdmin] = useState(false);

  const [formError, setFormError] = useState<string | null>(null);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    
    if (!email || !password) {
      setFormError("Email e senha são obrigatórios");
      return;
    }
    
    if (password.length < 6) {
      setFormError("A senha deve ter pelo menos 6 caracteres");
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Tentar criar o usuário
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: {
          full_name: name
        }
      });
      
      if (userError) {
        throw userError;
      }
      
      const newUserId = userData.user.id;
      
      // Se for admin, adicionar à tabela de roles
      if (makeAdmin) {
        const { error: roleError } = await supabase
          .from('user_roles')
          .insert({ user_id: newUserId, role: 'admin' });
          
        if (roleError) {
          console.error("Erro ao adicionar papel de admin:", roleError);
        }
      }
      
      toast({
        title: "Usuário criado com sucesso",
        description: "Um novo usuário foi adicionado ao sistema.",
      });
      
      // Voltar para a lista de usuários
      navigate("/admin/users");
      
    } catch (error: any) {
      console.error("Erro ao criar usuário:", error);
      setFormError(error.message || "Ocorreu um erro ao criar o usuário");
      toast({
        variant: "destructive",
        title: "Erro ao criar usuário",
        description: error.message || "Ocorreu um erro ao criar o usuário",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleBack = () => {
    navigate("/admin/users");
  };
  
  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen">
        <AdminSidebar />
        <SidebarInset className="p-6 bg-gray-50">
          <div className="container max-w-2xl mx-auto">
            <div className="flex items-center gap-2 mb-6">
              <Button variant="ghost" size="icon" onClick={handleBack}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold">Adicionar Novo Usuário</h1>
                <p className="text-muted-foreground">
                  Crie uma nova conta de usuário no sistema.
                </p>
              </div>
            </div>
            
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle>Informações do Usuário</CardTitle>
                <CardDescription>
                  Preencha os dados para criar um novo usuário
                </CardDescription>
              </CardHeader>
              <form onSubmit={handleSubmit}>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome Completo</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      placeholder="Digite o nome completo" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Digite o email" 
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Senha</Label>
                    <Input 
                      id="password" 
                      type="password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Digite a senha" 
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      Mínimo de 6 caracteres
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="admin"
                      checked={makeAdmin}
                      onChange={(e) => setMakeAdmin(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="admin" className="cursor-pointer">
                      Adicionar como Administrador
                    </Label>
                  </div>
                  
                  {formError && (
                    <div className="bg-destructive/10 text-destructive p-3 rounded-md text-sm">
                      {formError}
                    </div>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between border-t pt-5">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleBack}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={isLoading}
                    className="flex items-center gap-2"
                  >
                    {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
                    Criar Usuário
                  </Button>
                </CardFooter>
              </form>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default NewUserPage;
