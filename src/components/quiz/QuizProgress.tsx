
import { Progress } from "@/components/ui/progress";

interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
  currentModule?: number;
  totalModules?: number;
}

export function QuizProgress({ 
  currentStep, 
  totalSteps, 
  currentModule = 1, 
  totalModules = 1 
}: QuizProgressProps) {
  const progress = (currentStep / totalSteps) * 100;
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex justify-between mb-2 text-sm text-muted-foreground">
        <span>
          Módulo {currentModule}/{totalModules} - Questão {currentStep}/{totalSteps}
        </span>
        <span>{Math.round(progress)}% Completo</span>
      </div>
      <Progress value={progress} className="h-2 bg-gray-200" />
    </div>
  );
}
