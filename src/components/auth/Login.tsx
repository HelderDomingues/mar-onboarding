
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoading) return; // Evitar múltiplos cliques
    
    setIsLoading(true);
    
    try {
      logger.info('Tentativa de login iniciada', { tag: 'Login', data: { email } });
      addLogEntry('auth', 'Tentativa de login iniciada', { email });
      
      const result = await login(email, password);
      
      if (result.success) {
        toast({
          title: "Login bem-sucedido",
          description: "Bem-vindo à área de membros!",
        });
        
        // Usar um timeout para garantir que a navegação ocorra após o processamento do estado de autenticação
        setTimeout(() => {
          logger.info('Login bem-sucedido, redirecionando para dashboard', { tag: 'Login' });
          addLogEntry('auth', 'Login bem-sucedido, redirecionando para dashboard', { email });
          navigate("/dashboard", { replace: true });
        }, 100);
      } else {
        toast({
          variant: "destructive",
          title: "Falha no login",
          description: result.message || "Verifique suas credenciais e tente novamente.",
        });
        
        addLogEntry('error', 'Falha no login', { message: result.message, email });
        setIsLoading(false);
      }
    } catch (error) {
      logger.error('Falha no login', { tag: 'Login', data: error });
      addLogEntry('error', 'Exceção durante login', { error, email });
      
      toast({
        variant: "destructive",
        title: "Falha no login",
        description: "Por favor, verifique suas credenciais e tente novamente.",
      });
      
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Bem-vindo(a)</CardTitle>
        <CardDescription>Acesse sua área exclusiva de membros</CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="email" className="text-sm font-medium">Email</label>
            <Input
              id="email"
              type="email"
              placeholder="seu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">Senha</label>
              <a href="#" className="text-xs text-quiz-dark hover:underline">
                Esqueceu sua senha?
              </a>
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full pr-10"
                disabled={isLoading}
              />
              <button 
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm leading-5"
                onClick={togglePasswordVisibility}
                disabled={isLoading}
              >
                {showPassword ? 
                  <EyeOff className="h-5 w-5 text-gray-400" /> : 
                  <Eye className="h-5 w-5 text-gray-400" />}
              </button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button 
            type="submit" 
            className="w-full bg-quiz hover:bg-quiz-dark"
            disabled={isLoading}
          >
            {isLoading ? "Entrando..." : "Entrar"}
          </Button>
          <p className="text-sm text-center text-muted-foreground">
            Não tem uma conta? <a href="https://crievalor.com.br/contato" className="text-quiz hover:underline">Entre em contato</a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
