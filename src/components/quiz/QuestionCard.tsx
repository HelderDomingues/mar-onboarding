
import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";

export type QuestionType = 'multiple-choice' | 'text' | 'checkbox';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
}

interface QuestionCardProps {
  question: Question;
  onAnswer: (questionId: string, answer: string | string[]) => void;
  onNext: () => void;
  onPrev: () => void;
  isFirst: boolean;
  isLast: boolean;
  currentAnswer?: string | string[];
}

export function QuestionCard({
  question,
  onAnswer,
  onNext,
  onPrev,
  isFirst,
  isLast,
  currentAnswer,
}: QuestionCardProps) {
  // For multiple choice
  const [selectedOption, setSelectedOption] = useState<string>(
    typeof currentAnswer === 'string' ? currentAnswer : ''
  );
  
  // For text questions
  const [textAnswer, setTextAnswer] = useState<string>(
    typeof currentAnswer === 'string' ? currentAnswer : ''
  );
  
  // For checkbox questions
  const [checkedOptions, setCheckedOptions] = useState<string[]>(
    Array.isArray(currentAnswer) ? currentAnswer : []
  );
  
  const handleCheckboxChange = (option: string) => {
    setCheckedOptions((prev) => {
      if (prev.includes(option)) {
        return prev.filter((item) => item !== option);
      } else {
        return [...prev, option];
      }
    });
  };
  
  const handleNext = () => {
    if (question.type === 'multiple-choice') {
      onAnswer(question.id, selectedOption);
    } else if (question.type === 'text') {
      onAnswer(question.id, textAnswer);
    } else if (question.type === 'checkbox') {
      onAnswer(question.id, checkedOptions);
    }
    onNext();
  };

  return (
    <Card className="w-full max-w-2xl animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl">
          {question.text}
          {question.required && <span className="text-red-500 ml-1">*</span>}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {question.type === 'multiple-choice' && question.options && (
          <RadioGroup 
            value={selectedOption} 
            onValueChange={setSelectedOption}
            className="space-y-3"
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${index}`} />
                <Label htmlFor={`option-${index}`} className="text-base">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
        
        {question.type === 'text' && (
          <Textarea
            placeholder="Type your answer here..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            className="min-h-[120px]"
          />
        )}
        
        {question.type === 'checkbox' && question.options && (
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Checkbox 
                  id={`checkbox-${index}`} 
                  checked={checkedOptions.includes(option)}
                  onCheckedChange={() => handleCheckboxChange(option)}
                />
                <label
                  htmlFor={`checkbox-${index}`}
                  className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrev}
          disabled={isFirst}
        >
          Previous
        </Button>
        
        <Button 
          onClick={handleNext} 
          className="bg-quiz hover:bg-quiz-dark"
          disabled={
            (question.required && question.type === 'multiple-choice' && !selectedOption) ||
            (question.required && question.type === 'text' && !textAnswer) ||
            (question.required && question.type === 'checkbox' && checkedOptions.length === 0)
          }
        >
          {isLast ? "Submit" : "Next"}
        </Button>
      </CardFooter>
    </Card>
  );
}
