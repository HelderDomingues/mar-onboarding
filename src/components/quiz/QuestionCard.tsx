
import { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InfoIcon } from "lucide-react";
import { PrefixInput } from "@/components/ui/prefix-input";

export type QuestionType = 'text' | 'number' | 'email' | 'radio' | 'checkbox' | 'textarea' | 'select' | 'instagram' | 'website';

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
  currentAnswer
}: QuestionCardProps) {
  // Para perguntas de múltipla escolha (radio)
  const [selectedOption, setSelectedOption] = useState<string>(typeof currentAnswer === 'string' ? currentAnswer : '');

  // Para perguntas de texto
  const [textAnswer, setTextAnswer] = useState<string>(typeof currentAnswer === 'string' ? currentAnswer : '');

  // Para perguntas de checkbox (múltiplas seleções)
  const [checkedOptions, setCheckedOptions] = useState<string[]>(Array.isArray(currentAnswer) ? currentAnswer : []);

  // Para opção "outro" em múltipla escolha
  const [otherValue, setOtherValue] = useState<string>('');
  const [showOtherInput, setShowOtherInput] = useState<boolean>(false);

  // Atualizar estado local quando as props mudam
  useEffect(() => {
    if (question && currentAnswer !== undefined) {
      // Redefinir estados para evitar persistência de dados entre perguntas
      if (typeof currentAnswer === 'string') {
        setTextAnswer(currentAnswer);
        setSelectedOption(currentAnswer);
  
        // Verificar se a opção "outro" está selecionada
        if (question.options?.some(opt => opt.toLowerCase().includes('outro')) && !question.options?.includes(currentAnswer) && currentAnswer !== '') {
          setOtherValue(currentAnswer);
          setShowOtherInput(true);
          if (question.type === 'radio') {
            const otherOption = question.options?.find(opt => opt.toLowerCase().includes('outro'));
            if (otherOption) setSelectedOption(otherOption);
          }
        } else {
          // Limpar o otherValue quando não estiver usando a opção "outro"
          setOtherValue('');
          setShowOtherInput(false);
        }
      } else if (Array.isArray(currentAnswer)) {
        setCheckedOptions(currentAnswer);
  
        // Verificar se alguma resposta não está entre as opções (é uma resposta "outro")
        const otherOption = question.options?.find(opt => opt.toLowerCase().includes('outro'));
        if (otherOption && currentAnswer.some(ans => !question.options?.includes(ans))) {
          setShowOtherInput(true);
          const customAnswer = currentAnswer.find(ans => !question.options?.includes(ans));
          if (customAnswer) setOtherValue(customAnswer);
        } else {
          // Limpar o otherValue quando não estiver usando a opção "outro"
          setOtherValue('');
          setShowOtherInput(false);
        }
      }
    } else {
      // Se não há resposta atual ou mudamos de questão, limpar todos os estados
      setTextAnswer('');
      setSelectedOption('');
      setCheckedOptions([]);
      setOtherValue('');
      setShowOtherInput(false);
    }
  }, [question.id, currentAnswer, question.options]);

  // Funções de manipulação
  const handleCheckboxChange = (option: string) => {
    setCheckedOptions(prev => {
      if (prev.includes(option)) {
        return prev.filter(item => item !== option);
      } else {
        return [...prev, option];
      }
    });

    // Se selecionou "outro", mostrar campo de texto
    if (option.toLowerCase().includes('outro')) {
      setShowOtherInput(!checkedOptions.includes(option));
    }
  };

  const handleRadioChange = (value: string) => {
    setSelectedOption(value);

    // Se selecionou "outro", mostrar campo de texto
    if (value.toLowerCase().includes('outro')) {
      setShowOtherInput(true);
    } else {
      setShowOtherInput(false);
    }
  };

  const handleNext = () => {
    if (question.type === 'radio') {
      // Se selecionou "outro", usar o valor do campo de texto
      if (selectedOption.toLowerCase().includes('outro') && showOtherInput && otherValue) {
        onAnswer(question.id, otherValue);
      } else {
        onAnswer(question.id, selectedOption);
      }
    } else if (question.type === 'checkbox') {
      let answers = [...checkedOptions];

      // Se selecionou "outro", substituir pela resposta personalizada
      const otherIndex = answers.findIndex(opt => opt.toLowerCase().includes('outro'));
      if (otherIndex >= 0 && showOtherInput && otherValue) {
        answers.splice(otherIndex, 1);
        answers.push(otherValue);
      }
      onAnswer(question.id, answers);
    } else if (question.type === 'instagram') {
      // Remove o prefixo se o usuário o incluiu
      let instagramUsername = textAnswer;
      if (instagramUsername.includes('instagram.com/')) {
        instagramUsername = instagramUsername.split('instagram.com/').pop() || '';
      }
      if (instagramUsername.startsWith('@')) {
        instagramUsername = instagramUsername.substring(1);
      }
      onAnswer(question.id, instagramUsername);
    } else if (question.type === 'website') {
      // Garantir que a URL tenha o protocolo
      let websiteUrl = textAnswer;
      if (websiteUrl && !websiteUrl.startsWith('http')) {
        websiteUrl = 'https://' + websiteUrl;
      }
      onAnswer(question.id, websiteUrl);
    } else {
      onAnswer(question.id, textAnswer);
    }
    onNext();
  };

  const isAnswerValid = () => {
    if (!question.required) return true;
    switch (question.type) {
      case 'radio':
        if (selectedOption.toLowerCase().includes('outro')) {
          return !!otherValue;
        }
        return !!selectedOption;
      case 'checkbox':
        if (checkedOptions.some(opt => opt.toLowerCase().includes('outro')) && !otherValue) {
          return false;
        }
        return checkedOptions.length > 0;
      case 'instagram':
      case 'website':
      case 'text':
      case 'textarea':
      case 'email':
      case 'number':
        return !!textAnswer;
      default:
        return true;
    }
  };

  // Define placeholder texts based on question type
  const getPlaceholder = () => {
    switch (question.type) {
      case 'text':
        return "Digite sua resposta aqui...";
      case 'email':
        return "Digite seu e-mail aqui...";
      case 'number':
        return "Digite um número...";
      case 'textarea':
        return "Digite sua resposta detalhada aqui...";
      case 'instagram':
        return "Seu nome de usuário sem @";
      case 'website':
        return "exemplo.com.br";
      default:
        return "Digite sua resposta aqui...";
    }
  };

  return (
    <Card className="w-full max-w-2xl animate-fade-in quiz-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-start">
          <span>{question.text}</span>
          {question.required && <span className="text-red-500 ml-1">*</span>}
          {question.hint && (
            <div className="relative ml-2 group">
              <InfoIcon className="h-5 w-5 cursor-help" />
              <div className="absolute left-0 -bottom-2 transform translate-y-full z-10 hidden group-hover:block bg-black text-white text-xs p-2 rounded w-60">
                {question.hint}
              </div>
            </div>
          )}
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {question.type === 'radio' && question.options && (
          <div>
            {question.type === 'radio' && (
              <p className="text-sm mb-4">
                Selecione uma opção abaixo
              </p>
            )}
            <RadioGroup value={selectedOption} onValueChange={handleRadioChange} className="space-y-3">
              {question.options.map((option, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`option-${question.id}-${index}`} />
                  <Label htmlFor={`option-${question.id}-${index}`} className="text-base">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
            
            {showOtherInput && (
              <div className="mt-2 pl-6">
                <Input 
                  type="text" 
                  placeholder="Especifique sua resposta..." 
                  value={otherValue} 
                  onChange={e => setOtherValue(e.target.value)} 
                  className="w-full"
                />
              </div>
            )}
          </div>
        )}
        
        {question.type === 'text' && (
          <Input 
            type="text" 
            placeholder={getPlaceholder()} 
            value={textAnswer} 
            onChange={e => setTextAnswer(e.target.value)} 
            className="w-full bg-white text-foreground"
          />
        )}
        
        {question.type === 'email' && (
          <Input 
            type="email" 
            placeholder={getPlaceholder()} 
            value={textAnswer} 
            onChange={e => setTextAnswer(e.target.value)} 
            className="w-full bg-white text-foreground" 
          />
        )}
        
        {question.type === 'number' && (
          <Input 
            type="number" 
            placeholder={getPlaceholder()} 
            value={textAnswer} 
            onChange={e => setTextAnswer(e.target.value)} 
            className="w-full bg-white text-foreground" 
          />
        )}
        
        {question.type === 'instagram' && (
          <PrefixInput 
            prefix="instagram.com/" 
            placeholder={getPlaceholder()}
            value={textAnswer} 
            onChange={e => setTextAnswer(e.target.value)}
            className="bg-white text-foreground"
          />
        )}
        
        {question.type === 'website' && (
          <PrefixInput 
            prefix="https://" 
            placeholder={getPlaceholder()}
            value={textAnswer} 
            onChange={e => setTextAnswer(e.target.value)}
            className="bg-white text-foreground"
          />
        )}
        
        {question.type === 'textarea' && (
          <Textarea 
            placeholder={getPlaceholder()} 
            value={textAnswer} 
            onChange={e => setTextAnswer(e.target.value)} 
            className="min-h-[120px] bg-white text-foreground" 
          />
        )}
        
        {question.type === 'checkbox' && question.options && (
          <div className="space-y-3">
            <p className="text-sm mb-3">
              Marque quantas opções desejar
            </p>
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
            
            {showOtherInput && (
              <div className="mt-2 pl-6">
                <Input 
                  type="text" 
                  placeholder="Especifique sua resposta..." 
                  value={otherValue} 
                  onChange={e => setOtherValue(e.target.value)} 
                  className="w-full bg-white text-foreground" 
                />
              </div>
            )}
          </div>
        )}
        
        {question.type === 'select' && question.options && (
          <select 
            className="w-full border border-gray-300 rounded-md p-2 bg-white text-black" 
            value={selectedOption} 
            onChange={e => setSelectedOption(e.target.value)}
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
          className="border-[hsl(var(--quiz-border))]"
        >
          Anterior
        </Button>
        
        <Button 
          onClick={handleNext} 
          className="quiz-btn text-white" 
          disabled={question.required && !isAnswerValid()}
        >
          {isLast ? "Finalizar" : "Próximo"}
        </Button>
      </CardFooter>
    </Card>
  );
}
