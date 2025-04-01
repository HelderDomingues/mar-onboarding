
import { useEffect } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { QuizHeader } from "@/components/quiz/QuizHeader";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, BookOpen, BarChart } from "lucide-react";

const Dashboard = () => {
  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // You can add any dashboard initialization logic here
    console.log("Dashboard mounted for user:", user);
  }, [user]);

  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <QuizHeader />
      
      <main className="flex-1 container max-w-5xl py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">Welcome to your Quiz Vault</h1>
        <p className="text-gray-600 mb-8">Access your exclusive member quizzes below.</p>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Assessment Questionnaire</CardTitle>
              <CardDescription>Comprehensive profile assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                <Clock className="h-4 w-4" />
                <span>15-20 minutes</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BookOpen className="h-4 w-4" />
                <span>25 questions</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full bg-quiz hover:bg-quiz-dark"
                onClick={() => navigate("/quiz")}
              >
                Start Quiz
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Past Results</CardTitle>
              <CardDescription>Review your previous submissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <BarChart className="h-4 w-4" />
                <span>View analysis and insights</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full border-quiz text-quiz hover:bg-quiz/10"
              >
                View Results
              </Button>
            </CardFooter>
          </Card>
          
          <Card className="hover:shadow-md transition-shadow">
            <CardHeader>
              <CardTitle>Member Resources</CardTitle>
              <CardDescription>Additional materials and guides</CardDescription>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Access exclusive resources and supplementary materials for members.
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                className="w-full border-quiz text-quiz hover:bg-quiz/10"
              >
                Browse Resources
              </Button>
            </CardFooter>
          </Card>
        </div>
      </main>
      
      <footer className="bg-white py-4 border-t text-center text-sm text-muted-foreground">
        <p>© {new Date().getFullYear()} Quiz Vault. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
