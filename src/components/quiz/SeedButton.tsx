
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { seedQuizData } from "@/scripts/seed-quiz";
import { Loader2 } from "lucide-react";

interface SeedButtonProps {
  onComplete: () => void;
}

export function SeedButton({ onComplete }: SeedButtonProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleSeed = async () => {
    try {
      setIsLoading(true);
      const success = await seedQuizData();
      
      if (success) {
        toast({
          title: "Dados inseridos com sucesso!",
          description: "O questionário MAR foi configurado corretamente.",
        });
        onComplete();
      } else {
        toast({
          title: "Erro",
          description: "Não foi possível configurar o questionário. Verifique o console para mais detalhes.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao configurar questionário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível configurar o questionário. Verifique o console para mais detalhes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleSeed}
      disabled={isLoading}
      className="bg-quiz hover:bg-quiz-dark flex items-center gap-2"
    >
      {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
      {isLoading ? "Configurando questionário..." : "Configurar questionário MAR"}
    </Button>
  );
}
