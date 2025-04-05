import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizModule, QuizQuestion } from "@/types/quiz";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Edit, ThumbsUp, Calendar, FileCheck, ArrowLeft } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
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
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [editedAnswers, setEditedAnswers] = useState<Record<string, string | string[]>>({
    ...answers
  });
  const {
    toast
  } = useToast();
  const form = useForm({
    defaultValues: {
      agreement: false
    }
  });
  useEffect(() => {
    setEditedAnswers({
      ...answers
    });
  }, [answers]);
  const currentDate = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
  const questionsByModule = modules.map(module => ({
    module,
    questions: questions.filter(q => q.module_id === module.id)
  }));
  const formatAnswerValue = (value: string | string[] | undefined) => {
    if (!value) return "Sem resposta";
    if (Array.isArray(value)) {
      return value.join(", ");
    }
    if (typeof value === "string") {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.join(", ");
        }
        return String(parsed);
      } catch (e) {
        return value;
      }
    }
    return String(value);
  };
  const handleTermsChange = (checked: boolean) => {
    setAgreedToTerms(checked);
  };
  const handleEditClick = (questionId: string) => {
    setEditingQuestionId(questionId);
  };
  const handleSaveEdit = async (questionId: string) => {
    try {
      const answer = editedAnswers[questionId];
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (userId) {
        const answerValue = typeof answer === 'object' ? JSON.stringify(answer) : answer;
        const {
          error
        } = await supabase.from('quiz_answers').upsert({
          user_id: userId,
          question_id: questionId,
          answer: answerValue
        }, {
          onConflict: 'user_id,question_id'
        });
        if (error) throw error;
        toast({
          title: "Resposta atualizada",
          description: "Sua resposta foi atualizada com sucesso."
        });
      }
    } catch (error) {
      console.error("Erro ao salvar resposta:", error);
      toast({
        title: "Erro ao atualizar resposta",
        description: "Não foi possível salvar sua resposta. Por favor, tente novamente.",
        variant: "destructive"
      });
    }
    setEditingQuestionId(null);
  };
  const handleCancelEdit = () => {
    setEditingQuestionId(null);
    setEditedAnswers({
      ...answers
    });
  };
  const handleInputChange = (questionId: string, value: string | string[]) => {
    setEditedAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };
  const handleCheckboxChange = (questionId: string, option: string, checked: boolean) => {
    let currentAnswers: string[] = [];
    if (Array.isArray(editedAnswers[questionId])) {
      currentAnswers = [...(editedAnswers[questionId] as string[])];
    } else if (typeof editedAnswers[questionId] === 'string') {
      try {
        const parsed = JSON.parse(editedAnswers[questionId] as string);
        if (Array.isArray(parsed)) {
          currentAnswers = [...parsed];
        } else {
          currentAnswers = [editedAnswers[questionId] as string];
        }
      } catch (e) {
        currentAnswers = [editedAnswers[questionId] as string];
      }
    }
    let newAnswers: string[];
    if (checked) {
      if (!currentAnswers.includes(option)) {
        newAnswers = [...currentAnswers, option];
      } else {
        newAnswers = currentAnswers;
      }
    } else {
      newAnswers = currentAnswers.filter(item => item !== option);
    }
    setEditedAnswers(prev => ({
      ...prev,
      [questionId]: newAnswers
    }));
  };
  const renderEditField = (question: QuizQuestion) => {
    const questionId = question.id;
    const answer = editedAnswers[questionId];
    switch (question.type) {
      case 'text':
      case 'email':
      case 'number':
      case 'url':
      case 'instagram':
        return <Input value={typeof answer === 'string' ? answer : ''} onChange={e => handleInputChange(questionId, e.target.value)} className="w-full text-slate-900" placeholder="Digite sua resposta aqui" type={question.type === 'number' ? 'number' : 'text'} />;
      case 'textarea':
        return <Textarea value={typeof answer === 'string' ? answer : ''} onChange={e => handleInputChange(questionId, e.target.value)} className="w-full text-slate-900" placeholder="Digite sua resposta aqui" />;
      case 'checkbox':
      case 'radio':
        const options = question.options?.map(opt => opt.text) || [];
        let selectedOptions: string[] = [];
        if (Array.isArray(answer)) {
          selectedOptions = answer;
        } else if (typeof answer === 'string') {
          try {
            const parsed = JSON.parse(answer);
            if (Array.isArray(parsed)) {
              selectedOptions = parsed;
            } else {
              selectedOptions = [answer];
            }
          } catch (e) {
            selectedOptions = [answer];
          }
        }
        return <div className="space-y-2">
            {options.map(option => <div key={option} className="flex items-center space-x-2">
                <Checkbox id={`${questionId}-${option}`} checked={selectedOptions.includes(option)} onCheckedChange={checked => handleCheckboxChange(questionId, option, checked === true)} />
                <label htmlFor={`${questionId}-${option}`} className="text-sm font-medium leading-none cursor-pointer text-slate-800">
                  {option}
                </label>
              </div>)}
          </div>;
      default:
        return <Input value={typeof answer === 'string' ? answer : ''} onChange={e => handleInputChange(questionId, e.target.value)} className="w-full text-slate-900" placeholder="Digite sua resposta aqui" />;
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
                  const questionId = question.id;
                  const isEditing = editingQuestionId === questionId;
                  const answer = editedAnswers[questionId];
                  return <div key={questionId} className="border-t border-[hsl(var(--quiz-border))] pt-3">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <p className="font-medium text-[hsl(var(--quiz-text))]">{question.text}</p>
                              
                              {isEditing ? <div className="mt-2 space-y-3">
                                  {renderEditField(question)}
                                  
                                  <div className="flex gap-2 justify-end mt-3">
                                    <Button variant="outline" size="sm" onClick={handleCancelEdit} className="text-slate-200">
                                      Cancelar
                                    </Button>
                                    <Button size="sm" onClick={() => handleSaveEdit(questionId)}>
                                      Salvar
                                    </Button>
                                  </div>
                                </div> : <p className="text-[hsl(var(--quiz-text))] opacity-80 mt-1 break-words">
                                  {formatAnswerValue(answer)}
                                </p>}
                            </div>
                            
                            {!isEditing && <Button variant="outline" size="sm" onClick={() => handleEditClick(questionId)} className="ml-2 border-[hsl(var(--quiz-border))] text-[hsl(var(--quiz-text))] text-slate-900">
                                <Edit className="h-4 w-4 mr-1" /> Editar
                              </Button>}
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
                  <label htmlFor="agreement" className="text-sm font-medium leading-none cursor-pointer text-white">
                    Concordo com os termos acima e confirmo a veracidade das informações
                  </label>
                </div>
                
                <div className="flex items-center gap-2 mt-4 text-sm text-[hsl(var(--quiz-text))] opacity-80">
                  <Calendar className="h-4 w-4" />
                  <span className="bg-zinc-600 hover:bg-zinc-500 text-slate-50 text-sm">Data de validação: {currentDate}</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-6 border-t border-[hsl(var(--quiz-border))]">
              <Button variant="outline" onClick={() => onEdit(modules.length - 1, questions.filter(q => q.module_id === modules[modules.length - 1].id).length - 1)} className="border-[hsl(var(--quiz-border))] text-[hsl(var(--quiz-text))]">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <Button onClick={() => setConfirmed(true)} disabled={!agreedToTerms} className="quiz-btn bg-lime-600 hover:bg-lime-500">
                Confirmar Respostas <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </> : <Card className="quiz-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white text-base font-normal">
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
            <Button onClick={onComplete} className="quiz-btn">
              Finalizar Questionário
            </Button>
          </CardFooter>
        </Card>}
    </div>;
}