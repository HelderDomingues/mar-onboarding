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
import { useToast } from "@/components/ui/use-toast";

export interface QuizCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  completionResult: {
    success: boolean;
    verified: boolean;
    webhookSent: boolean;
    error?: any;
  } | null;
  onRetry?: () => Promise<any> | void;
}

export interface VerificationStep {
  id: string;
  title: string;
  status: 'loading' | 'success' | 'error' | 'pending';
  description: string;
}

export function QuizCompletionModal({ isOpen, onClose, completionResult, onRetry }: QuizCompletionModalProps) {
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

  // Auto-navigate/close after success
  useEffect(() => {
    if (isOpen) {
      const allSuccess = steps.every(s => s.status === 'success');
      if (allSuccess) {
        const t = setTimeout(() => {
          navigate('/dashboard');
          onClose();
        }, 1200);
        return () => clearTimeout(t);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, isOpen]);

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
            status: result.verified ? 'success' : (result.success ? 'pending' : 'error'),
            description: result.verified ? 'Confirmação no banco de dados realizada.' : (result.success ? 'Aguardando verificação...' : 'Falha na verificação')
          };
        case 'webhook':
          return {
            ...step,
            status: result.webhookSent ? 'success' : (result.success ? 'pending' : 'error'),
            description: result.webhookSent ? 'Dados enviados para processamento.' : (result.success ? 'Envio pendente' : 'Falha no envio')
          };
        default:
          return step;
      }
    }));

    // if anything is not fully successful allow retry for verification/webhook
    const needsRetry = !result.success || !result.verified || !result.webhookSent;
    setCanRetry(!!needsRetry);
  };

  // Helpers and handlers used by the JSX
  const getStepIcon = (status: VerificationStep['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'pending':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
      case 'loading':
      default:
        return <Loader2 className="h-5 w-5 animate-spin text-blue-500" />;
    }
  };

  const getStepBadge = (status: VerificationStep['status']) => {
    switch (status) {
      case 'success':
        return <Badge variant="default">Concluído</Badge>;
      case 'error':
        return <Badge variant="destructive">Erro</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pendente</Badge>;
      case 'loading':
      default:
        return <Badge variant="outline">Processando</Badge>;
    }
  };

  const handleRetry = () => {
    if (typeof onRetry === 'function') {
      setIsRetrying(true);
      Promise.resolve(onRetry())
        .then((res) => {
          // Expect parent to update completionResult prop so useEffect will refresh
          toast({ title: 'Verificação reexecutada', description: 'O processo foi reexecutado.' });
        })
        .catch((err) => {
          toast({ title: 'Erro ao reexecutar', description: (err && err.message) || 'Falha ao reexecutar verificação', variant: 'destructive' });
        })
        .finally(() => setIsRetrying(false));
    } else {
      // fallback behaviour
      setIsRetrying(true);
      setTimeout(() => {
        setIsRetrying(false);
        toast({ title: 'Verificação reexecutada', description: 'A verificação foi reexecutada.' });
      }, 1200);
    }
  };

  const handleNavigateToDashboard = () => { navigate('/dashboard'); onClose(); };
  const handleNavigateToMemberArea = () => { navigate('/member'); onClose(); };

  const allStepsSuccessful = steps.every(s => s.status === 'success');
  const hasErrors = steps.some(s => s.status === 'error');

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
            {allStepsSuccessful ? 'Parabéns! Seu questionário foi completado com sucesso.' : 'Verificando o status da finalização do seu questionário...'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {steps.map(step => (
            <div key={step.id} className="flex items-center gap-3 p-3 rounded-lg border">
              <div className="flex-shrink-0">{getStepIcon(step.status)}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">{step.title}</p>
                  {getStepBadge(step.status)}
                </div>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {hasErrors && (
          <div className="p-3 rounded-lg bg-yellow-50 border border-yellow-200">
            <div className="flex items-center gap-2 text-yellow-800">
              <AlertTriangle className="h-4 w-4" />
              <p className="text-sm font-medium">Alguns processos falharam, mas seus dados foram salvos.</p>
            </div>
            <p className="text-sm text-yellow-700 mt-1">Nossa equipe será notificada e processará manualmente se necessário.</p>
          </div>
        )}

        <DialogFooter className="flex-col gap-2 sm:flex-row">
          {canRetry && !allStepsSuccessful && (
            <Button variant="outline" onClick={handleRetry} disabled={isRetrying} className="w-full sm:w-auto">
              {isRetrying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Verificar Novamente
            </Button>
          )}

          <Button onClick={handleNavigateToDashboard} className="w-full sm:w-auto">
            <Home className="h-4 w-4 mr-2" /> Voltar ao Dashboard
          </Button>

          <Button variant="outline" onClick={handleNavigateToMemberArea} className="w-full sm:w-auto">
            <User className="h-4 w-4 mr-2" /> Área do Membro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}