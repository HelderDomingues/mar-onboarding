
import React from "react";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizModule, QuizQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";

interface QuizContentProps {
  currentModule: QuizModule;
  moduleQuestions: QuizQuestion[];
  currentQuestionIndex: number;
  onAnswer: (questionId: string, answer: string | string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  currentAnswers: { [key: string]: string | string[] };
  totalModules: number;
  currentModuleIndex: number;
  showReview: boolean;
  onReviewComplete: () => void;
  onEditQuestion: (moduleIndex: number, questionIndex: number) => void;
  allModules: QuizModule[];
  allQuestions: QuizQuestion[];
  isAdmin: boolean;
}

export function QuizContent({
  currentModule,
  moduleQuestions,
  currentQuestionIndex,
  onAnswer,
  onNext,
  onPrev,
  isFirst,
  isLast,
  currentAnswers,
  totalModules,
  currentModuleIndex,
  showReview,
  onReviewComplete,
  onEditQuestion,
  allModules,
  allQuestions,
  isAdmin
}: QuizContentProps) {
  const renderQuestion = () => {
    if (!moduleQuestions || moduleQuestions.length === 0) {
      return <div>Nenhuma pergunta disponível para este módulo.</div>;
    }

    const currentQuestion = moduleQuestions[currentQuestionIndex];
    if (!currentQuestion) {
      return <div>Pergunta não encontrada.</div>;
    }

    // Use o ID da pergunta para encontrar a resposta atual
    const currentAnswer = currentAnswers[currentQuestion.id];

    // Mapeamos a pergunta do tipo QuizQuestion para o tipo Question aceito pelo QuestionCard
    const mappedQuestion = {
      id: currentQuestion.id,
      text: currentQuestion.text || currentQuestion.question_text || "",
      type: currentQuestion.type,
      options: currentQuestion.options,
      required: currentQuestion.required !== undefined ? currentQuestion.required : true,
      hint: currentQuestion.hint,
      max_options: currentQuestion.max_options,
      prefix: currentQuestion.prefix,
      validation: currentQuestion.validation,
      placeholder: currentQuestion.placeholder
    };

    return (
      <QuestionCard
        question={mappedQuestion}
        onAnswer={onAnswer}
        onNext={onNext}
        onPrev={onPrev}
        isFirst={currentQuestionIndex === 0 && currentModuleIndex === 0}
        isLast={currentQuestionIndex === moduleQuestions.length - 1 && currentModuleIndex === totalModules - 1}
        currentAnswer={currentAnswer}
      />
    );
  };

  const renderReview = () => {
    return (
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Revisão do Questionário</h2>
        <p className="text-muted-foreground">
          Por favor, revise suas respostas antes de finalizar.
        </p>
        
        {allModules.map((module, moduleIndex) => (
          <div key={module.id} className="space-y-2">
            <h3 className="text-xl font-semibold">Módulo {module.order_number}: {module.title}</h3>
            
            {allQuestions
              .filter(question => question.module_id === module.id)
              .map((question, questionIndex) => {
                const answer = currentAnswers[question.id];
                
                return (
                  <div key={question.id} className="border rounded-md p-4">
                    <p className="font-medium">{question.text}</p>
                    <p className="text-sm text-muted-foreground">
                      Resposta: {Array.isArray(answer) ? answer.join(', ') : answer || 'Não respondido'}
                    </p>
                    <Button
                      variant="link"
                      onClick={() => onEditQuestion(moduleIndex, questionIndex)}
                      className="text-blue-500 hover:underline"
                    >
                      Editar
                    </Button>
                  </div>
                );
              })}
          </div>
        ))}
        
        <Button onClick={onReviewComplete} className="quiz-btn text-white">
          Finalizar Questionário
        </Button>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      {isAdmin && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Modo Administrador Ativado!</strong>
          <span className="block sm:inline"> Você está visualizando o questionário como administrador.</span>
        </div>
      )}
      
      <h1 className="text-3xl font-bold mb-4">{currentModule.title}</h1>
      <p className="text-muted-foreground mb-8">{currentModule.description}</p>
      
      {showReview ? (
        renderReview()
      ) : (
        renderQuestion()
      )}
    </div>
  );
}
