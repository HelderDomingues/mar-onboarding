
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { forceQuizRecovery } from '@/scripts/force-quiz-recovery';
import { Loader2, Tool } from 'lucide-react';

interface ForceRecoveryButtonProps {
  onComplete?: (result: {
    success: boolean;
    message: string;
    data?: {
      modules?: number;
      questions?: number;
      options?: number;
    };
  }) => void;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
}

export const ForceRecoveryButton: React.FC<ForceRecoveryButtonProps> = ({
  onComplete,
  variant = 'default',
  size = 'default',
  className = ''
}) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const handleForceRecovery = async () => {
    try {
      setIsLoading(true);
      
      const result = await forceQuizRecovery();
      
      toast({
        title: result.success ? 'Sucesso' : 'Erro',
        description: result.message,
        variant: result.success ? 'default' : 'destructive'
      });
      
      if (onComplete) {
        onComplete(result);
      }
    } catch (error) {
      console.error('Erro ao executar recuperação forçada:', error);
      
      toast({
        title: 'Erro',
        description: `Erro ao recuperar dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: 'destructive'
      });
      
      if (onComplete) {
        onComplete({
          success: false,
          message: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        });
      }
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      onClick={handleForceRecovery}
      disabled={isLoading}
      variant={variant}
      size={size}
      className={className}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Recuperando...
        </>
      ) : (
        <>
          <Tool className="mr-2 h-4 w-4" />
          Recuperar Questionário
        </>
      )}
    </Button>
  );
};

export default ForceRecoveryButton;
