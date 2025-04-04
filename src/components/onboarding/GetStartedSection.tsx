
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";

export const GetStartedSection = () => {
  return (
    <Card className="mb-8">
      <CardHeader className="bg-blue-50 border-b pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          <div className="bg-blue-500 p-1 rounded-full">
            <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          Comece Aqui
        </CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3 space-y-4">
            <h3 className="text-lg font-medium">Bem-vindo ao programa MAR - Mapa para Alto Rendimento</h3>
            <p className="text-gray-600">
              Parabéns por dar este importante passo para transformar o marketing da sua empresa! 
              O MAR é um programa completo que vai guiar você através de estratégias testadas e 
              comprovadas para aumentar o rendimento do seu marketing digital.
            </p>
            <p className="text-gray-600">
              Antes de preencher o questionário diagnóstico, recomendamos que você assista ao vídeo 
              de introdução ao lado, que explica o funcionamento do programa e como obter os melhores 
              resultados. Também disponibilizamos materiais iniciais que vão ajudar você a entender 
              melhor o processo.
            </p>
            <div className="flex flex-wrap gap-3 mt-6 pt-4 border-t">
              <Link to="/quiz">
                <Button className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Responder Questionário
                </Button>
              </Link>
              <Link to="/materials">
                <Button variant="outline" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Materiais Iniciais
                </Button>
              </Link>
            </div>
          </div>
          <div className="md:col-span-2 bg-slate-100 rounded-lg overflow-hidden">
            <div className="relative pb-[56.25%] h-0">
              <iframe 
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                className="absolute top-0 left-0 w-full h-full"
                allowFullScreen
                title="Vídeo de Introdução ao MAR"
              ></iframe>
            </div>
            <div className="p-4">
              <h4 className="font-medium mb-1">Vídeo de Introdução ao MAR</h4>
              <p className="text-sm text-gray-600">
                Assista este vídeo para entender como funciona o programa e quais são os próximos passos.
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
