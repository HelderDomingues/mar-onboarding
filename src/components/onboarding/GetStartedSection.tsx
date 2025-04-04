
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlayCircle, FileText, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export const GetStartedSection = () => {
  return (
    <div className="mb-8 rounded-xl overflow-hidden bg-gradient-to-br from-blue-50 via-blue-50 to-indigo-50 shadow-lg">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Conteúdo à esquerda */}
        <div className="p-8 space-y-5">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full font-medium text-sm">
            <div className="bg-blue-500 p-1 rounded-full">
              <svg className="h-3 w-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            Comece Aqui
          </div>
          
          <h2 className="text-2xl font-bold tracking-tight text-gray-900">
            Bem-vindo ao programa MAR
          </h2>
          
          <p className="text-gray-600">
            Parabéns por dar este importante passo para transformar o marketing da sua empresa! 
            O <span className="font-semibold">Mapa para Alto Rendimento</span> é um programa completo 
            que vai guiar você através de estratégias testadas e comprovadas.
          </p>
          
          <div className="space-y-4 pt-2">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-blue-100 p-1.5 rounded-full text-blue-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Assista ao vídeo de introdução para entender como funciona o programa
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-blue-100 p-1.5 rounded-full text-blue-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Responda ao questionário diagnóstico para receber sua análise personalizada
              </p>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="mt-0.5 bg-blue-100 p-1.5 rounded-full text-blue-600">
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-sm text-gray-600">
                Acesse materiais exclusivos desenvolvidos para a sua jornada de transformação
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-3 pt-4">
            <Link to="/quiz">
              <Button className="bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 rounded-lg px-5 py-2.5 shadow-sm transition-all duration-200 transform hover:translate-y-[-2px]">
                <FileText className="h-4 w-4" />
                Responder Questionário
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
            <Link to="/materials">
              <Button variant="outline" className="border-blue-200 text-blue-700 hover:bg-blue-50 flex items-center gap-2 rounded-lg px-5 py-2.5 shadow-sm transition-all duration-200">
                <FileText className="h-4 w-4" />
                Materiais Iniciais
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Vídeo à direita */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-900 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-white/[0.05] bg-[length:16px_16px]"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
          
          <div className="p-8 relative z-10 h-full flex flex-col">
            <div className="flex-1 flex items-center justify-center">
              <div className="w-full max-w-md">
                <AspectRatio ratio={16/9} className="rounded-lg overflow-hidden shadow-xl border border-white/10">
                  <div className="relative group cursor-pointer">
                    {/* Thumbnail do vídeo com overlay de play */}
                    <div className="absolute inset-0 bg-black/30 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                      <div className="bg-white/20 backdrop-blur-md rounded-full p-5 border border-white/30 group-hover:bg-white/30 group-hover:scale-110 transition-all duration-300">
                        <PlayCircle className="h-10 w-10 text-white" />
                      </div>
                    </div>
                    <iframe 
                      src="https://www.youtube.com/embed/dQw4w9WgXcQ" 
                      className="w-full h-full" 
                      title="Vídeo de Introdução ao MAR"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      loading="lazy"
                    ></iframe>
                  </div>
                </AspectRatio>
              </div>
            </div>
            
            <div className="mt-6 text-white">
              <h3 className="text-xl font-medium">Vídeo de Introdução ao MAR</h3>
              <p className="text-white/80 mt-1">
                Assista este vídeo para entender como funciona o programa e quais são os próximos passos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
