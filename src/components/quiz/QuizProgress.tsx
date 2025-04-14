import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Check, ArrowRight } from "lucide-react";
interface QuizProgressProps {
  currentStep: number;
  totalSteps: number;
  currentModule: number;
  totalModules: number;
}
export function QuizProgress({
  currentStep,
  totalSteps,
  currentModule,
  totalModules
}: QuizProgressProps) {
  const progressInModule = currentStep / totalSteps * 100;
  const totalProgress = (currentModule - 1) / totalModules * 100 + progressInModule / totalModules;

  // Gerar etapas para visualização
  const steps = Array.from({
    length: totalModules
  }, (_, i) => i + 1);
  return <div className="w-full max-w-2xl mx-auto mb-8 space-y-4 my-[30px]">
      {/* Indicador de módulo e questão */}
      <div className="flex justify-between mb-2 text-sm">
        <Badge variant="outline" className="quiz-module-badge">
          Módulo {currentModule}/{totalModules}
        </Badge>
        <Badge variant="outline" className="border-[hsl(var(--quiz-border))] bg-sky-300">
          Questão {currentStep}/{totalSteps}
        </Badge>
      </div>
      
      {/* Barra de progresso principal */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso geral</span>
          <span>{Math.round(totalProgress)}%</span>
        </div>
        <div className="quiz-progress-bar overflow-hidden">
          <div className="quiz-progress-value transition-all duration-300 ease-in-out" style={{
          width: `${totalProgress}%`
        }} />
        </div>
      </div>
      
      {/* Módulos como passos */}
      <div className="flex justify-between items-center pt-4 my-[30px]">
        {steps.map(step => <div key={step} className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-all ${step < currentModule ? "bg-[hsl(var(--quiz-accent))] text-white" : step === currentModule ? "bg-[hsl(var(--quiz-accent-hover))] text-white ring-4 ring-[hsl(var(--quiz-accent))]/20" : "bg-[hsl(var(--quiz-progress-bg))] text-muted-foreground"}`}>
              {step < currentModule ? <Check size={16} /> : step}
            </div>
            
            {/* Conectores entre os passos */}
            {step < totalModules && <div className="flex-1 h-[2px] mx-2 bg-[hsl(var(--quiz-progress-bg))]">
                <div className="h-full bg-[hsl(var(--quiz-accent))] transition-all duration-500" style={{
            width: step < currentModule ? "100%" : "0%"
          }} />
              </div>}
          </div>)}
      </div>
      
      {/* Progresso do módulo atual */}
      <div className="space-y-1 pt-2">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Progresso do módulo atual</span>
          <span>{Math.round(progressInModule)}%</span>
        </div>
        <div className="quiz-progress-bar overflow-hidden">
          <div className="quiz-progress-value transition-all duration-300 ease-in-out" style={{
          width: `${progressInModule}%`
        }} />
        </div>
      </div>
    </div>;
}