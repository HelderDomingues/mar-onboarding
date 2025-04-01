
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
        <CardTitle className="text-2xl font-bold">Questionário Concluído!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">
          Obrigado por completar o questionário MAR. Suas respostas foram salvas com sucesso e nossa equipe entrará em contato em breve.
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
