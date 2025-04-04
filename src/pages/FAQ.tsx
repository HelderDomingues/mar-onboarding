
import React, { useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooler } from "@/components/layout/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";
import { ChevronDown, MessageSquare, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const FAQ = () => {
  const { isAuthenticated } = useAuth();
  
  useEffect(() => {
    document.title = "Perguntas Frequentes | MAR - Crie Valor";
  }, []);

  const faqItems = [
    {
      question: "O que é o MAR?",
      answer: "O MAR (Mapa para Alto Rendimento) é uma metodologia desenvolvida pela Crie Valor para avaliar a maturidade do marketing da sua empresa e fornecer um diagnóstico personalizado com recomendações estratégicas para melhorar seus resultados."
    },
    {
      question: "Como funciona o questionário MAR?",
      answer: "O questionário MAR é composto por vários módulos com perguntas específicas sobre diferentes áreas do marketing. Ao responder todas as perguntas, nosso sistema analisa suas respostas e gera um diagnóstico personalizado com pontos fortes, pontos fracos e recomendações estratégicas."
    },
    {
      question: "Posso editar minhas respostas depois de enviar?",
      answer: "Sim, você pode revisar e editar suas respostas antes de finalizar o questionário. Após finalizar, você ainda pode visualizar suas respostas, mas para alterá-las será necessário entrar em contato com nossa equipe."
    },
    {
      question: "Como são calculados os resultados da análise?",
      answer: "Os resultados são calculados através de um algoritmo proprietário que avalia suas respostas em relação a benchmarks do seu setor e melhores práticas de marketing. A análise considera diversos fatores como maturidade digital, estratégia de conteúdo, presença online, e processos de conversão."
    },
    {
      question: "Quanto tempo leva para completar o questionário?",
      answer: "O tempo médio para completar o questionário é de aproximadamente 15-20 minutos, dependendo da complexidade da sua operação e da disponibilidade das informações solicitadas."
    },
    {
      question: "As informações que eu forneço são confidenciais?",
      answer: "Sim, todas as informações fornecidas são tratadas com total confidencialidade. Utilizamos práticas seguras de armazenamento de dados e não compartilhamos suas informações com terceiros sem sua autorização expressa."
    },
    {
      question: "Como posso implementar as recomendações?",
      answer: "Após receber seu diagnóstico, você pode implementar as recomendações por conta própria ou solicitar o apoio da nossa equipe de consultores. Oferecemos serviços de consultoria para ajudar na implementação das estratégias recomendadas."
    },
    {
      question: "Posso refazer o questionário posteriormente?",
      answer: "Sim, recomendamos refazer o questionário periodicamente (a cada 3-6 meses) para acompanhar a evolução da maturidade do seu marketing e ajustar suas estratégias conforme necessário."
    },
    {
      question: "Tenho acesso a materiais educativos sobre os temas abordados?",
      answer: "Sim, na área de Materiais você encontra conteúdos exclusivos sobre os temas abordados no questionário, além de guias práticos para implementar as recomendações sugeridas."
    },
    {
      question: "Como posso entrar em contato se tiver mais dúvidas?",
      answer: "Você pode entrar em contato conosco através do email contato@crievalor.com.br ou pelo WhatsApp disponível na plataforma. Nossa equipe está pronta para esclarecer qualquer dúvida adicional."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader />
      
      <div className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <QuestionMarkCircledIcon className="h-8 w-8 text-blue-600" />
              Perguntas Frequentes
            </h1>
            <p className="text-slate-600">
              Encontre respostas para as dúvidas mais comuns sobre o MAR e nossos serviços.
            </p>
          </div>
          
          <div className="mb-8">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <Input 
                className="pl-10" 
                placeholder="Buscar perguntas..." 
                type="search"
              />
            </div>
          </div>

          <Card className="mb-8 border-0 shadow-md">
            <CardHeader className="bg-blue-600 text-white">
              <CardTitle>Perguntas Frequentes</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-left font-medium text-slate-800 py-4 hover:no-underline">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 pb-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
          
          <Card className="mb-8 border border-blue-100 bg-blue-50">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row items-center gap-6">
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Ainda com dúvidas?</h3>
                  <p className="text-slate-600 mb-4">
                    Se você não encontrou o que procurava, entre em contato diretamente com nossa equipe de suporte.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <a href="mailto:contato@crievalor.com.br">
                      <Button className="bg-blue-600">
                        Enviar Email
                      </Button>
                    </a>
                    <a href="https://wa.me/5567999999999" target="_blank" rel="noreferrer">
                      <Button variant="outline" className="flex items-center gap-2">
                        <MessageSquare className="h-4 w-4" />
                        <span>WhatsApp</span>
                      </Button>
                    </a>
                  </div>
                </div>
                <div className="hidden md:block">
                  <QuestionMarkCircledIcon className="h-24 w-24 text-blue-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <SiteFooler />
    </div>
  );
};

export default FAQ;
