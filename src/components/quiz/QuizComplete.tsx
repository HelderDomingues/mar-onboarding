
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function QuizComplete() {
  const navigate = useNavigate();
  
  return (
    <Card className="w-full max-w-md animate-fade-in">
      <CardHeader className="text-center">
        <CheckCircle className="w-16 h-16 mx-auto text-green-500 mb-4" />
        <CardTitle className="text-2xl font-bold">Quiz Completed!</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-center text-muted-foreground">
          Thank you for completing the quiz. Your responses have been saved successfully.
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button 
          onClick={() => navigate("/dashboard")} 
          className="bg-quiz hover:bg-quiz-dark"
        >
          Back to Dashboard
        </Button>
      </CardFooter>
    </Card>
  );
}
