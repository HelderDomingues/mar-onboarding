
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, FileText, Home, MessageCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";

export function QuizComplete() {
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  
  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader className="text-center">
        <div className="mb-4 mx-auto relative">
          <div className="absolute inset-0 bg-[hsl(var(--quiz-accent))] rounded-full opacity-20 animate-ping"></div>
          <CheckCircle className="w-16 h-16 mx-auto text-green-500 relative" />
        </div>
        <CardTitle className="text-2xl font-bold">Questionário MAR Concluído!</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="bg-green-500/10 p-4 rounded-lg border border-green-500/20">
          <p className="text-center font-medium text-green-500">
            Parabéns por completar esta importante etapa!
          </p>
        </div>
        
        <p className="text-center text-muted-foreground">
          Obrigado por completar o questionário MAR (Mapa para Alto Rendimento). 
          Suas respostas foram automaticamente processadas e enviadas para nossa equipe.
        </p>
        
        <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800 text-center">
            <strong>✅ Status:</strong> Dados consolidados e enviados automaticamente
          </p>
        </div>
        
        <Separator />
        
        <div className="space-y-2">
          <h3 className="font-medium">Próximos passos:</h3>
          <ul className="space-y-1 text-sm text-muted-foreground pl-5 list-disc">
            <li>Nossa equipe da Crie Valor irá analisar suas respostas</li>
            <li>Será preparado um relatório personalizado para o seu negócio</li>
            <li>Entraremos em contato para agendar uma reunião de apresentação</li>
            <li>Você receberá um diagnóstico completo e recomendações estratégicas</li>
          </ul>
        </div>
        
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="w-full border-[hsl(var(--quiz-accent))] text-[hsl(var(--quiz-accent))] hover:bg-[hsl(var(--quiz-accent))]/10"
            >
              <FileText className="mr-2 h-4 w-4" /> Saiba mais sobre o método MAR
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Sobre o Mapa para Alto Rendimento (MAR)</DialogTitle>
              <DialogDescription>
                O método exclusivo da Crie Valor para impulsionar o seu negócio.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <p>O MAR é uma metodologia proprietária desenvolvida pela Crie Valor para diagnosticar e potencializar o desempenho de empresas através de uma abordagem sistêmica que analisa:</p>
              
              <ul className="list-disc pl-5 space-y-1">
                <li>Estratégia e posicionamento de mercado</li>
                <li>Processos operacionais e eficiência interna</li>
                <li>Gestão de pessoas e cultura organizacional</li>
                <li>Finanças e sustentabilidade do negócio</li>
                <li>Inovação e adaptabilidade às mudanças</li>
              </ul>
              
              <p>Com base nas suas respostas, nossos especialistas irão elaborar um diagnóstico detalhado com recomendações práticas e um plano de ação personalizado.</p>
            </div>
            <DialogFooter>
              <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
      
      <CardFooter className="flex flex-col space-y-3">
        <Button 
          onClick={() => navigate("/dashboard")} 
          className="w-full bg-[hsl(var(--quiz-accent))] hover:bg-[hsl(var(--quiz-accent-hover))]"
        >
          <Home className="mr-2 h-4 w-4" /> Voltar para o Painel
        </Button>
        
        <Button 
          variant="outline"
          onClick={() => window.open('mailto:contato@crievalor.com.br')} 
          className="w-full border-[hsl(var(--quiz-border))]"
        >
          <MessageCircle className="mr-2 h-4 w-4" /> Falar com um Consultor
        </Button>
      </CardFooter>
    </Card>
  );
}
