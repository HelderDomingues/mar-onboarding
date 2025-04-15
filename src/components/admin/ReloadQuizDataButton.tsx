
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { seedQuizData } from "@/scripts/seed-quiz";
import { Loader2, RefreshCw } from "lucide-react";

export function ReloadQuizDataButton() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleReload = async () => {
    if (isLoading) return;
    
    try {
      setIsLoading(true);
      const success = await seedQuizData();
      
      if (success) {
        toast({
          title: "Dados carregados com sucesso!",
          description: "O questionário MAR foi recarregado corretamente com todas as 44 perguntas e suas opções.",
        });
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível recarregar o questionário. Verifique o console para mais detalhes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao recarregar questionário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao recarregar os dados do questionário.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleReload}
      disabled={isLoading}
      className="bg-blue-700 hover:bg-blue-800 flex items-center gap-2"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 animate-spin" />
          Recarregando dados...
        </>
      ) : (
        <>
          <RefreshCw className="h-4 w-4" />
          Recarregar dados do questionário
        </>
      )}
    </Button>
  );
}
