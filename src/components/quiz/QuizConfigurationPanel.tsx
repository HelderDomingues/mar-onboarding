
import React from 'react';
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { QuizModule, QuizQuestion } from "@/types/quiz";

interface QuizConfigurationPanelProps {
  isLoading: boolean;
  loadError: string | null;
  onRefresh: () => void;
  isAdmin: boolean;
  modules: QuizModule[];
  questions: QuizQuestion[];
}

export function QuizConfigurationPanel({
  isLoading,
  loadError,
  onRefresh,
  isAdmin
}: QuizConfigurationPanelProps) {
  // Componente simplificado: apenas mostra o carregamento ou erro
  return (
    <div className="w-full max-w-3xl mx-auto flex flex-col items-center justify-center p-6 bg-slate-800 rounded-lg">
      {isLoading ? (
        <div className="flex items-center justify-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
          <p className="text-white">Carregando questionário...</p>
        </div>
      ) : loadError ? (
        <div className="text-center">
          <p className="text-red-500 mb-4">{loadError}</p>
          <Button 
            onClick={onRefresh} 
            variant="destructive"
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            Tentar Novamente
          </Button>
        </div>
      ) : null}

      {isAdmin && (
        <div className="w-full text-center mt-4">
          <p className="text-yellow-400">
            Modo Administrador: Questionário está pronto para ser iniciado.
          </p>
        </div>
      )}
    </div>
  );
}
