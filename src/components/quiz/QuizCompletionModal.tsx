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
import { sendQuizDataToWebhook } from '@/utils/webhookUtils';

export interface QuizCompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId?: string | null;
  completionResult: {
    success: boolean;
    verified: boolean;
    webhookSent: boolean;
    error?: any;
  } | null;
}

export interface VerificationStep {
  id: string;
  title: string;
  status: 'loading' | 'success' | 'error' | 'pending';
  description: string;
}

export function QuizCompletionModal({ isOpen, onClose, submissionId, completionResult }: QuizCompletionModalProps) {
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
  const [rpcDetails, setRpcDetails] = useState<any | null>(null);
  const [webhookDetails, setWebhookDetails] = useState<any | null>(null);

  useEffect(() => {
    if (completionResult && isOpen) {
      updateStepsFromResult(completionResult);
    }
  }, [completionResult, isOpen]);

  const updateStepsFromResult = (result: typeof completionResult) => {
    if (!result) return;

    const newSteps: VerificationStep[] = steps.map(step => {
      switch (step.id) {
        case 'submission':
          return {
            ...step,
            status: (result.success ? 'success' : 'error') as VerificationStep['status'],
            description: result.success 
              ? 'Questionário finalizado com sucesso!' 
              : 'Erro ao finalizar questionário'
          };
        case 'verification':
          return {
            ...step,
            status: (result.verified ? 'success' : (result.success ? 'error' : 'pending')) as VerificationStep['status'],
            description: result.verified 
              ? 'Dados confirmados no banco de dados!' 
              : (result.success ? 'Erro ao verificar dados' : 'Aguardando finalização...')
          };
        case 'webhook':
          return {
            ...step,
            status: (result.webhookSent ? 'success' : (result.verified ? 'error' : 'pending')) as VerificationStep['status'],
            description: result.webhookSent 
              ? 'Dados enviados para processamento!' 
              : (result.verified ? 'Erro ao enviar dados' : 'Aguardando verificação...')
          };
        default:
          return step;
      }
    });

    setSteps(newSteps);

    // Habilitar retry apenas se houver erro após a submission ter sucesso
    if (result.success && (!result.verified || !result.webhookSent)) {
      setCanRetry(true);
    } else if (!result.success) {
      setCanRetry(true);
    }

    // Extract additional details if available for display
    if ((result as any).details) {
      const d = (result as any).details;
      setRpcDetails(d.verification || d.verificationResult || null);
      setWebhookDetails(d.webhook || d.webhookResult || (d.status ? d : null));
    }
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

  const handleRetry = async () => {
    if (!submissionId) {
      toast({ title: 'Erro', description: 'SubmissionId não disponível para retry.', variant: 'destructive' });
      return;
    }

    setIsRetrying(true);
    try {
      toast({ title: 'Reenviando webhook', description: 'Tentando reenviar os dados para processamento...' });
      const result = await sendQuizDataToWebhook(submissionId);

      // Update UI based on result
      if (result && result.success) {
        setWebhookDetails(result.details || { message: result.message });
        setSteps(prev => prev.map(s => s.id === 'webhook' ? { ...s, status: 'success', description: 'Webhook enviado com sucesso' } : s));
        setCanRetry(false);
        toast({ title: 'Webhook enviado', description: 'Os dados foram reenviados com sucesso.' });
      } else {
        setWebhookDetails(result.details || { message: result.message });
        setSteps(prev => prev.map(s => s.id === 'webhook' ? { ...s, status: 'error', description: 'Falha ao enviar webhook' } : s));
        setCanRetry(true);
        toast({ title: 'Falha no webhook', description: result.message || 'Falha ao reenviar webhook', variant: 'destructive' });
      }
    } catch (e: any) {
      setSteps(prev => prev.map(s => s.id === 'webhook' ? { ...s, status: 'error', description: 'Erro ao reenviar webhook' } : s));
      setWebhookDetails({ error: e });
      toast({ title: 'Erro', description: e?.message || 'Erro desconhecido', variant: 'destructive' });
    } finally {
      setIsRetrying(false);
    }
  };

  const handleNavigateToDashboard = () => { navigate('/dashboard'); onClose(); };
  const handleNavigateToMemberArea = () => { navigate('/member'); onClose(); };

  const allStepsSuccessful = steps.every(s => s.status === 'success');
  const hasErrors = steps.some(s => s.status === 'error');

  return (
    <Dialog open={isOpen} onOpenChange={(open) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
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

        {/* Details panel for RPC and Webhook responses */}
        {(rpcDetails || webhookDetails) && (
          <div className="mt-4 p-3 rounded-lg bg-gray-50 border">
            <h4 className="text-sm font-medium mb-2">Detalhes técnicos</h4>
            {rpcDetails && (
              <div className="mb-2 text-xs font-mono bg-white p-2 rounded border">
                <strong>Verificação (RPC):</strong>
                <pre className="whitespace-pre-wrap mt-1 text-[11px]">{JSON.stringify(rpcDetails, null, 2)}</pre>
              </div>
            )}
            {webhookDetails && (
              <div className="text-xs font-mono bg-white p-2 rounded border">
                <strong>Webhook:</strong>
                <pre className="whitespace-pre-wrap mt-1 text-[11px]">{JSON.stringify(webhookDetails, null, 2)}</pre>
              </div>
            )}
            <div className="flex gap-2 mt-2">
              <Button variant="ghost" onClick={() => {
                const toCopy = JSON.stringify({ rpcDetails, webhookDetails }, null, 2);
                navigator.clipboard.writeText(toCopy);
                toast({ title: 'Copiado', description: 'Detalhes técnicos copiados para a área de transferência.' });
              }}>Copiar detalhes</Button>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          {canRetry && !allStepsSuccessful && (
            <Button variant="outline" onClick={handleRetry} disabled={isRetrying} className="w-full sm:flex-1">
              {isRetrying ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <RefreshCw className="h-4 w-4 mr-2" />}
              Verificar Novamente
            </Button>
          )}

          <Button onClick={handleNavigateToDashboard} className="w-full sm:flex-1">
            <Home className="h-4 w-4 mr-2" /> Dashboard
          </Button>

          <Button variant="outline" onClick={handleNavigateToMemberArea} className="w-full sm:flex-1">
            <User className="h-4 w-4 mr-2" /> Área do Membro
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}