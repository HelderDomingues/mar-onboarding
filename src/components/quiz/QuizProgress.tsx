
import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
}

export function QuizProgress({ currentStep, totalSteps }: QuizProgressProps) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex justify-between mb-2 text-sm text-muted-foreground">
        <span>Questão {currentStep} de {totalSteps}</span>
        <span>{Math.round(progress)}% Completo</span>
      </div>
      <Progress value={progress} className="h-2 bg-gray-200" />
    </div>
  );
}
