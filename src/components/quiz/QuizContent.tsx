
import React, { useState, useEffect, useRef } from "react";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { QuizModule, QuizQuestion } from "@/types/quiz";
import { Button } from "@/components/ui/button";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizReview } from "@/components/quiz/QuizReview";
import { ArrowRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { logger } from "@/utils/logger";

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
  const timeMetricRef = useRef<any>(null);
  const questionStartTimeRef = useRef<number>(0);
  
  useEffect(() => {
    if (currentModule?.id) {
      if (timeMetricRef.current?.moduleId && timeMetricRef.current.moduleId !== currentModule.id) {
        const finalMetric = logger.endModuleTimer(timeMetricRef.current);
        console.log('Tempo total no módulo anterior:', finalMetric.duration);
      }
      
      timeMetricRef.current = logger.startModuleTimer(currentModule.id);
    }
    
    return () => {
      if (timeMetricRef.current?.moduleId) {
        logger.endModuleTimer(timeMetricRef.current);
      }
    };
  }, [currentModule?.id]);
  
  useEffect(() => {
    if (moduleQuestions && moduleQuestions.length > 0 && !showReview) {
      const currentQuestion = moduleQuestions[currentQuestionIndex];
      if (currentQuestion?.id) {
        if (questionStartTimeRef.current > 0) {
          const questionDuration = performance.now() - questionStartTimeRef.current;
          const previousQuestionIndex = 
            currentQuestionIndex > 0 ? currentQuestionIndex - 1 : 
            (currentModuleIndex > 0 ? allQuestions.filter(q => q.module_id === allModules[currentModuleIndex - 1].id).length - 1 : 0);
          
          const previousQuestion = 
            currentQuestionIndex > 0 ? moduleQuestions[previousQuestionIndex] : 
            (currentModuleIndex > 0 ? 
              allQuestions.filter(q => q.module_id === allModules[currentModuleIndex - 1].id)[previousQuestionIndex] : 
              null);
          
          if (previousQuestion) {
            logger.logQuestionTime(
              previousQuestion.module_id || '',
              previousQuestion.id,
              questionDuration
            );
          }
        }
        
        questionStartTimeRef.current = performance.now();
      }
    }
  }, [currentQuestionIndex, currentModuleIndex, moduleQuestions, showReview, allQuestions, allModules]);

  useEffect(() => {
    setFadeIn(false);
    const timer = setTimeout(() => setFadeIn(true), 50);
    return () => clearTimeout(timer);
  }, [currentQuestionIndex, currentModuleIndex]);

  const handleAnswer = (questionId: string, answer: string | string[]) => {
    if (currentModule?.id && questionStartTimeRef.current > 0) {
      const questionDuration = performance.now() - questionStartTimeRef.current;
      logger.logQuestionTime(currentModule.id, questionId, questionDuration);
      
      questionStartTimeRef.current = performance.now();
    }
    
    onAnswer(questionId, answer);
  };

  const handleReviewComplete = () => {
    if (timeMetricRef.current?.moduleId) {
      const finalMetric = logger.endModuleTimer(timeMetricRef.current);
      logger.info(`Questionário completo. Tempo total do último módulo: ${finalMetric.duration}ms`, {
        category: 'quiz',
        moduleId: timeMetricRef.current.moduleId,
        duration: finalMetric.duration,
        isReview: true
      });
    }
    
    onReviewComplete();
  };

  const renderQuestion = () => {
    if (!moduleQuestions || moduleQuestions.length === 0) {
      return <div className="text-center p-6 bg-slate-700 rounded-lg">
        <p className="text-white">Nenhuma pergunta disponível para este módulo.</p>
      </div>;
    }

    const currentQuestion = moduleQuestions[currentQuestionIndex];
    if (!currentQuestion) {
      return <div className="text-center p-6 bg-slate-700 rounded-lg">
        <p className="text-white">Pergunta não encontrada.</p>
      </div>;
    }

    const currentAnswer = currentAnswers[currentQuestion.id];

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
          onAnswer={handleAnswer}
          onNext={onNext}
          onPrev={onPrev}
          isFirst={currentQuestionIndex === 0 && currentModuleIndex === 0}
          isLast={currentQuestionIndex === moduleQuestions.length - 1 && currentModuleIndex === totalModules - 1}
          currentAnswer={currentAnswer}
        />
      </div>
    );
  };

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

  const renderModuleNavigation = () => {
    return (
      <div className="flex justify-between items-center w-full mt-8 max-w-2xl mx-auto quiz-content-navigation">
        <Button 
          variant="outline" 
          onClick={onPrev} 
          disabled={isFirst}
          className="flex items-center gap-2 text-white bg-slate-700 hover:bg-slate-800 border-slate-600 shadow-md"
        >
          <ArrowLeft size={16} />
          Anterior
        </Button>
        
        <div className="text-center text-sm text-white">
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
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border border-blue-500 shadow-md"
        >
          Próximo
          <ArrowRight size={16} />
        </Button>
      </div>
    );
  };

  const renderReview = () => {
    return (
      <QuizReview
        modules={allModules}
        questions={allQuestions}
        answers={currentAnswers}
        onComplete={handleReviewComplete}
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
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{currentModule.title}</h1>
            <Badge variant="outline" className="mt-2 sm:mt-0 bg-blue-600 text-white border-blue-500">
              Módulo {currentModuleIndex + 1}/{totalModules}
            </Badge>
          </div>
          <p className="text-slate-300">{currentModule.description}</p>
          
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
