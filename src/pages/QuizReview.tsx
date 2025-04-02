
import { useEffect } from 'react';
import { QuizReview as QuizReviewComponent } from "@/components/quiz/QuizReview";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

const QuizReviewPage = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  // Dados de exemplo para visualização com todas as propriedades necessárias conforme interfaces
  const mockModules = [
    { id: "1", title: "Dados Gerais", description: null, order_number: 1 },
    { id: "2", title: "Financeiro", description: null, order_number: 2 }
  ];
  
  const mockQuestions = [
    { 
      id: "1", 
      text: "Qual o nome da sua empresa?", 
      module_id: "1", 
      order_number: 1,
      type: "text" as const,
      required: true,
      hint: null
    },
    { 
      id: "2", 
      text: "Quantos funcionários você tem?", 
      module_id: "1", 
      order_number: 2,
      type: "number" as const,
      required: true,
      hint: null
    },
    { 
      id: "3", 
      text: "Qual o faturamento mensal?", 
      module_id: "2", 
      order_number: 1,
      type: "text" as const,
      required: true,
      hint: null
    }
  ];
  
  const mockAnswers = {
    "1": "Crie Valor Consultoria",
    "2": "15",
    "3": "R$ 50.000,00"
  };
  
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/');
    }
  }, [isAuthenticated, navigate]);

  const handleComplete = () => {
    navigate('/quiz/success');
  };
  
  const handleEdit = () => {
    navigate('/quiz');
  };

  return (
    <div className="min-h-screen flex flex-col quiz-container">
      <QuizHeader isAdmin={true} />
      
      <main className="flex-1 container py-8 px-4 flex flex-col items-center">
        <QuizReviewComponent 
          modules={mockModules}
          questions={mockQuestions}
          answers={mockAnswers}
          onComplete={handleComplete}
          onEdit={() => handleEdit()}
        />
      </main>
      
      <footer className="py-4 border-t border-[hsl(var(--quiz-border))] text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Crie Valor. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default QuizReviewPage;
