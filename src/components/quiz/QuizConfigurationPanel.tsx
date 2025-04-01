
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SeedButton } from "@/components/quiz/SeedButton";
import { AlertCircle } from "lucide-react";

interface QuizConfigurationPanelProps {
  isLoading: boolean;
  loadError: string | null;
  onRefresh: () => void;
  isAdmin: boolean;
}

export function QuizConfigurationPanel({ 
  isLoading, 
  loadError, 
  onRefresh,
  isAdmin 
}: QuizConfigurationPanelProps) {
  return (
    <div className="w-full max-w-2xl rounded-lg bg-white p-8 text-center shadow-md">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">
        Questionário MAR
      </h2>
      
      {isLoading ? (
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-lg mb-6">Carregando questionário...</p>
        </div>
      ) : (
        <>
          <p className="text-lg mb-6">
            {loadError || "Nenhum dado de questionário encontrado."}
          </p>
          
          {loadError && (
            <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              <p>Ocorreu um erro ao carregar o questionário.</p>
            </div>
          )}
          
          {isAdmin && (
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={onRefresh}
                className="mb-4 mr-4"
              >
                Tentar novamente
              </Button>
              <SeedButton onComplete={onRefresh} />
            </div>
          )}
          
          {!isAdmin && loadError && (
            <p className="text-muted-foreground mt-4">
              Por favor, entre em contato com o administrador para configurar o questionário.
            </p>
          )}
        </>
      )}
      
      <div className="flex justify-center mt-8">
        <img 
          src="/lovable-uploads/98e55723-efb7-42e8-bc10-a429fdf04ffb.png" 
          alt="MAR - Mapa para Alto Rendimento" 
          className="max-w-full h-auto max-h-32 object-contain" 
        />
      </div>
    </div>
  );
}
