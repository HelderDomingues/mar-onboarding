
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizModule, QuizQuestion } from "@/types/quiz";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Edit, ThumbsUp } from "lucide-react";

interface QuizReviewProps {
  modules: QuizModule[];
  questions: QuizQuestion[];
  answers: Record<string, string | string[]>;
  onComplete: () => void;
  onEdit: (moduleIndex: number, questionIndex: number) => void;
}

export function QuizReview({
  modules,
  questions,
  answers,
  onComplete,
  onEdit,
}: QuizReviewProps) {
  const [confirmed, setConfirmed] = useState(false);

  // Agrupar perguntas por módulo
  const questionsByModule = modules.map(module => ({
    module,
    questions: questions.filter(q => q.module_id === module.id)
  }));

  // Formatar o valor da resposta para exibição
  const formatAnswerValue = (value: string | string[] | undefined) => {
    if (!value) return "Sem resposta";
    if (typeof value === "string") return value;
    return value.join(", ");
  };

  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in space-y-6">
      {!confirmed ? (
        <>
          <Card className="quiz-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <ThumbsUp className="h-6 w-6 text-[hsl(var(--quiz-accent))]" />
                Revisão do Questionário MAR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-muted-foreground">
                Por favor, revise suas respostas abaixo para confirmar que estão corretas. 
                Você pode editar qualquer resposta clicando no botão de edição.
              </p>
              
              <div className="space-y-8">
                {questionsByModule.map((moduleData, moduleIndex) => (
                  <div key={moduleData.module.id} className="border border-[hsl(var(--quiz-border))] rounded-lg p-4">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Badge variant="outline" className="quiz-module-badge">
                        Módulo {moduleIndex + 1}
                      </Badge>
                      {moduleData.module.title}
                    </h3>
                    
                    <div className="space-y-4">
                      {moduleData.questions.map((question, questionIndex) => {
                        const answer = answers[question.id];
                        
                        return (
                          <div key={question.id} className="border-t border-[hsl(var(--quiz-border))] pt-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium">{question.text}</p>
                                <p className="text-muted-foreground mt-1 break-words">
                                  {formatAnswerValue(answer)}
                                </p>
                              </div>
                              
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="ml-2 border-[hsl(var(--quiz-border))]"
                                onClick={() => onEdit(moduleIndex, questionIndex)}
                              >
                                <Edit className="h-4 w-4 mr-1" /> Editar
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6 border-t border-[hsl(var(--quiz-border))]">
              <Button 
                variant="outline" 
                onClick={() => onEdit(modules.length - 1, questions.filter(q => q.module_id === modules[modules.length - 1].id).length - 1)}
                className="border-[hsl(var(--quiz-border))]"
              >
                Voltar
              </Button>
              <Button 
                onClick={() => setConfirmed(true)}
                className="quiz-btn"
              >
                Confirmar Respostas <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </>
      ) : (
        <Card className="quiz-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Respostas Confirmadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-center text-muted-foreground">
              Suas respostas foram validadas com sucesso. Clique abaixo para concluir o questionário.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button 
              onClick={onComplete}
              className="quiz-btn"
            >
              Finalizar Questionário
            </Button>
          </CardFooter>
        </Card>
      )}
    </div>
  );
}
