import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface AdminUserMessageProps {
  hasEmailAccess: boolean;
  onRefresh: () => void;
  onSetupEmailAccess: () => void;
  isLoading: boolean;
}

export const AdminUserMessage: React.FC<AdminUserMessageProps> = ({
  hasEmailAccess,
  onRefresh,
  onSetupEmailAccess,
  isLoading
}) => {
  if (hasEmailAccess) {
    return (
      <Alert variant="default" className="m-4 border-green-200 bg-green-50">
        <AlertTriangle className="h-4 w-4 text-green-600" />
        <AlertTitle className="text-green-800">Acesso Configurado</AlertTitle>
        <AlertDescription className="text-green-700">
          <p>Service role key configurada com sucesso. Você tem acesso completo aos dados dos usuários.</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onRefresh} 
            className="mt-2 border-green-300 text-green-700 hover:bg-green-100"
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Atualizando...' : 'Atualizar dados'}
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert variant="warning" className="m-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Acesso Limitado</AlertTitle>
      <AlertDescription className="space-y-2">
        <p>Service role key não configurada ou inválida. Configure para acessar os emails dos usuários.</p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onSetupEmailAccess} 
          className="text-amber-800 hover:bg-amber-100"
        >
          Configurar acesso aos emails
        </Button>
      </AlertDescription>
    </Alert>
  );
};