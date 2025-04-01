
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InfoIcon } from "lucide-react";

export type QuestionType = 'text' | 'number' | 'email' | 'radio' | 'checkbox' | 'textarea' | 'select';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  required: boolean;
  hint?: string;
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
  // Para perguntas de múltipla escolha (radio)
  const [selectedOption, setSelectedOption] = useState<string>(
    typeof currentAnswer === 'string' ? currentAnswer : ''
  );
  
  // Para perguntas de texto
  const [textAnswer, setTextAnswer] = useState<string>(
    typeof currentAnswer === 'string' ? currentAnswer : ''
  );
  
  // Para perguntas de checkbox (múltiplas seleções)
  const [checkedOptions, setCheckedOptions] = useState<string[]>(
    Array.isArray(currentAnswer) ? currentAnswer : []
  );
  
  // Atualizar estado local quando as props mudam
  useEffect(() => {
    if (typeof currentAnswer === 'string') {
      setSelectedOption(currentAnswer);
      setTextAnswer(currentAnswer);
    } else if (Array.isArray(currentAnswer)) {
      setCheckedOptions(currentAnswer);
    }
  }, [currentAnswer, question.id]);
  
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
    if (question.type === 'radio') {
      onAnswer(question.id, selectedOption);
    } else if (question.type === 'checkbox') {
      onAnswer(question.id, checkedOptions);
    } else {
      onAnswer(question.id, textAnswer);
    }
    onNext();
  };
  
  const isAnswerValid = () => {
    if (!question.required) return true;
    
    switch (question.type) {
      case 'radio':
        return !!selectedOption;
      case 'checkbox':
        return checkedOptions.length > 0;
      case 'text':
      case 'textarea':
      case 'email':
      case 'number':
        return !!textAnswer;
      default:
        return true;
    }
  };

  return (
    <Card className="w-full max-w-2xl animate-fade-in">
      <CardHeader>
        <CardTitle className="text-xl flex items-start">
          <span>{question.text}</span>
          {question.required && <span className="text-red-500 ml-1">*</span>}
          {question.hint && (
            <div className="relative ml-2 group">
              <InfoIcon className="h-5 w-5 text-muted-foreground cursor-help" />
              <div className="absolute left-0 -bottom-2 transform translate-y-full z-10 hidden group-hover:block bg-black text-white text-xs p-2 rounded w-60">
                {question.hint}
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {question.type === 'radio' && question.options && (
          <RadioGroup 
            value={selectedOption} 
            onValueChange={setSelectedOption}
            className="space-y-3"
          >
            {question.options.map((option, index) => (
              <div key={index} className="flex items-center space-x-2">
                <RadioGroupItem value={option} id={`option-${question.id}-${index}`} />
                <Label htmlFor={`option-${question.id}-${index}`} className="text-base">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        )}
        
        {question.type === 'text' && (
          <Input
            type="text"
            placeholder="Digite sua resposta aqui..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            className="w-full"
          />
        )}
        
        {question.type === 'email' && (
          <Input
            type="email"
            placeholder="Digite seu e-mail aqui..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            className="w-full"
          />
        )}
        
        {question.type === 'number' && (
          <Input
            type="number"
            placeholder="Digite um número..."
            value={textAnswer}
            onChange={(e) => setTextAnswer(e.target.value)}
            className="w-full"
          />
        )}
        
        {question.type === 'textarea' && (
          <Textarea
            placeholder="Digite sua resposta aqui..."
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
                  id={`checkbox-${question.id}-${index}`} 
                  checked={checkedOptions.includes(option)}
                  onCheckedChange={() => handleCheckboxChange(option)}
                />
                <label
                  htmlFor={`checkbox-${question.id}-${index}`}
                  className="text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {option}
                </label>
              </div>
            ))}
          </div>
        )}
        
        {question.type === 'select' && question.options && (
          <select 
            className="w-full border border-gray-300 rounded-md p-2" 
            value={selectedOption}
            onChange={(e) => setSelectedOption(e.target.value)}
          >
            <option value="">Selecione uma opção</option>
            {question.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={onPrev}
          disabled={isFirst}
        >
          Anterior
        </Button>
        
        <Button 
          onClick={handleNext} 
          className="bg-quiz hover:bg-quiz-dark"
          disabled={question.required && !isAnswerValid()}
        >
          {isLast ? "Finalizar" : "Próximo"}
        </Button>
      </CardFooter>
    </Card>
  );
}
