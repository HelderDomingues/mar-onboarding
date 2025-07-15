import React from 'react';
import { QuizModule, QuizQuestion } from '@/types/quiz';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { recoveryLogger } from '@/utils/recoveryLogger';

interface QuizReviewComponentProps {
  modules: QuizModule[];
  questions: QuizQuestion[];
  answers: Record<string, string | string[]>;
  onComplete: () => void;
  onEdit: (moduleIndex: number, questionIndex: number) => void;
}

export function QuizReviewComponent({
  modules,
  questions,
  answers,
  onComplete,
  onEdit
}: QuizReviewComponentProps) {
  
  React.useEffect(() => {
    recoveryLogger.infoStep('FASE2', 'QUIZ_REVIEW', 'QuizReviewComponent carregado', {
      modulesCount: modules.length,
      questionsCount: questions.length,
      answersCount: Object.keys(answers).length
    });
  }, [modules, questions, answers]);

  const getModuleQuestions = (moduleId: string) => {
    return questions.filter(q => q.module_id === moduleId);
  };

  const getAnswerDisplay = (answer: string | string[]) => {
    if (Array.isArray(answer)) {
      return answer.join(', ');
    }
    return answer || 'Não respondido';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Revisão das Suas Respostas</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            Revise suas respostas antes de finalizar o questionário. Você pode editar qualquer resposta clicando no botão "Editar".
          </p>
          
          <Accordion type="single" collapsible className="space-y-4">
            {modules.map((module, moduleIndex) => {
              const moduleQuestions = getModuleQuestions(module.id);
              
              return (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="text-left">
                    <div>
                      <h3 className="font-semibold">Módulo {module.order_number}: {module.title}</h3>
                      <p className="text-sm text-muted-foreground">{moduleQuestions.length} questões</p>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="space-y-4">
                      {moduleQuestions.map((question, questionIndex) => (
                        <div key={question.id} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">{question.text}</h4>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onEdit(moduleIndex, questionIndex)}
                            >
                              Editar
                            </Button>
                          </div>
                          <div className="bg-muted p-3 rounded">
                            <strong>Resposta:</strong> {getAnswerDisplay(answers[question.id])}
                          </div>
                        </div>
                      ))}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              );
            })}
          </Accordion>
          
          <div className="mt-6 flex justify-center">
            <Button onClick={onComplete} size="lg">
              Finalizar Questionário
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}