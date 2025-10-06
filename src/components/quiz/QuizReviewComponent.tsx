import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

export function QuizReviewComponent({ onComplete, modules: propModules, questions: propQuestions, answers: propAnswers, onEdit: propOnEdit }) {
  const [incompleteModules, setIncompleteModules] = useState([]);

  // Mock fallback data (kept for development). The component now prefers props passed from the parent.
  const defaultModules = [
    { id: 'mod1', order_number: 1, title: 'Módulo 1' },
    { id: 'mod2', order_number: 2, title: 'Módulo 2' }
  ];
  const defaultQuestions = [
    { id: 'q1', module_id: 'mod1', text: 'Pergunta 1 do módulo 1' },
    { id: 'q2', module_id: 'mod2', text: 'Pergunta 1 do módulo 2' }
  ];
  const defaultAnswers = {
    q1: 'Resposta 1',
    q2: 'Resposta 2'
  };

  // Use props when provided; otherwise fall back to defaults
  const modules = (Array.isArray(propModules) && propModules.length) ? propModules : defaultModules;
  const questions = (Array.isArray(propQuestions) && propQuestions.length) ? propQuestions : defaultQuestions;
  const answers = propAnswers || defaultAnswers;

  // Função para editar resposta: usa a função recebida pelo pai se fornecida, senão fallback de alerta
  const onEdit = typeof propOnEdit === 'function'
    ? propOnEdit
    : (moduleIndex, questionIndex) => {
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
  
  // CAMADA 2: Validar completude antes de finalizar
  useEffect(() => {
    const validateCompletion = () => {
      const incomplete = [];
      
      modules.forEach((module) => {
        const moduleQuestions = getModuleQuestions(module.id);
        const requiredQuestions = moduleQuestions.filter(q => q.required);
        const unanswered = requiredQuestions.filter(q => {
          const answer = answers[q.id];
          return !answer || (Array.isArray(answer) && answer.length === 0) || answer === '';
        });
        
        if (unanswered.length > 0) {
          incomplete.push({
            module,
            unansweredCount: unanswered.length,
            unansweredQuestions: unanswered
          });
        }
      });
      
      setIncompleteModules(incomplete);
    };
    
    validateCompletion();
  }, [modules, questions, answers]);
  
  const handleCompleteClick = () => {
    if (incompleteModules.length > 0) {
      return; // O botão estará desabilitado, mas esta é uma camada extra de proteção
    }
    onComplete();
  };

  return (
    <div className="space-y-6">
      {incompleteModules.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Questionário Incompleto</AlertTitle>
          <AlertDescription>
            Você ainda tem {incompleteModules.reduce((sum, m) => sum + m.unansweredCount, 0)} pergunta(s) obrigatória(s) não respondida(s) em {incompleteModules.length} módulo(s).
            Por favor, complete todas as perguntas obrigatórias antes de finalizar.
          </AlertDescription>
        </Alert>
      )}
      
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
              const requiredCount = moduleQuestions.filter(q => q.required).length;
              const answeredRequired = moduleQuestions.filter(q => {
                const answer = answers[q.id];
                return q.required && answer && answer !== '' && !(Array.isArray(answer) && answer.length === 0);
              }).length;
              const isModuleComplete = answeredRequired >= requiredCount;
              const incompleteInfo = incompleteModules.find(m => m.module.id === module.id);
              
              return (
                <AccordionItem key={module.id} value={module.id}>
                  <AccordionTrigger className="text-left">
                    <div className="flex items-center gap-2 w-full">
                      <div className="flex-1">
                        <h3 className="font-semibold">Módulo {module.order_number}: {module.title}</h3>
                        <p className="text-sm text-muted-foreground">{moduleQuestions.length} questões</p>
                      </div>
                      <Badge variant={isModuleComplete ? "default" : "destructive"} className="ml-auto mr-2">
                        {answeredRequired}/{requiredCount} obrigatórias
                      </Badge>
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
          
          <div className="mt-6 flex flex-col items-center gap-4">
            {incompleteModules.length > 0 && (
              <p className="text-sm text-destructive">
                Complete todas as perguntas obrigatórias para finalizar o questionário
              </p>
            )}
            <Button 
              onClick={handleCompleteClick} 
              size="lg"
              disabled={incompleteModules.length > 0}
            >
              Finalizar Questionário
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default QuizReviewComponent;