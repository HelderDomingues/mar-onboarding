
import React, { useState, useEffect } from "react";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizModule, QuizQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizReview } from "@/components/quiz/QuizReview";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const [fadeIn, setFadeIn] = useState(true);

  // Efeito para animação de fade quando muda de questão ou módulo
  useEffect(() => {
    setFadeIn(false);
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, currentModuleIndex]);

  const renderQuestion = () => {
    if (!moduleQuestions || moduleQuestions.length === 0) {
      return <div className="text-center p-6 bg-slate-100 rounded-lg">
        <p className="text-slate-600">Nenhuma pergunta disponível para este módulo.</p>
      </div>;
    }

    const currentQuestion = moduleQuestions[currentQuestionIndex];
    if (!currentQuestion) {
      return <div className="text-center p-6 bg-slate-100 rounded-lg">
        <p className="text-slate-600">Pergunta não encontrada.</p>
      </div>;
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
      <div className={`transition-opacity duration-300 ${fadeIn ? 'opacity-100' : 'opacity-0'}`}>
        <QuestionCard
          question={mappedQuestion}
          onAnswer={onAnswer}
          onNext={onNext}
          onPrev={onPrev}
          isFirst={currentQuestionIndex === 0 && currentModuleIndex === 0}
          isLast={currentQuestionIndex === moduleQuestions.length - 1 && currentModuleIndex === totalModules - 1}
          currentAnswer={currentAnswer}
        />
      </div>
    );
  };

  // Componente para mostrar o progresso entre módulos
  const renderModuleProgress = () => {
    const totalQuestionsInModule = moduleQuestions.length;
    
    return (
      <QuizProgress
        currentStep={currentQuestionIndex + 1}
        totalSteps={totalQuestionsInModule}
        currentModule={currentModuleIndex + 1}
        totalModules={totalModules}
      />
    );
  };

  // Componente para mostrar navegação entre módulos
  const renderModuleNavigation = () => {
    return (
      <div className="flex justify-between items-center w-full mt-8 max-w-2xl mx-auto">
        <Button 
          variant="outline" 
          onClick={onPrev} 
          disabled={isFirst}
          className="flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Anterior
        </Button>
        
        <div className="text-center text-sm text-muted-foreground">
          <span className="font-medium">
            Módulo {currentModuleIndex + 1} de {totalModules}
          </span>
          <br />
          <span>
            Pergunta {currentQuestionIndex + 1} de {moduleQuestions.length}
          </span>
        </div>
        
        <Button 
          onClick={onNext} 
          disabled={isLast}
          className="flex items-center gap-2 quiz-btn text-white"
        >
          Próximo
          <ArrowRight size={16} />
        </Button>
      </div>
    );
  };

  // Componente para renderizar a revisão final
  const renderReview = () => {
    return (
      <QuizReview
        modules={allModules}
        questions={allQuestions}
        answers={currentAnswers}
        onComplete={onReviewComplete}
        onEdit={onEditQuestion}
      />
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      {isAdmin && (
        <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded relative mb-4 w-full max-w-3xl" role="alert">
          <strong className="font-bold">Modo Administrador Ativado!</strong>
          <span className="block sm:inline"> Você está visualizando o questionário como administrador.</span>
        </div>
      )}
      
      {!showReview && (
        <div className="w-full max-w-3xl mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center mb-2">
            <h1 className="text-2xl sm:text-3xl font-bold">{currentModule.title}</h1>
            <Badge variant="outline" className="mt-2 sm:mt-0 quiz-module-badge">
              Módulo {currentModuleIndex + 1}/{totalModules}
            </Badge>
          </div>
          <p className="text-muted-foreground">{currentModule.description}</p>
          
          {renderModuleProgress()}
        </div>
      )}
      
      {showReview ? (
        renderReview()
      ) : (
        <>
          {renderQuestion()}
          {renderModuleNavigation()}
        </>
      )}
    </div>
  );
}
