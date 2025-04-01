
import { useState, useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { QuestionCard, Question } from "@/components/quiz/QuestionCard";
import { QuizProgress } from "@/components/quiz/QuizProgress";
import { QuizComplete } from "@/components/quiz/QuizComplete";
import { useToast } from "@/components/ui/use-toast";

// Sample quiz data - will be replaced with data from Supabase later
const SAMPLE_QUESTIONS: Question[] = [
  {
    id: "q1",
    text: "What is your primary goal with this assessment?",
    type: "multiple-choice",
    options: [
      "Personal development",
      "Career advancement",
      "Educational purposes",
      "Health improvement",
      "Other"
    ],
    required: true
  },
  {
    id: "q2",
    text: "How would you rate your experience in this field?",
    type: "multiple-choice",
    options: [
      "Beginner (0-1 years)",
      "Intermediate (1-3 years)",
      "Advanced (3-5 years)",
      "Expert (5+ years)"
    ],
    required: true
  },
  {
    id: "q3",
    text: "Which of the following skills do you currently possess? (Select all that apply)",
    type: "checkbox",
    options: [
      "Project management",
      "Data analysis",
      "Content creation",
      "Technical writing",
      "Strategic planning",
      "Client communication"
    ],
    required: true
  },
  {
    id: "q4",
    text: "Please describe your current challenges and what you hope to achieve from this program.",
    type: "text",
    required: true
  },
  {
    id: "q5",
    text: "How many hours per week can you dedicate to this program?",
    type: "multiple-choice",
    options: [
      "Less than 2 hours",
      "2-5 hours",
      "5-10 hours",
      "10+ hours"
    ],
    required: true
  }
];

type AnswerMap = {
  [key: string]: string | string[];
};

const Quiz = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [isComplete, setIsComplete] = useState(false);
  
  const handleAnswer = (questionId: string, answer: string | string[]) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };
  
  const handleNext = () => {
    if (currentQuestionIndex < SAMPLE_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
      window.scrollTo(0, 0);
    } else {
      handleSubmitQuiz();
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
      window.scrollTo(0, 0);
    }
  };
  
  const handleSubmitQuiz = () => {
    console.log("Quiz submitted with answers:", answers);
    
    // Here we would save the answers to Supabase
    // For now, just simulate the submission
    
    toast({
      title: "Quiz submitted successfully!",
      description: "Your responses have been recorded.",
    });
    
    setIsComplete(true);
  };

  useEffect(() => {
    if (isAuthenticated) {
      console.log("Quiz started for user:", user?.id);
    }
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <QuizHeader />
      
      <main className="flex-1 container py-8 px-4 flex flex-col items-center">
        {!isComplete ? (
          <>
            <QuizProgress 
              currentStep={currentQuestionIndex + 1} 
              totalSteps={SAMPLE_QUESTIONS.length} 
            />
            
            <QuestionCard
              question={SAMPLE_QUESTIONS[currentQuestionIndex]}
              onAnswer={handleAnswer}
              onNext={handleNext}
              onPrev={handlePrevious}
              isFirst={currentQuestionIndex === 0}
              isLast={currentQuestionIndex === SAMPLE_QUESTIONS.length - 1}
              currentAnswer={answers[SAMPLE_QUESTIONS[currentQuestionIndex].id]}
            />
          </>
        ) : (
          <QuizComplete />
        )}
      </main>
      
      <footer className="bg-white py-4 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Quiz Vault. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Quiz;
