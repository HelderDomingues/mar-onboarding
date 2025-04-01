
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuizComplete() {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader className="text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <CardTitle className="text-2xl font-bold">Questionário MAR Concluído!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground mb-4">
          Obrigado por completar o questionário MAR (Mapa para Alto Rendimento). 
        </p>
        <p className="text-center text-muted-foreground">
          Suas respostas foram salvas com sucesso e nossa equipe da Crie Valor irá analisá-las para preparar um relatório personalizado para o seu negócio.
        </p>
        <p className="text-center text-muted-foreground mt-4">
          Em breve, entraremos em contato para apresentar os resultados e discutir as próximas etapas.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={() => navigate("/dashboard")} 
          className="bg-quiz hover:bg-quiz-dark"
        >
          Voltar para o Painel
        </Button>
      </CardFooter>
    </Card>
  );
}
