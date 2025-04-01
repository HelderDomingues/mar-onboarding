
import { QuestionCard, Question } from "@/components/quiz/QuestionCard";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizModule, QuizQuestion } from "@/types/quiz";

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
  currentModuleIndex
}: QuizContentProps) {
  if (!moduleQuestions || moduleQuestions.length === 0) {
    return null;
  }

  const currentQuestion = moduleQuestions[currentQuestionIndex];

  return (
    <>
      <div className="w-full max-w-2xl mb-6">
        <h2 className="text-2xl font-bold mb-2">
          {currentModule?.title}
        </h2>
        {currentModule?.description && (
          <p className="text-muted-foreground">
            {currentModule?.description}
          </p>
        )}
      </div>

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
