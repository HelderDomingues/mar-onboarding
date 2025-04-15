
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Save } from "lucide-react";

type SystemSetting = {
  id: string;
  key: string;
  value: string;
  description?: string;
};

const generalFormSchema = z.object({
  site_name: z.string().min(2, {
    message: "O nome do site deve ter pelo menos 2 caracteres.",
  }),
  contact_email: z.string().email({
    message: "Por favor, insira um e-mail válido.",
  }),
  quiz_enabled: z.boolean(),
});

const notificationsFormSchema = z.object({
  user_signup_notification: z.boolean(),
  quiz_completion_notification: z.boolean(),
  notification_email: z.string().email({
    message: "Por favor, insira um e-mail válido.",
  }),
});

const SettingsPage = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [systemSettings, setSystemSettings] = useState<SystemSetting[]>([]);
  
  const generalForm = useForm<z.infer<typeof generalFormSchema>>({
    resolver: zodResolver(generalFormSchema),
    defaultValues: {
      site_name: "",
      contact_email: "",
      quiz_enabled: true,
    },
  });
  
  const notificationsForm = useForm<z.infer<typeof notificationsFormSchema>>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      user_signup_notification: true,
      quiz_completion_notification: true,
      notification_email: "",
    },
  });
  
  useEffect(() => {
    const checkAdminAndLoadSettings = async () => {
      if (!user) {
        navigate("/");
        return;
      }
      
      try {
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
        
        // Carregamento de configurações simulado
        // Em produção, carregaria do banco de dados
        const mockSettings: SystemSetting[] = [
          { id: '1', key: 'site_name', value: 'MAR - Mapa para Alto Rendimento', description: 'Nome do sistema' },
          { id: '2', key: 'contact_email', value: 'contato@crievalor.com.br', description: 'Email de contato' },
          { id: '3', key: 'quiz_enabled', value: 'true', description: 'Habilitar questionário' },
          { id: '4', key: 'user_signup_notification', value: 'true', description: 'Notificar novos registros' },
          { id: '5', key: 'quiz_completion_notification', value: 'true', description: 'Notificar conclusões de questionário' },
          { id: '6', key: 'notification_email', value: 'notificacoes@crievalor.com.br', description: 'Email para notificações' },
        ];
        
        setSystemSettings(mockSettings);
        
        // Preencher formulários com dados existentes
        generalForm.reset({
          site_name: mockSettings.find(s => s.key === 'site_name')?.value || '',
          contact_email: mockSettings.find(s => s.key === 'contact_email')?.value || '',
          quiz_enabled: mockSettings.find(s => s.key === 'quiz_enabled')?.value === 'true',
        });
        
        notificationsForm.reset({
          user_signup_notification: mockSettings.find(s => s.key === 'user_signup_notification')?.value === 'true',
          quiz_completion_notification: mockSettings.find(s => s.key === 'quiz_completion_notification')?.value === 'true',
          notification_email: mockSettings.find(s => s.key === 'notification_email')?.value || '',
        });
      } catch (error) {
        console.error('Erro ao verificar permissões de admin:', error);
        toast({
          title: "Erro de permissão",
          description: "Você não tem permissão para acessar esta página.",
          variant: "destructive",
        });
        navigate("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkAdminAndLoadSettings();
  }, [user, navigate, toast, generalForm, notificationsForm]);
  
  const onGeneralSubmit = (values: z.infer<typeof generalFormSchema>) => {
    // Em produção, salvaria no banco de dados
    console.log(values);
    toast({
      title: "Configurações gerais salvas",
      description: "As configurações gerais foram atualizadas com sucesso.",
    });
  };
  
  const onNotificationsSubmit = (values: z.infer<typeof notificationsFormSchema>) => {
    // Em produção, salvaria no banco de dados
    console.log(values);
    toast({
      title: "Configurações de notificações salvas",
      description: "As configurações de notificações foram atualizadas com sucesso.",
    });
  };
  
  if (!isAuthenticated || !isAdmin) {
    return null; // Será redirecionado no useEffect
  }
  
  return (
    <div className="container max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Configurações do Sistema</h1>
          <p className="text-muted-foreground mt-1">
            Gerencie as configurações gerais e comportamento do sistema.
          </p>
        </div>
      </div>
      
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full md:w-[400px] grid-cols-2">
          <TabsTrigger value="general">Geral</TabsTrigger>
          <TabsTrigger value="notifications">Notificações</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Configurações Gerais</CardTitle>
              <CardDescription>
                Configure os parâmetros básicos do sistema.
              </CardDescription>
            </CardHeader>
            <Form {...generalForm}>
              <form onSubmit={generalForm.handleSubmit(onGeneralSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={generalForm.control}
                    name="site_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome do Site</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do site" {...field} />
                        </FormControl>
                        <FormDescription>
                          Este nome será exibido no título do sistema.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="contact_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email de Contato</FormLabel>
                        <FormControl>
                          <Input placeholder="contato@exemplo.com.br" {...field} />
                        </FormControl>
                        <FormDescription>
                          Email para contato exibido no sistema.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={generalForm.control}
                    name="quiz_enabled"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Habilitar Questionário
                          </FormLabel>
                          <FormDescription>
                            Quando ativado, os usuários podem acessar o questionário MAR.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-5">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Configurações
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificações</CardTitle>
              <CardDescription>
                Configure como o sistema notificará eventos importantes.
              </CardDescription>
            </CardHeader>
            <Form {...notificationsForm}>
              <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)}>
                <CardContent className="space-y-4">
                  <FormField
                    control={notificationsForm.control}
                    name="notification_email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email para Notificações</FormLabel>
                        <FormControl>
                          <Input placeholder="notificacoes@exemplo.com.br" {...field} />
                        </FormControl>
                        <FormDescription>
                          Email para onde serão enviadas as notificações do sistema.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationsForm.control}
                    name="user_signup_notification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Notificar Novos Registros
                          </FormLabel>
                          <FormDescription>
                            Receber notificação quando um novo usuário se cadastrar.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={notificationsForm.control}
                    name="quiz_completion_notification"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Notificar Conclusões de Questionário
                          </FormLabel>
                          <FormDescription>
                            Receber notificação quando um usuário concluir o questionário MAR.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </CardContent>
                <CardFooter className="flex justify-end border-t pt-5">
                  <Button type="submit" className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Salvar Notificações
                  </Button>
                </CardFooter>
              </form>
            </Form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingsPage;
