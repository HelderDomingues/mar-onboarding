import { QuestionCard, Question } from "@/components/quiz/QuestionCard";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizModule, QuizQuestion } from "@/types/quiz";
import { Card } from "@/components/ui/card";
import { BookOpen, Settings, ArrowRight, ArrowLeft } from "lucide-react";
import { QuizReview } from "@/components/quiz/QuizReview";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  if (!moduleQuestions || moduleQuestions.length === 0) {
    return null;
  }

  // Se estamos na tela de revisão, mostrar componente de revisão
  if (showReview) {
    return (
      <>
        {isAdmin && (
          <Card className="w-full max-w-2xl mb-4 p-3 border-orange-500 border-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-orange-500">Modo administrador</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowAdminPanel(!showAdminPanel)}
                className="bg-orange-50 border-orange-300"
              >
                <Settings className="h-4 w-4 mr-1" /> Painel admin
              </Button>
            </div>
          </Card>
        )}

        <QuizReview
          modules={allModules}
          questions={allQuestions}
          answers={currentAnswers}
          onComplete={onReviewComplete}
          onEdit={onEditQuestion}
        />
      </>
    );
  }

  const currentQuestion = moduleQuestions[currentQuestionIndex];
  
  // Determinar o tipo correto com base no texto da questão
  const getQuestionType = (question: QuizQuestion): typeof question.type => {
    if (
      question.text.toLowerCase().includes('instagram da empresa') ||
      question.text.toLowerCase().includes('instagram concorrente a') ||
      question.text.toLowerCase().includes('instagram concorrente b') ||
      question.text.toLowerCase().includes('instagram concorrente c')
    ) {
      return 'instagram';
    }
    return question.type;
  };

  // Funções para navegação administrativa
  const handleAdminModuleChange = (moduleIndex: string) => {
    const index = parseInt(moduleIndex);
    onEditQuestion(index, 0); // Ir para a primeira questão do módulo selecionado
  };

  const handleAdminQuestionChange = (questionIndex: string) => {
    onEditQuestion(currentModuleIndex, parseInt(questionIndex));
  };

  const handleJumpToReview = () => {
    onEditQuestion(allModules.length - 1, allQuestions.filter(q => q.module_id === allModules[allModules.length - 1].id).length - 1);
    setTimeout(() => onNext(), 100); // Forçar ir para a revisão após ir para a última questão
  };

  return (
    <>
      {isAdmin && (
        <Card className="w-full max-w-2xl mb-4 p-3 border-orange-500 border-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-orange-500">Modo administrador</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowAdminPanel(!showAdminPanel)}
              className="bg-orange-50 border-orange-300"
            >
              <Settings className="h-4 w-4 mr-1" /> {showAdminPanel ? "Ocultar painel" : "Mostrar painel"}
            </Button>
          </div>
          
          {showAdminPanel && (
            <div className="mt-3 p-3 bg-orange-50 rounded-md">
              <Tabs defaultValue="navigation">
                <TabsList className="mb-3">
                  <TabsTrigger value="navigation">Navegação</TabsTrigger>
                  <TabsTrigger value="info">Informações</TabsTrigger>
                </TabsList>
                
                <TabsContent value="navigation" className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-sm font-medium mb-1 block">Módulo</label>
                      <Select
                        value={currentModuleIndex.toString()}
                        onValueChange={handleAdminModuleChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar módulo" />
                        </SelectTrigger>
                        <SelectContent>
                          {allModules.map((module, index) => (
                            <SelectItem key={module.id} value={index.toString()}>
                              Módulo {index + 1}: {module.title}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <label className="text-sm font-medium mb-1 block">Questão</label>
                      <Select
                        value={currentQuestionIndex.toString()}
                        onValueChange={handleAdminQuestionChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecionar questão" />
                        </SelectTrigger>
                        <SelectContent>
                          {moduleQuestions.map((question, index) => (
                            <SelectItem key={question.id} value={index.toString()}>
                              Questão {index + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="flex gap-2 justify-between pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={onPrev}
                      disabled={isFirst}
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" /> Anterior
                    </Button>
                    
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={handleJumpToReview}
                    >
                      Ir para revisão
                    </Button>
                    
                    <Button 
                      variant="outline"
                      size="sm" 
                      onClick={onNext}
                    >
                      Próximo <ArrowRight className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </TabsContent>
                
                <TabsContent value="info">
                  <div className="text-sm space-y-2">
                    <div>
                      <span className="font-medium">ID do módulo:</span> {currentModule?.id}
                    </div>
                    <div>
                      <span className="font-medium">ID da questão:</span> {currentQuestion?.id}
                    </div>
                    <div>
                      <span className="font-medium">Tipo de questão:</span> {currentQuestion?.type}
                    </div>
                    <div>
                      <span className="font-medium">Questões no módulo:</span> {moduleQuestions.length}
                    </div>
                    <div>
                      <span className="font-medium">Obrigatória:</span> {currentQuestion?.required ? "Sim" : "Não"}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </Card>
      )}

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
          type: getQuestionType(currentQuestion),
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
