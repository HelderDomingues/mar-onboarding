import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Save, ArrowLeft, Check } from 'lucide-react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';

interface QuizEditControlsProps {
  onSave: () => Promise<void>;
  isLoading?: boolean;
}

export const QuizEditControls: React.FC<QuizEditControlsProps> = ({
  onSave,
  isLoading = false
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const isEditMode = searchParams.get('edit') === 'true';

  if (!isEditMode) {
    return null;
  }

  const handleSaveAndReturn = async () => {
    try {
      await onSave();
      toast({
        title: "Resposta salva",
        description: "Sua resposta foi salva com sucesso!",
      });
      
      // Voltar para a página de revisão
      navigate('/quiz/review');
    } catch (error) {
      console.error('Erro ao salvar resposta:', error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar sua resposta. Tente novamente.",
        variant: "destructive"
      });
    }
  };

  const handleCancel = () => {
    navigate('/quiz/review');
  };

  return (
    <Card className="sticky bottom-4 mx-auto max-w-md bg-white/95 backdrop-blur-sm shadow-lg border-primary/20">
      <CardContent className="flex gap-3 p-4">
        <Button
          variant="outline"
          onClick={handleCancel}
          disabled={isLoading}
          className="flex-1"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        
        <Button
          onClick={handleSaveAndReturn}
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Save className="h-4 w-4 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Check className="h-4 w-4 mr-2" />
              Salvar e Voltar
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};