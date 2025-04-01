
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { logger } from "@/utils/logger";

export function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      logger.info('Tentativa de login iniciada', { tag: 'Login', data: { email } });
      await login(email, password);
      toast({
        title: "Login bem-sucedido",
        description: "Bem-vindo à área de membros!",
      });
    } catch (error) {
      logger.error('Falha no login', { tag: 'Login', data: error });
      toast({
        variant: "destructive",
        title: "Falha no login",
        description: "Por favor, verifique suas credenciais e tente novamente.",
      });
    } finally {
      setIsLoading(false);
    }
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
            />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="password" className="text-sm font-medium">Senha</label>
              <a href="#" className="text-xs text-quiz-dark hover:underline">
                Esqueceu sua senha?
              </a>
            </div>
            <Input
              id="password"
              type="password" 
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full"
            />
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
            Não tem uma conta? <a href="#" className="text-quiz hover:underline">Entre em contato</a>
          </p>
        </CardFooter>
      </form>
    </Card>
  );
}
