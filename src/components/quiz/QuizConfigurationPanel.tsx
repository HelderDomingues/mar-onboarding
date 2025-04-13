import React, { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabaseAdmin, supabase, checkSupabaseConnection } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { addLogEntry } from "@/utils/projectLog";
import { QuizModule, QuizQuestion, QuizSection } from "@/types/quiz";

interface QuizConfigurationPanelProps {
  isLoading: boolean;
  loadError: string | null;
  onRefresh: () => void;
  isAdmin?: boolean;
  modules: QuizModule[];
  questions: QuizQuestion[];
}

const errorIcon = (error) => (
  <div className="text-red-500 text-sm flex items-center gap-1 mt-1">
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
      />
    </svg>
    <span>{error}</span>
  </div>
);

export function QuizConfigurationPanel({
  isLoading,
  loadError,
  onRefresh,
  isAdmin = false,
  modules = [],
  questions = [],
}: QuizConfigurationPanelProps) {
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [sections, setSections] = useState<QuizSection[]>([]);
  const [seedModalOpen, setSeedModalOpen] = useState(false);
  const [isSeedingQuiz, setIsSeedingQuiz] = useState(false);
  const { toast } = useToast();

  // Garante que os valores de SelectItem nunca sejam vazios
  const getSelectValue = (value: string | undefined, fallback: string): string => {
    return value || fallback;
  };

  const filteredQuestions = React.useMemo(() => {
    if (!selectedModuleId) return [];
    let filtered = questions.filter((q) => q.module_id === selectedModuleId);
    if (selectedSectionId) {
      filtered = filtered.filter((q) => q.section_id === selectedSectionId);
    }
    return filtered;
  }, [questions, selectedModuleId, selectedSectionId]);

  const truncateText = (text: string, maxLength: number): string => {
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + "...";
    }
    return text;
  };

  const handleSeedQuiz = async () => {
    setIsSeedingQuiz(true);
    try {
      logger.info('Inicializando questionário', { tag: 'Quiz' });
      addLogEntry('info', 'Inicializando questionário');

      // Verificar conexão com Supabase antes de prosseguir
      const connectionStatus = await checkSupabaseConnection();
      if (!connectionStatus.connected) {
        throw new Error(`Erro de conexão com Supabase: ${connectionStatus.error}`);
      }

      const { error } = await supabaseAdmin?.functions.invoke('seed-quiz', {
        body: { action: 'seed' },
      });

      if (error) {
        logger.error('Erro ao inicializar questionário', {
          tag: 'Quiz',
          data: error,
        });
        addLogEntry('error', 'Erro ao inicializar questionário', JSON.stringify(error));
        toast({
          title: "Erro ao inicializar questionário",
          description: error.message,
          variant: "destructive",
        });
      } else {
        logger.info('Questionário inicializado com sucesso', { tag: 'Quiz' });
        addLogEntry('info', 'Questionário inicializado com sucesso');
        toast({
          title: "Questionário inicializado",
          description: "O questionário foi inicializado com sucesso!",
        });
        onRefresh(); // Refresh quiz data
      }
    } catch (error: any) {
      logger.error('Erro ao inicializar questionário', {
        tag: 'Quiz',
        data: error,
      });
      addLogEntry('error', 'Erro ao inicializar questionário', JSON.stringify(error));
      toast({
        title: "Erro ao inicializar questionário",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsSeedingQuiz(false);
      setSeedModalOpen(false);
    }
  };

  useEffect(() => {
    const fetchSections = async () => {
      if (selectedModuleId) {
        try {
          const { data, error } = await supabase
            .from('quiz_sections')
            .select('*')
            .eq('module_id', selectedModuleId);

          if (error) {
            logger.error('Erro ao buscar seções', {
              tag: 'Quiz',
              data: error,
            });
            addLogEntry('error', 'Erro ao buscar seções', JSON.stringify(error));
            toast({
              title: "Erro ao buscar seções",
              description: error.message,
              variant: "destructive",
            });
          } else if (data) {
            setSections(data as QuizSection[]);
          }
        } catch (error: any) {
          logger.error('Erro ao buscar seções', {
            tag: 'Quiz',
            data: error,
          });
          addLogEntry('error', 'Erro ao buscar seções', JSON.stringify(error));
          toast({
            title: "Erro ao buscar seções",
            description: error.message,
            variant: "destructive",
          });
        }
      } else {
        setSections([]);
      }
    };

    fetchSections();
  }, [selectedModuleId, toast]);

  return (
    <div className="w-full max-w-4xl mx-auto">
      <div className="mb-8 text-center">
        <h1 className="text-2xl md:text-3xl font-bold mb-4 text-gray-800">
          {isAdmin ? "Configuração do Questionário" : "Questionário MAR"}
        </h1>
        
        {loadError && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">Erro ao carregar dados</p>
            <p className="text-sm">{loadError}</p>
            <Button
              onClick={onRefresh}
              className="mt-2 bg-red-600 hover:bg-red-700"
            >
              Tentar novamente
            </Button>
          </div>
        )}
        
        {!isLoading && modules.length === 0 && !loadError && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded-md mb-6">
            <p className="font-medium">Nenhum módulo encontrado</p>
            <p className="text-sm">
              O questionário ainda não foi configurado ou você não tem permissão
              para visualizá-lo.
            </p>
            {isAdmin && (
              <div className="mt-4">
                <Button onClick={() => setSeedModalOpen(true)}>
                  Inicializar questionário
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800 mb-4"></div>
          <p className="text-gray-600">Carregando questionário...</p>
        </div>
      ) : modules.length > 0 ? (
        <>
          <div className="grid md:grid-cols-3 gap-8">
            <div>
              <Label htmlFor="moduleSelect">Módulo</Label>
              <Select
                value={selectedModuleId || ""}
                onValueChange={(value) => setSelectedModuleId(value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um módulo" />
                </SelectTrigger>
                <SelectContent>
                  {modules.map((module) => (
                    <SelectItem 
                      key={module.id} 
                      value={getSelectValue(module.id, `module-${module.order_number}`)}
                    >
                      {module.order_number}. {module.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="sectionSelect">Seção</Label>
              <Select
                value={selectedSectionId || ""}
                onValueChange={(value) => setSelectedSectionId(value)}
                disabled={!selectedModuleId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma seção" />
                </SelectTrigger>
                <SelectContent>
                  {sections.map((section) => (
                    <SelectItem 
                      key={section.id} 
                      value={getSelectValue(section.id, `section-${section.id}`)}
                    >
                      {section.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="questionSelect">Pergunta</Label>
              <Select
                value={selectedQuestionId || ""}
                onValueChange={(value) => setSelectedQuestionId(value)}
                disabled={!selectedModuleId}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione uma pergunta" />
                </SelectTrigger>
                <SelectContent>
                  {filteredQuestions.map((question) => (
                    <SelectItem 
                      key={question.id} 
                      value={getSelectValue(question.id, `question-${question.question_number}`)}
                    >
                      {question.question_number}. {truncateText(question.question_text, 30)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold mb-4 text-gray-700">
              Detalhes
            </h2>
            {selectedModuleId && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-600">
                  Módulo Selecionado
                </h3>
                <p>
                  {
                    modules.find((module) => module.id === selectedModuleId)
                      ?.title
                  }
                </p>
              </div>
            )}
            {selectedSectionId && (
              <div className="mb-4">
                <h3 className="text-lg font-medium text-gray-600">
                  Seção Selecionada
                </h3>
                <p>
                  {
                    sections.find((section) => section.id === selectedSectionId)
                      ?.name
                  }
                </p>
              </div>
            )}
            {selectedQuestionId && (
              <div>
                <h3 className="text-lg font-medium text-gray-600">
                  Pergunta Selecionada
                </h3>
                <p>
                  {
                    questions.find((question) => question.id === selectedQuestionId)
                      ?.question_text
                  }
                </p>
              </div>
            )}
          </div>
        </>
      ) : null}

      {/* Modais e dialogos */}
      <Dialog open={seedModalOpen} onOpenChange={setSeedModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Inicializar Questionário</DialogTitle>
            <DialogDescription>
              Isso criará todos os módulos e perguntas do questionário MAR. Os
              dados existentes serão substituídos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-amber-600 text-sm">
              Atenção: Esta ação é irreversível e substituirá qualquer dado
              existente do questionário.
            </p>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setSeedModalOpen(false)}
              >
                Cancelar
              </Button>
              <Button onClick={handleSeedQuiz} disabled={isSeedingQuiz}>
                {isSeedingQuiz ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Inicializando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
