import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, HomeIcon, User, Mail, Phone } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { Separator } from "@/components/ui/separator";

export default function QuizSuccess() {
  const navigate = useNavigate();
  
  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };
  
  return (
    <div className="w-full max-w-3xl mx-auto animate-fade-in space-y-8">
      <Card className="quiz-card overflow-hidden">
        <div className="bg-green-500 h-2 w-full"></div>
        <CardHeader className="text-center pt-8">
          <div className="mx-auto bg-green-100 p-4 rounded-full w-20 h-20 flex items-center justify-center mb-4">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">Parabéns!</CardTitle>
        </CardHeader>
        
        <CardContent className="text-center px-6">
          <p className="text-xl mb-4 text-foreground">
            Você concluiu o Questionário MAR com sucesso!
          </p>
          
          <p className="text-muted-foreground mb-8">
            Agradecemos pelo tempo dedicado ao preenchimento do questionário. 
            Suas respostas são fundamentais para que possamos entender melhor o seu negócio 
            e desenvolver o MApa para Alto Rendimento ideal para o seu crescimento.
          </p>
          
          <div className="bg-muted rounded-lg p-6 border border-border">
            <h3 className="font-semibold text-lg mb-3 text-foreground">Próximos passos</h3>
            <p className="mb-4 text-muted-foreground">
              Nossa equipe irá analisar suas respostas e entraremos em contato em breve para 
              discutir os resultados e as próximas etapas do programa MAR.
            </p>
            
            <h4 className="font-medium mt-4 mb-2 text-cyan-300">Fale com um consultor</h4>
            <div className="inline-flex flex-col md:flex-row gap-5 justify-center mx-[5px]">
              <a href="https://wa.me/+5547992150289" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 w-full md:w-auto">
                <Phone className="h-4 w-4 mr-2" /> WhatsApp (47)
              </a>
              
              <a href="https://wa.me/+5567996542991" target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-green-600 text-white hover:bg-green-700 h-10 px-4 py-2 w-full md:w-auto">
                <Phone className="h-4 w-4 mr-2" /> WhatsApp (67)
              </a>
              
              <a href="mailto:contato@crievalor.com.br" className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border border-input bg-blue-500 hover:bg-blue-600 text-white h-10 px-4 py-2 w-full md:w-auto">
                <Mail className="h-4 w-4 mr-2" /> E-mail
              </a>
            </div>
          </div>
        </CardContent>
        
        <Separator className="my-2" />
        
        <CardFooter className="flex justify-center gap-4 flex-col md:flex-row p-6">
          <Button variant="default" className="w-full md:w-auto" onClick={handleNavigateToDashboard}>
            <HomeIcon className="h-4 w-4 mr-2" /> Voltar para o Dashboard
          </Button>
          
          <Link to="/quiz/view-answers">
            <Button variant="outline" className="w-full md:w-auto">
              <User className="h-4 w-4 mr-2" /> Ver Minhas Respostas
            </Button>
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}