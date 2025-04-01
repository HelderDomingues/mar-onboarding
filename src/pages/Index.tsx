
import { useAuth } from "@/hooks/useAuth";
import { Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Login } from "@/components/auth/Login";

const Index = () => {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white to-blue-50">
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center">
        <h1 className="text-2xl font-bold text-quiz-dark">
          <span className="text-quiz">Quiz</span>Vault
        </h1>
      </header>
      
      <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-6 gap-10 md:gap-20">
        <div className="max-w-md space-y-4 animate-slide-in">
          <h1 className="text-4xl font-bold text-quiz-dark">Members-Only Quiz Vault</h1>
          <p className="text-lg text-gray-600">
            Access exclusive quizzes and assessments designed for our members.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 pt-4">
            <Button className="bg-quiz hover:bg-quiz-dark">
              Learn More
            </Button>
            <Button variant="outline" className="border-quiz text-quiz hover:bg-quiz/10">
              Contact Us
            </Button>
          </div>
        </div>
        
        <div className="w-full max-w-md">
          <Login />
        </div>
      </div>
      
      <footer className="bg-white py-6 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Quiz Vault. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Index;
