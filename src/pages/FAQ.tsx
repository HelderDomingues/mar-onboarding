
import React, { useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooler } from "@/components/layout/SiteFooter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { QuestionMarkCircledIcon } from "@radix-ui/react-icons";

const FAQ = () => {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Atualiza o título da página
    document.title = "Perguntas Frequentes | MAR - Crie Valor";
  }, []);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  const faqItems = [
    {
      question: "O que é o MAR - Mapa para Alto Rendimento?",
      answer: "O MAR é uma metodologia proprietária desenvolvida pela Crie Valor para diagnosticar e potencializar o desempenho de empresas através de uma abordagem sistêmica que analisa estratégia e posicionamento de mercado, processos operacionais, gestão de pessoas, finanças e inovação. É um guia completo para transformar o marketing da sua empresa."
    },
    {
      question: "Como funciona o questionário MAR?",
      answer: "O questionário MAR é composto por 25 perguntas distribuídas em 8 módulos, abordando diferentes aspectos do seu negócio. Após responder todas as questões, nossa equipe analisa suas respostas e prepara um diagnóstico personalizado com recomendações práticas para melhorar o desempenho do seu marketing."
    },
    {
      question: "É possível editar minhas respostas após finalizar o questionário?",
      answer: "Não, uma vez que o questionário é finalizado e validado, não é possível editar as respostas. Isso garante a integridade do diagnóstico. Caso precise atualizar alguma informação, entre em contato com nossa equipe de suporte."
    },
    {
      question: "Quanto tempo leva para receber os resultados da análise?",
      answer: "Após a conclusão do questionário, nossa equipe leva de 3 a 5 dias úteis para analisar suas respostas e preparar o diagnóstico personalizado. Você receberá uma notificação por e-mail quando os resultados estiverem disponíveis."
    },
    {
      question: "O acesso aos materiais exclusivos é permanente?",
      answer: "Sim, uma vez que você tenha acesso à área de membros, poderá acessar todos os materiais exclusivos por tempo indeterminado. Novos materiais são adicionados regularmente para complementar sua jornada de aprendizado."
    },
    {
      question: "Posso compartilhar meu acesso à área de membros com outras pessoas da minha empresa?",
      answer: "Cada acesso é individual e intransferível, vinculado ao seu e-mail e credenciais. Se outras pessoas da sua empresa precisarem de acesso, recomendamos adquirir licenças adicionais. Entre em contato conosco para opções de planos empresariais."
    },
    {
      question: "Como posso obter suporte técnico se tiver problemas com a plataforma?",
      answer: "Você pode entrar em contato com nossa equipe de suporte técnico através do e-mail contato@crievalor.com.br ou pelo WhatsApp. Nossa equipe está disponível para ajudar de segunda a sexta-feira, das 9h às 18h."
    },
    {
      question: "Existe algum pré-requisito para utilizar o MAR?",
      answer: "Não há pré-requisitos técnicos. A metodologia MAR foi projetada para ser acessível a empresas de todos os portes e níveis de maturidade em marketing. O importante é ter disponibilidade para responder o questionário com dados precisos sobre seu negócio."
    },
    {
      question: "Como os resultados do MAR podem ajudar minha empresa?",
      answer: "Os resultados do MAR proporcionam um diagnóstico completo da situação atual do marketing da sua empresa, identificando pontos fortes e oportunidades de melhoria. Com base nessa análise, você receberá recomendações personalizadas e um plano de ação prático para implementar melhorias que podem aumentar significativamente seus resultados."
    },
    {
      question: "A Crie Valor oferece serviços de consultoria para implementação das recomendações?",
      answer: "Sim, além do diagnóstico, oferecemos serviços de consultoria especializada para implementação das recomendações. Nossa equipe pode trabalhar diretamente com sua empresa para colocar em prática as estratégias identificadas no MAR. Para mais informações sobre esses serviços, entre em contato conosco."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader />
      
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-4xl mx-auto">
          <Card className="border-0 shadow-md rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-indigo-600 to-blue-700 text-white">
              <div className="flex items-center gap-2">
                <QuestionMarkCircledIcon className="h-6 w-6" />
                <CardTitle>Perguntas Frequentes</CardTitle>
              </div>
              <CardDescription className="text-blue-100">
                Encontre respostas para as dúvidas mais comuns sobre o MAR
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-6">
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`} className="border-b border-slate-200 py-2">
                    <AccordionTrigger className="text-left font-medium text-slate-800 hover:text-blue-700">
                      {item.question}
                    </AccordionTrigger>
                    <AccordionContent className="text-slate-600 pt-2 pb-4 px-4">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
          
          <div className="mt-8 text-center bg-white p-6 rounded-xl shadow-sm">
            <h3 className="text-lg font-medium mb-3">Não encontrou o que procurava?</h3>
            <p className="text-slate-600 mb-4">Entre em contato conosco para obter suporte personalizado</p>
            <div className="flex flex-wrap justify-center gap-4">
              <a href="mailto:contato@crievalor.com.br" className="inline-block">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect width="20" height="16" x="2" y="4" rx="2" />
                    <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                  </svg>
                  E-mail
                </button>
              </a>
              <a href="https://wa.me/5567999999999" target="_blank" rel="noreferrer" className="inline-block">
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  WhatsApp
                </button>
              </a>
            </div>
          </div>
        </div>
      </div>
      
      <SiteFooler />
    </div>
  );
};

export default FAQ;
