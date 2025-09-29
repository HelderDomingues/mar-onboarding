import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  Loader2, 
  XCircle, 
  Home, 
  User,
  AlertTriangle,
  RefreshCw
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface QuizCompletionModalProps {
  isOpen: boolean;
  submissionId: string | null;
  onClose: () => void;
  completionResult: {
    success: boolean;
    verified: boolean;
    webhookSent: boolean;
    error?: any;
  } | null;
}

interface VerificationStep {
  id: string;
  title: string;
  status: 'loading' | 'success' | 'error' | 'pending';
  description: string;
}

export function QuizCompletionModal({ 
  isOpen, 
  submissionId, 
  onClose, 
  completionResult 
}: QuizCompletionModalProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [steps, setSteps] = useState<VerificationStep[]>([
    {
      id: 'submission',
      title: 'Finalização do questionário',
      status: 'loading',
      description: 'Marcando questionário como completo...'
    },
    {
      id: 'verification',
      title: 'Verificação do banco de dados',
      status: 'pending',
      description: 'Confirmando salvamento dos dados...'
    },
    {
      id: 'webhook',
      title: 'Envio para processamento',
      status: 'pending',
      description: 'Enviando dados para análise...'
    }
  ]);

  const [isRetrying, setIsRetrying] = useState(false);
  const [canRetry, setCanRetry] = useState(false);

  useEffect(() => {
    if (completionResult && isOpen) {
      updateStepsFromResult(completionResult);
    }
  }, [completionResult, isOpen]);

  const updateStepsFromResult = (result: typeof completionResult) => {
    if (!result) return;

    setSteps(prev => prev.map(step => {
      switch (step.id) {
        case 'submission':
          return {
            ...step,
            status: result.success ? 'success' : 'error',
            description: result.success 
              ? 'Questionário finalizado com sucesso!' 
              : 'Erro ao finalizar questionário'
          };
        case 'verification':
          return {
            ...step,
            status: result.verified ? 'success' : result.success ? 'error' : 'pending',
            description: result.verified 
              ? 'Dados verificados e salvos!'
              : result.success 
                ? 'Falha na verificação dos dados'
                : 'Aguardando finalização...'
          };
        case 'webhook':
          return {
            ...step,
            status: result.webhookSent ? 'success' : result.verified ? 'error' : 'pending',
            description: result.webhookSent 
              ? 'Dados enviados para processamento!'
              : result.verified 
                ? 'Falha no envio para processamento'
                : 'Aguardando verificação...'
          };
        default:
          return step;
      }
    }));

    // Determinar se pode tentar novamente
    setCanRetry(!result.success || !result.verified || !result.webhookSent);
  };

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-gray-300" />;
    }
  };

  const getStepBadge = (status: string) => {
    switch (status) {
      case 'loading':
        return <Badge variant="secondary">Processando...</Badge>;
      case 'success':
        return <Badge variant="default" className="bg-green-500">Concluído</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      default:
        return <Badge variant="outline">Aguardando</Badge>;
    }
  };

  const handleRetry = async () => {
    if (!submissionId) return;
    
    setIsRetrying(true);
    
    try {
      // Verificar status atual no banco
      const { data: currentStatus, error } = await supabase
        .from('quiz_submissions')
        .select('completed, completed_at, webhook_processed')
        .eq('id', submissionId)
        .single();

      if (error || !currentStatus) {
        throw new Error('Não foi possível verificar o status atual');
      }

      if (currentStatus.completed) {
        toast({
          title: "Questionário já finalizado",
          description: "Seus dados foram salvos com sucesso!",
        });
        
        // Atualizar steps para sucesso
        setSteps(prev => prev.map(step => ({
          ...step,
          status: 'success' as const,
          description: step.id === 'submission' ? 'Questionário finalizado com sucesso!' :
                      step.id === 'verification' ? 'Dados verificados e salvos!' :
                      currentStatus.webhook_processed ? 'Dados enviados para processamento!' : 'Processamento pendente'
        })));
        
        setCanRetry(false);
      } else {
        toast({
          title: "Erro na verificação",
          description: "O questionário não foi finalizado corretamente. Tente novamente.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erro ao verificar status:', error);
      toast({
        title: "Erro na verificação",
        description: "Não foi possível verificar o status. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
    onClose();
  };

  const handleNavigateToMemberArea = () => {
    navigate('/member');
    onClose();
  };

  const allStepsSuccessful = steps.every(step => step.status === 'success');
  const hasErrors = steps.some(step => step.status === 'error');

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {allStepsSuccessful ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : hasErrors ? (
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
            )}
            {allStepsSuccessful ? 'Questionário Finalizado!' : 'Finalizando Questionário...'}
          </DialogTitle>
          <DialogDescription>
            {allStepsSuccessful 
              ? 'Parabéns! Seu questionário foi completado com sucesso.'
              : 'Verificando o status da finalização do seu questionário...'
            }
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="flex-shrink-0">
                {getStepIcon(step.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{step.title}</p>
                  {getStepBadge(step.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {hasErrors && (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">
                Alguns processos falharam, mas seus dados foram salvos.
              </p>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Nossa equipe será notificada e processará manualmente se necessário.
            </p>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {canRetry && !allStepsSuccessful && (
            <Button 
              variant="outline" 
              onClick={handleRetry}
              disabled={isRetrying}
              className="w-full sm:w-auto"
            >
              {isRetrying ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Verificar Novamente
            </Button>
          )}
          
          <Button 
            onClick={handleNavigateToDashboard}
            className="w-full sm:w-auto"
          >
            <Home className="h-4 w-4 mr-2" />
            Voltar ao Dashboard
          </Button>
          
          <Button 
            variant="outline" 
            onClick={handleNavigateToMemberArea}
            className="w-full sm:w-auto"
          >
            <User className="h-4 w-4 mr-2" />
            Área do Membro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}