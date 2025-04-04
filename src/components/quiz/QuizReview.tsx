
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizModule, QuizQuestion } from "@/types/quiz";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Edit, ThumbsUp, Calendar, FileCheck } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";

interface QuizReviewProps {
  modules: QuizModule[];
  questions: QuizQuestion[];
  answers: Record<string, string | string[]>;
  onComplete: () => void;
  onEdit: (moduleIndex: number, questionIndex: number) => void;
}

export function QuizReview({
  modules,
  questions,
  answers,
  onComplete,
  onEdit
}: QuizReviewProps) {
  const [confirmed, setConfirmed] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const form = useForm({
    defaultValues: {
      agreement: false
    }
  });

  // Data atual formatada para português do Brasil
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  // Agrupar perguntas por módulo
  const questionsByModule = modules.map(module => ({
    module,
    questions: questions.filter(q => q.module_id === module.id)
  }));

  // Formatar o valor da resposta para exibição
  const formatAnswerValue = (value: string | string[] | undefined) => {
    if (!value) return "Sem resposta";
    if (typeof value === "string") return value;
    return value.join(", ");
  };

  const handleTermsChange = (checked: boolean) => {
    setAgreedToTerms(checked);
  };

  const handleComplete = () => {
    try {
      onComplete();
    } catch (error) {
      console.error("Erro ao finalizar questionário:", error);
      // Exibir mensagem de erro para o usuário
      alert("Ocorreu um erro ao finalizar o questionário. Por favor, tente novamente.");
    }
  };

  return <div className="w-full max-w-3xl mx-auto animate-fade-in space-y-6">
      {!confirmed ? <>
          <Card className="quiz-card">
            <CardHeader>
              <CardTitle className="text-2xl font-bold flex items-center gap-2">
                <ThumbsUp className="h-6 w-6 text-[hsl(var(--quiz-accent))]" />
                Revisão do Questionário MAR
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-6 text-[hsl(var(--quiz-text))]">
                Por favor, revise suas respostas abaixo para confirmar que estão corretas. 
                Você pode editar qualquer resposta clicando no botão de edição.
              </p>
              
              <div className="space-y-8">
                {questionsByModule.map((moduleData, moduleIndex) => <div key={moduleData.module.id} className="border border-[hsl(var(--quiz-border))] rounded-lg p-4">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2 text-[hsl(var(--quiz-text))]">
                      <Badge variant="outline" className="quiz-module-badge">
                        Módulo {moduleIndex + 1}
                      </Badge>
                      {moduleData.module.title}
                    </h3>
                    
                    <div className="space-y-4">
                      {moduleData.questions.map((question, questionIndex) => {
                  const answer = answers[question.id];
                  return <div key={question.id} className="border-t border-[hsl(var(--quiz-border))] pt-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-[hsl(var(--quiz-text))]">{question.text}</p>
                                <p className="text-[hsl(var(--quiz-text))] opacity-80 mt-1 break-words">
                                  {formatAnswerValue(answer)}
                                </p>
                              </div>
                              
                              <Button variant="outline" size="sm" onClick={() => onEdit(moduleIndex, questionIndex)} className="ml-2 border-[hsl(var(--quiz-border))] text-[hsl(var(--quiz-text))] text-zinc-950">
                                <Edit className="h-4 w-4 mr-1" /> Editar
                              </Button>
                            </div>
                          </div>;
                })}
                    </div>
                  </div>)}
              </div>
              
              <div className="mt-8 p-4 border border-[hsl(var(--quiz-border))] rounded-lg bg-slate-800">
                <div className="flex items-start gap-2 mb-4">
                  <FileCheck className="h-5 w-5 mt-1 text-[hsl(var(--quiz-accent))]" />
                  <div>
                    <h4 className="font-semibold text-[hsl(var(--quiz-text))]">Termo de Validação</h4>
                    <p className="text-sm text-[hsl(var(--quiz-text))] opacity-90">
                      Para finalizar o questionário, por favor leia e concorde com os termos abaixo.
                    </p>
                  </div>
                </div>
                
                <div className="p-3 bg-slate-700 rounded border border-slate-600 text-sm mb-4">
                  <p className="text-[hsl(var(--quiz-text))]">
                    Declaro que as informações fornecidas neste questionário são verdadeiras e
                    condizem com a realidade atual da minha empresa/negócio.
                    Compreendo que estas informações serão utilizadas pela Crie Valor para análise
                    e diagnóstico, e que a precisão destas informações é fundamental para o sucesso do trabalho.
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  <Checkbox id="agreement" checked={agreedToTerms} onCheckedChange={handleTermsChange} className="border-white" />
                  <label htmlFor="agreement" className="text-sm font-medium leading-none cursor-pointer text-[hsl(var(--quiz-text))]">
                    Concordo com os termos acima e confirmo a veracidade das informações
                  </label>
                </div>
                
                <div className="flex items-center gap-2 mt-4 text-sm text-[hsl(var(--quiz-text))] opacity-80">
                  <Calendar className="h-4 w-4" />
                  <span className="bg-zinc-600 hover:bg-zinc-500 text-slate-50">Data de validação: {currentDate}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6 border-t border-[hsl(var(--quiz-border))]">
              <Button variant="outline" onClick={() => onEdit(modules.length - 1, questions.filter(q => q.module_id === modules[modules.length - 1].id).length - 1)} className="border-[hsl(var(--quiz-border))] text-[hsl(var(--quiz-text))]">
                Voltar
              </Button>
              <Button onClick={() => setConfirmed(true)} disabled={!agreedToTerms} className="quiz-btn bg-lime-600 hover:bg-lime-500">
                Confirmar Respostas <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </> : <Card className="quiz-card">
          <CardHeader>
            <CardTitle className="text-2xl font-bold flex items-center gap-2">
              <CheckCircle className="h-6 w-6 text-green-500" />
              Respostas Confirmadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="mb-4 text-center text-[hsl(var(--quiz-text))]">
              Suas respostas foram validadas com sucesso. Clique abaixo para concluir o questionário.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleComplete} className="quiz-btn">
              Finalizar Questionário
            </Button>
          </CardFooter>
        </Card>}
    </div>;
}
