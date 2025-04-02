
import { QuestionCard, Question } from "@/components/quiz/QuestionCard";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizModule, QuizQuestion } from "@/types/quiz";
import { Card } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { QuizReview } from "@/components/quiz/QuizReview";

interface QuizContentProps {
  currentModule: QuizModule;
  moduleQuestions: QuizQuestion[];
  currentQuestionIndex: number;
  onAnswer: (questionId: string, answer: string | string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  currentAnswers: Record<string, string | string[]>;
  totalModules: number;
  currentModuleIndex: number;
  showReview: boolean;
  onReviewComplete: () => void;
  onEditQuestion: (moduleIndex: number, questionIndex: number) => void;
  allModules: QuizModule[];
  allQuestions: QuizQuestion[];
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
  allQuestions
}: QuizContentProps) {
  if (!moduleQuestions || moduleQuestions.length === 0) {
    return null;
  }

  // Se estamos na tela de revisão, mostrar componente de revisão
  if (showReview) {
    return (
      <QuizReview
        modules={allModules}
        questions={allQuestions}
        answers={currentAnswers}
        onComplete={onReviewComplete}
        onEdit={onEditQuestion}
      />
    );
  }

  const currentQuestion = moduleQuestions[currentQuestionIndex];

  return (
    <>
      <Card className="w-full max-w-2xl mb-6 p-6 quiz-card">
        <div className="flex items-start gap-3">
          <div className="bg-[hsl(var(--quiz-accent))] p-2 rounded-full">
            <BookOpen className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">
              {currentModule?.title}
            </h2>
            {currentModule?.description && (
              <p className="text-muted-foreground">
                {currentModule?.description}
              </p>
            )}
          </div>
        </div>
      </Card>

      <QuizProgress 
        currentStep={currentQuestionIndex + 1} 
        totalSteps={moduleQuestions.length} 
        currentModule={currentModuleIndex + 1} 
        totalModules={totalModules} 
      />
      
      <QuestionCard 
        question={{
          id: currentQuestion.id,
          text: currentQuestion.text,
          type: currentQuestion.type,
          options: currentQuestion.options?.map(o => o.text),
          required: currentQuestion.required,
          hint: currentQuestion.hint || undefined
        }}
        onAnswer={onAnswer}
        onNext={onNext}
        onPrev={onPrev}
        isFirst={isFirst}
        isLast={isLast}
        currentAnswer={currentAnswers[currentQuestion.id]}
      />
    </>
  );
}
