
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

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
  const totalProgress = ((currentModule - 1) / totalModules) * 100 + (progress / totalModules);
  
  return (
    <div className="w-full max-w-2xl mx-auto mb-8">
      <div className="flex justify-between mb-2 text-sm">
        <span className="flex items-center gap-2">
          <Badge variant="secondary">Módulo {currentModule}/{totalModules}</Badge>
          <Badge variant="outline">Questão {currentStep}/{totalSteps}</Badge>
        </span>
        <Badge variant="primary" className="bg-quiz text-white">
          {Math.round(totalProgress)}% Completo
        </Badge>
      </div>
      <Progress value={progress} className="h-2 bg-gray-200" />
    </div>
  );
}
