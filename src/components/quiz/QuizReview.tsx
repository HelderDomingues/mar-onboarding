import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { QuizModule, QuizQuestion } from "@/types/quiz";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, CheckCircle, Edit, ThumbsUp, Calendar, FileCheck, ArrowLeft, AlertCircle } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { completeQuizManually } from "@/utils/supabaseUtils";
import { logger } from "@/utils/logger";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { formatJsonAnswer, normalizeAnswerToArray, prepareAnswerForStorage } from "@/utils/formatUtils";

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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [errorDetails, setErrorDetails] = useState<any>(null);
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

  const getOptionText = (option: any): string => {
    return typeof option === 'string' ? option : option.text;
  };

  const getOptionValue = (option: any): string => {
    return typeof option === 'string' ? option : option.id;
  };

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

  const handleTermsChange = (checked: boolean) => {
    setAgreedToTerms(checked);
  };

  const handleEditClick = (questionId: string) => {
    setEditingQuestionId(questionId);
  };

  const handleSaveEdit = async (questionId: string) => {
    try {
      const answer = editedAnswers[questionId];
      const {
        data: {
          session
        }
      } = await supabase.auth.getSession();
      const userId = session?.user?.id;
      if (!userId) {
        throw new Error("Usuário não autenticado");
      }
      
      const currentQuestion = questions.find(q => q.id === questionId);
      if (!currentQuestion) {
        throw new Error("Pergunta não encontrada");
      }
      
      const isMultipleChoice = ['checkbox', 'radio'].includes(currentQuestion.type || '');
      
      const answerValue = prepareAnswerForStorage(answer, isMultipleChoice);
      
      const userEmail = session?.user?.email;
      
      if (!userEmail) {
        throw new Error("Email do usuário não encontrado na sessão");
      }
      
      logger.info('Salvando resposta editada', {
        tag: 'Quiz',
        data: { 
          questionId, 
          userId, 
          userEmail,
          questionText: currentQuestion.question_text || currentQuestion.text
        }
      });
      
      const {
        error
      } = await supabase.from('quiz_answers').upsert({
        user_id: userId,
        user_email: userEmail,
        question_id: questionId,
        answer: answerValue,
        question_text: currentQuestion.question_text || currentQuestion.text,
        module_id: currentQuestion.module_id
      }, {
        onConflict: 'user_id,question_id'
      });
      
      if (error) throw error;
      
      logger.info('Resposta atualizada com sucesso na revisão', {
        tag: 'Quiz',
        data: { questionId, userId }
      });
      
      toast({
        title: "Resposta atualizada",
        description: "Sua resposta foi atualizada com sucesso."
      });
    } catch (error: any) {
      logger.error("Erro ao salvar resposta:", {
        tag: 'Quiz',
        data: { 
          questionId, 
          error: error.message || JSON.stringify(error),
          errorDetails: error.details || null,
          errorCode: error.code
        }
      });
      
      toast({
        title: "Erro ao atualizar resposta",
        description: `Não foi possível salvar sua resposta: ${error.message || 'Erro desconhecido'}`,
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
    const currentAnswers = normalizeAnswerToArray(editedAnswers[questionId] || []);
    
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

  const handleCompleteQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionError(null);
    setErrorDetails(null);
    try {
      setConfirmed(true);
    } catch (error) {
      console.error("Erro ao preparar finalização:", error);
      toast({
        title: "Erro ao preparar finalização",
        description: "Ocorreu um erro ao preparar a finalização do questionário. Por favor, tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalizeQuiz = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    setSubmissionError(null);
    setErrorDetails(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !user.id) {
        throw new Error("Usuário não autenticado");
      }
      
      const userId = user.id;
      const userEmail = user.email;
      
      if (!userEmail) {
        throw new Error("Email do usuário não encontrado na sessão");
      }
      
      logger.info('Iniciando finalização do questionário', {
        tag: 'Quiz',
        userId,
        data: { userEmail }
      });
      
      const result = await completeQuizManually(userId);
      
      if (!result.success) {
        const errorDetails = {
          message: result.error?.message || "Falha ao completar questionário",
          details: result.details || result.error?.details || "Sem detalhes adicionais",
          code: result.errorCode || result.error?.code || "UNKNOWN_ERROR",
          hint: result.errorHint || result.error?.hint || "Tente novamente ou contate o suporte"
        };
        
        logger.error("Erro detalhado na finalização:", {
          tag: 'Quiz',
          data: errorDetails
        });
        
        throw errorDetails;
      }
      
      logger.info('Questionário marcado como completo com sucesso', {
        tag: 'Quiz',
        data: { userId, method: result.method }
      });
      
      await onComplete();
    } catch (error: any) {
      logger.error("Erro na finalização:", {
        tag: 'Quiz',
        data: { 
          error, 
          errorMessage: error.message || 'Erro desconhecido',
          errorDetails: error.details || null,
          errorCode: error.code || null,
          errorHint: error.hint || null,
          fullError: JSON.stringify(error)
        }
      });
      
      let detailedError = "Não foi possível finalizar o questionário.";
      
      if (error.message) {
        detailedError += ` Detalhes do erro: ${error.message}`;
      }
      
      if (error.code) {
        detailedError += ` (Código: ${error.code})`;
      }
      
      if (error.hint) {
        detailedError += ` Dica: ${error.hint}`;
      }
      
      setSubmissionError(detailedError);
      
      setErrorDetails({
        origem: typeof error.direct === 'object' && error.direct ? 'Erro no método direto' : 
               (typeof error.rpc === 'object' && error.rpc ? 'Erro no método RPC' : 'Erro geral'),
        mensagem: error.message || (error.direct?.message || error.rpc?.message) || 'Erro desconhecido',
        código: error.code || (error.direct?.code || error.rpc?.code),
        dica: error.hint || (error.direct?.hint || error.rpc?.hint),
        detalhes: error.details || (error.direct?.details || error.rpc?.details) || JSON.stringify(error)
      });
      
      toast({
        title: "Erro ao finalizar questionário",
        description: detailedError,
        variant: "destructive"
      });
      
      setConfirmed(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderEditField = (question: QuizQuestion) => {
    const questionId = question.id;
    const answer = editedAnswers[questionId];
    const questionType = question.type || question.question_type || 'text';
    
    switch (questionType) {
      case 'text':
      case 'email':
      case 'number':
      case 'url':
      case 'instagram':
        return <Input 
          value={typeof answer === 'string' ? answer : ''} 
          onChange={e => handleInputChange(questionId, e.target.value)} 
          className="w-full text-slate-900" 
          placeholder="Digite sua resposta aqui" 
          type={questionType === 'number' ? 'number' : 'text'} 
        />;
        
      case 'textarea':
        return <Textarea 
          value={typeof answer === 'string' ? answer : ''} 
          onChange={e => handleInputChange(questionId, e.target.value)} 
          className="w-full text-slate-900" 
          placeholder="Digite sua resposta aqui" 
        />;
        
      case 'checkbox':
      case 'radio':
        const questionOptions = question.options || [];
        const options: string[] = [];
        const optionTexts: Record<string, string> = {};
        
        questionOptions.forEach(opt => {
          if (typeof opt === 'string') {
            options.push(opt);
            optionTexts[opt] = opt;
          } else {
            const optVal = getOptionValue(opt);
            const optText = getOptionText(opt);
            options.push(optVal);
            optionTexts[optVal] = optText;
          }
        });
        
        const selectedOptions = normalizeAnswerToArray(answer);
        
        return <div className="space-y-2">
          {options.map(option => (
            <div key={option} className="flex items-start space-x-2">
              <Checkbox 
                id={`${questionId}-${option}`} 
                checked={selectedOptions.includes(option) || selectedOptions.includes(optionTexts[option])} 
                onCheckedChange={checked => handleCheckboxChange(questionId, option, checked === true)} 
              />
              <label 
                htmlFor={`${questionId}-${option}`} 
                className="text-sm font-medium leading-none cursor-pointer text-slate-800"
              >
                {optionTexts[option] || option}
              </label>
            </div>
          ))}
        </div>;
        
      default:
        return <Input 
          value={typeof answer === 'string' ? answer : ''} 
          onChange={e => handleInputChange(questionId, e.target.value)} 
          className="w-full text-slate-900" 
          placeholder="Digite sua resposta aqui" 
        />;
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
                {questionsByModule.map((moduleData, moduleIndex) => (
                  <div key={moduleData.module.id} className="border border-[hsl(var(--quiz-border))] rounded-lg p-4">
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
                        
                        return (
                          <div key={questionId} className="border-t border-[hsl(var(--quiz-border))] pt-3">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <p className="font-medium text-[hsl(var(--quiz-text))]">
                                  {question.text || question.question_text}
                                </p>
                                
                                {isEditing ? (
                                  <div className="mt-2 space-y-3">
                                    {renderEditField(question)}
                                    
                                    <div className="flex gap-2 justify-end mt-3">
                                      <Button variant="outline" size="sm" onClick={handleCancelEdit} className="text-zinc-950">
                                        Cancelar
                                      </Button>
                                      <Button size="sm" onClick={() => handleSaveEdit(questionId)}>
                                        Salvar
                                      </Button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-[hsl(var(--quiz-text))] opacity-80 mt-1 break-words">
                                    {formatJsonAnswer(answer)}
                                  </p>
                                )}
                              </div>
                              
                              {!isEditing && (
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  onClick={() => handleEditClick(questionId)} 
                                  className="ml-2 border-[hsl(var(--quiz-border))] text-[hsl(var(--quiz-text))] text-slate-800"
                                >
                                  <Edit className="h-4 w-4 mr-1" /> Editar
                                </Button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
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
              <Button variant="outline" onClick={() => onEdit(modules.length - 1, questions.filter(q => q.module_id === modules[modules.length - 1].id).length - 1)} className="border-[hsl(var(--quiz-border))] text-[hsl(var(--quiz-text))] text-slate-800">
                <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
              </Button>
              <Button onClick={handleCompleteQuiz} disabled={!agreedToTerms || isSubmitting} className="quiz-btn bg-lime-600 hover:bg-lime-500">
                {isSubmitting ? 'Processando...' : 'Confirmar Respostas'} <ArrowRight className="ml-2 h-4 w-4" />
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
            
            {submissionError && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro ao finalizar questionário</AlertTitle>
                <AlertDescription>
                  {submissionError}
                </AlertDescription>
              </Alert>
            )}
            
            {errorDetails && (
              <div className="mb-4 p-4 bg-red-900/30 border border-red-600/40 rounded-md text-sm text-white">
                <h4 className="font-semibold text-red-200 mb-2">Detalhes técnicos do erro:</h4>
                <div className="space-y-2 text-xs font-mono bg-black/30 p-3 rounded overflow-auto max-h-48">
                  {errorDetails.origem && <p><strong>Origem:</strong> {errorDetails.origem}</p>}
                  {errorDetails.mensagem && <p><strong>Mensagem:</strong> {errorDetails.mensagem}</p>}
                  {errorDetails.código && <p><strong>Código:</strong> {errorDetails.código}</p>}
                  {errorDetails.dica && <p><strong>Dica:</strong> {errorDetails.dica}</p>}
                  {errorDetails.detalhes && <p><strong>Detalhes:</strong> {errorDetails.detalhes}</p>}
                  {!errorDetails.mensagem && !errorDetails.origem && (
                    <pre className="whitespace-pre-wrap">
                      {JSON.stringify(errorDetails, null, 2)}
                    </pre>
                  )}
                </div>
                <p className="mt-3 text-xs text-red-200">
                  Por favor capture uma screenshot desta mensagem e envie para o suporte técnico.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button onClick={handleFinalizeQuiz} disabled={isSubmitting} className="quiz-btn">
              {isSubmitting ? 'Processando...' : 'Finalizar Questionário'}
            </Button>
          </CardFooter>
        </Card>}
    </div>;
}
