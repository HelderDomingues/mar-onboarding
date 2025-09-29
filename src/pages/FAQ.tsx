
import React, { useState, useEffect } from "react";
import { DashboardHeader } from "@/components/layout/DashboardHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, Mail, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const FAQ = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const [isAdmin, setIsAdmin] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const faqs = [
    {
      id: "1",
      question: "O que é o programa MAR?",
      answer: "O MAR (Mapa para Alto Rendimento) é um programa desenvolvido pela Crie Valor para transformar o marketing das empresas. Através de um diagnóstico completo e análise personalizada, identificamos oportunidades e criamos estratégias que impulsionam o crescimento do seu negócio."
    },
    {
      id: "2",
      question: "Como funciona o questionário MAR?",
      answer: "O questionário MAR é composto por 8 módulos com perguntas específicas sobre diferentes aspectos do seu negócio. Suas respostas são analisadas por nossa equipe para criar um diagnóstico personalizado e identificar oportunidades de crescimento. É importante responder todas as perguntas de forma honesta e detalhada para obter os melhores resultados."
    },
    {
      id: "3",
      question: "Posso alterar minhas respostas após concluir o questionário?",
      answer: "Não, após a validação final do questionário não é possível alterar as respostas. Isso garante a integridade da análise. Se você precisa realmente atualizar alguma informação, entre em contato com nossa equipe de suporte para avaliarmos seu caso específico."
    },
    {
      id: "4",
      question: "Quanto tempo leva para receber a análise dos resultados?",
      answer: "Nossa equipe analisa cuidadosamente todas as respostas, e o tempo médio para entrega da análise completa é de 5 a 7 dias úteis após a conclusão do questionário. Você será notificado por email quando sua análise estiver pronta."
    },
    {
      id: "5",
      question: "Como acessar os materiais exclusivos do programa?",
      answer: "Os materiais exclusivos estão disponíveis na seção 'Materiais' da sua área de membro. Lá você encontrará conteúdos segmentados por categoria e relevância para o seu negócio, com base nas respostas fornecidas no questionário."
    },
    {
      id: "6",
      question: "Posso compartilhar meu acesso com outras pessoas da minha equipe?",
      answer: "Não recomendamos compartilhar seus dados de acesso. Se você deseja que mais pessoas da sua equipe tenham acesso ao programa, entre em contato conosco para conhecer nossas opções de planos para equipes."
    },
    {
      id: "7",
      question: "O que acontece após a conclusão do programa MAR?",
      answer: "Após a conclusão do programa, você receberá um relatório detalhado com diagnóstico e recomendações personalizadas. Nossa equipe entrará em contato para agendar uma reunião de apresentação dos resultados e discutir os próximos passos para implementação das estratégias recomendadas."
    },
    {
      id: "8",
      question: "Preciso ter conhecimentos avançados em marketing para participar?",
      answer: "Não, o programa MAR foi desenvolvido para ser acessível a todos os níveis de conhecimento. As perguntas são claras e objetivas, e nossa equipe está disponível para esclarecer quaisquer dúvidas que possam surgir durante o processo."
    }
  ];

  const filteredFaqs = faqs.filter(faq => 
    faq.question.toLowerCase().includes(searchTerm.toLowerCase()) || 
    faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const checkUserRole = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id);

        if (!error && Array.isArray(data)) {
          const isAdminLocal = data.some((r: any) => r.role === 'admin');
          setIsAdmin(isAdminLocal);
        }
      } catch (error) {
        console.error('Erro ao verificar permissões:', error);
      }
    };
    
    checkUserRole();
  }, [user]);

  useEffect(() => {
    // Atualiza o título da página
    document.title = "Perguntas Frequentes | MAR - Crie Valor";
    
    // Redirecionar se não estiver autenticado
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) {
    return null; // Será redirecionado no useEffect
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-blue-50 to-white">
      <DashboardHeader isAdmin={isAdmin} />
      
      <div className="flex-1 container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Perguntas Frequentes</h1>
          <p className="text-slate-600">Encontre respostas para as dúvidas mais comuns sobre o programa MAR.</p>
        </div>
        
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
            <Input
              placeholder="Buscar perguntas frequentes..."
              className="pl-10 bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <Accordion type="single" collapsible className="w-full">
            {filteredFaqs.length > 0 ? (
              filteredFaqs.map((faq) => (
                <AccordionItem key={faq.id} value={faq.id} className="bg-white mb-3 rounded-lg border shadow-sm">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <span className="text-left font-medium">{faq.question}</span>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4 text-slate-600">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))
            ) : (
              <div className="text-center p-8 bg-white rounded-lg border">
                <p className="text-slate-500 mb-2">Nenhum resultado encontrado para "{searchTerm}"</p>
                <p className="text-sm text-slate-400">Tente outros termos ou entre em contato com nossa equipe</p>
              </div>
            )}
          </Accordion>
        </div>
        
        <Card className="border bg-blue-50 border-blue-100 max-w-2xl mx-auto">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-blue-800">Não encontrou o que procurava?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-slate-700 mb-4">
              Se você não encontrou resposta para sua dúvida, entre em contato com nossa equipe.
              Estamos prontos para ajudar!
            </p>
            <div className="flex flex-wrap gap-3">
              <a href="mailto:contato@crievalor.com.br">
                <Button className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>Enviar Email</span>
                </Button>
              </a>
              <a href="https://wa.me/5567996542991" target="_blank" rel="noreferrer">
                <Button variant="outline" className="flex items-center gap-2 border-blue-200 bg-white">
                  <MessageSquare className="h-4 w-4" />
                  <span>WhatsApp</span>
                </Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <SiteFooter />
    </div>
  );
};

export default FAQ;
