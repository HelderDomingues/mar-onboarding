
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

export function QuizHeader() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate("/");
  };
  
  return (
    <header className="bg-white border-b shadow-sm py-4 px-6 flex justify-between items-center">
      <div className="flex items-center">
        <h1 className="text-2xl font-bold text-quiz-dark">
          <span className="text-quiz">Quiz</span>Vault
        </h1>
      </div>
      
      <div className="flex items-center gap-4">
        {user && (
          <>
            <span className="text-sm hidden md:inline">
              Welcome, <strong>{user.name}</strong>
            </span>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleLogout}
              className="border-quiz text-quiz hover:bg-quiz/10"
            >
              Logout
            </Button>
          </>
        )}
      </div>
    </header>
  );
}
