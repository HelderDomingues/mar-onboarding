import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

export function QuizReviewComponent({ onComplete }) {

  // Exemplo de dados fictícios, substitua pelos reais conforme necessário
  const modules = [
    { id: 'mod1', order_number: 1, title: 'Módulo 1' },
    { id: 'mod2', order_number: 2, title: 'Módulo 2' }
  ];
  const questions = [
    { id: 'q1', module_id: 'mod1', text: 'Pergunta 1 do módulo 1' },
    { id: 'q2', module_id: 'mod2', text: 'Pergunta 1 do módulo 2' }
  ];
  const answers = {
    q1: 'Resposta 1',
    q2: 'Resposta 2'
  };

  // Função para editar resposta
  const onEdit = (moduleIndex, questionIndex) => {
    // Implemente a lógica de edição conforme necessário
    alert(`Editar resposta do módulo ${moduleIndex + 1}, questão ${questionIndex + 1}`);
  };

  const getModuleQuestions = (moduleId) => {
    return questions.filter(q => q.module_id === moduleId);
  };

  const getAnswerDisplay = (answer) => {
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

export default QuizReviewComponent;