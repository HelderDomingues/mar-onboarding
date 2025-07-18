import React, { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { InfoIcon } from "lucide-react";
import { InstagramField } from "@/components/quiz/question-types/InstagramField";
import { UrlField } from "@/components/quiz/question-types/UrlField";
import { LimitedCheckbox } from "@/components/quiz/question-types/LimitedCheckbox";
import { QuizOption } from "@/types/quiz";

// Componente de Input com debounce
interface DebouncedInputProps {
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}

const DebouncedInput: React.FC<DebouncedInputProps> = ({ value, onChange, type = "text", placeholder, className }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <Input
      type={type}
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
};

// Componente de Textarea com debounce
interface DebouncedTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const DebouncedTextarea: React.FC<DebouncedTextareaProps> = ({ value, onChange, placeholder, className }) => {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
  };

  const handleBlur = () => {
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  return (
    <Textarea
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder={placeholder}
      className={className}
    />
  );
};

export type QuestionType = 'text' | 'number' | 'email' | 'radio' | 'checkbox' | 'textarea' | 'select' | 'url' | 'instagram' | 'phone';

export interface Question {
  id: string;
  text: string;
  type: QuestionType;
  options?: (QuizOption | string)[];
  required: boolean;
  hint?: string;
  max_options?: number;
  prefix?: string;
  validation?: string;
  placeholder?: string;
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
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [checkedOptions, setCheckedOptions] = useState<string[]>([]);
  const [otherValue, setOtherValue] = useState<string>('');
  const [showOtherInput, setShowOtherInput] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const getOptionText = (option: string | QuizOption): string => {
    return typeof option === 'string' ? option : option.text;
  };

  const getOptionValue = (option: string | QuizOption): string => {
    return typeof option === 'string' ? option : option.id;
  };

  const optionContainsText = (option: string | QuizOption, text: string): boolean => {
    const optionText = getOptionText(option);
    return optionText.toLowerCase().includes(text.toLowerCase());
  };

  const getPlaceholder = (question: Question): string => {
    if (question.placeholder) {
      return question.placeholder;
    }
    const text = question.text.toLowerCase();
    if (text.includes('telefone') || text.includes('whatsapp')) {
      return "Insira seu número com DDD, somente números (ex: 11999999999)";
    } else if (text.includes('e-mail')) {
      return "Insira seu e-mail (ex: nome@empresa.com.br)";
    } else if (text.includes('site') || text.includes('website')) {
      return "Insira o endereço web do seu site";
    } else if (text.includes('instagram')) {
      return "Digite o nome de usuário (sem @)";
    } else if (question.type === 'textarea') {
      return "Digite sua resposta detalhada aqui...";
    } else if (question.type === 'number') {
      return "Digite apenas números";
    } else {
      return "Digite sua resposta aqui...";
    }
  };

  const getQuestionType = (question: Question): QuestionType => {
    return question.type || 'text';
  };

  useEffect(() => {
    setSelectedOption('');
    setTextAnswer('');
    setCheckedOptions([]);
    setOtherValue('');
    setShowOtherInput(false);
    setValidationError(null);
    if (currentAnswer !== undefined) {
      if (typeof currentAnswer === 'string') {
        setSelectedOption(currentAnswer);
        setTextAnswer(currentAnswer);
        if (question.options && question.options.some(opt => optionContainsText(opt, 'outro')) && !question.options.some(opt => getOptionText(opt) === currentAnswer) && currentAnswer !== '') {
          setOtherValue(currentAnswer);
          setShowOtherInput(true);
          if (question.type === 'radio') {
            const otherOption = question.options.find(opt => optionContainsText(opt, 'outro'));
            if (otherOption) setSelectedOption(getOptionValue(otherOption));
          }
        }
      } else if (Array.isArray(currentAnswer)) {
        setCheckedOptions(currentAnswer);
        if (question.options) {
          const otherOption = question.options.find(opt => optionContainsText(opt, 'outro'));
          if (otherOption && currentAnswer.some(ans => !question.options?.some(opt => getOptionText(opt) === ans))) {
            setShowOtherInput(true);
            const customAnswer = currentAnswer.find(ans => !question.options?.some(opt => getOptionText(opt) === ans));
            if (customAnswer) setOtherValue(customAnswer);
          }
        }
      }
    }
  }, [question.id, currentAnswer, question.options]);

  const handleCheckboxChange = (option: string | QuizOption) => {
    const optionValue = getOptionValue(option);
    setCheckedOptions(prev => {
      if (prev.includes(optionValue)) {
        return prev.filter(item => item !== optionValue);
      } else {
        if (question.max_options && prev.length >= question.max_options && !prev.includes(optionValue)) {
          return prev;
        }
        return [...prev, optionValue];
      }
    });
    if (optionContainsText(option, 'outro')) {
      setShowOtherInput(!checkedOptions.includes(optionValue));
    }
  };

  const handleRadioChange = (value: string) => {
    setSelectedOption(value);
    if (question.options) {
      const selectedOption = question.options.find(opt => getOptionValue(opt) === value);
      if (selectedOption && optionContainsText(selectedOption, 'outro')) {
        setShowOtherInput(true);
      } else {
        setShowOtherInput(false);
      }
    }
  };

  const validateInput = (): boolean => {
    setValidationError(null);
    if (!question.required && (textAnswer === '' || selectedOption === '' || checkedOptions.length === 0)) {
      return true;
    }
    
    const questionType = getQuestionType(question);
    
    if (question.validation) {
      switch (question.validation) {
        case 'email':
          const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailPattern.test(textAnswer)) {
            setValidationError("E-mail inválido. Por favor, digite um e-mail válido.");
            return false;
          }
          break;
        case 'url':
          try {
            const urlString = textAnswer.startsWith('http') ? textAnswer : `https://${textAnswer}`;
            new URL(urlString);
          } catch (e) {
            setValidationError("URL inválida. Por favor, digite um endereço web válido.");
            return false;
          }
          break;
        case 'phone':
          const phonePattern = /^[0-9]{10,11}$/;
          if (!phonePattern.test(textAnswer.replace(/\D/g, ''))) {
            setValidationError("Telefone inválido. Digite apenas números, incluindo DDD.");
            return false;
          }
          break;
      }
    }
    
    switch (questionType) {
      case 'radio':
        if (selectedOption === '') {
          setValidationError("Selecione uma opção.");
          return false;
        }
        if (question.options) {
          const selected = question.options.find(opt => getOptionValue(opt) === selectedOption);
          if (selected && optionContainsText(selected, 'outro') && showOtherInput && otherValue === '') {
            setValidationError("Especifique sua resposta no campo 'Outro'.");
            return false;
          }
        }
        break;
      case 'checkbox':
        if (checkedOptions.length === 0) {
          setValidationError("Selecione pelo menos uma opção.");
          return false;
        }
        if (question.options) {
          const hasOtherSelected = question.options.some(opt => optionContainsText(opt, 'outro') && checkedOptions.includes(getOptionValue(opt)));
          if (hasOtherSelected && showOtherInput && otherValue === '') {
            setValidationError("Especifique sua resposta no campo 'Outro'.");
            return false;
          }
        }
        if (question.max_options && checkedOptions.length > question.max_options) {
          setValidationError(`Selecione no máximo ${question.max_options} opções.`);
          return false;
        }
        break;
      case 'text':
      case 'textarea':
        if (textAnswer.trim() === '') {
          setValidationError("Este campo é obrigatório.");
          return false;
        }
        break;
      case 'email':
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (textAnswer.trim() === '') {
          setValidationError("Este campo é obrigatório.");
          return false;
        } else if (!emailPattern.test(textAnswer)) {
          setValidationError("E-mail inválido. Por favor, digite um e-mail válido.");
          return false;
        }
        break;
      case 'number':
        if (textAnswer.trim() === '') {
          setValidationError("Este campo é obrigatório.");
          return false;
        } else if (isNaN(Number(textAnswer))) {
          setValidationError("Digite apenas números.");
          return false;
        }
        break;
      case 'url':
        if (textAnswer.trim() === '') {
          setValidationError("Este campo é obrigatório.");
          return false;
        } else {
          try {
            const urlString = textAnswer.startsWith('http') ? textAnswer : `https://${textAnswer}`;
            new URL(urlString);
          } catch (e) {
            setValidationError("URL inválida. Por favor, digite um endereço web válido.");
            return false;
          }
        }
        break;
      case 'instagram':
        if (textAnswer.trim() === '') {
          setValidationError("Este campo é obrigatório.");
          return false;
        }
        break;
    }
    return true;
  };

  const handleNext = () => {
    if (!validateInput()) {
      return;
    }
    if (question.type === 'radio') {
      if (question.options) {
        const selected = question.options.find(opt => getOptionValue(opt) === selectedOption);
        if (selected && optionContainsText(selected, 'outro') && showOtherInput && otherValue) {
          onAnswer(question.id, otherValue);
        } else if (selected) {
          onAnswer(question.id, getOptionText(selected));
        } else {
          onAnswer(question.id, selectedOption);
        }
      } else {
        onAnswer(question.id, selectedOption);
      }
    } else if (question.type === 'checkbox') {
      if (question.options) {
        const textAnswers = convertOptionsIdsToText(checkedOptions);
        
        const otherOption = question.options.find(opt => optionContainsText(opt, 'outro'));
        if (otherOption && checkedOptions.includes(getOptionValue(otherOption)) && showOtherInput && otherValue) {
          const otherIndex = textAnswers.findIndex(
            text => text === getOptionText(otherOption)
          );
          
          if (otherIndex >= 0) {
            textAnswers[otherIndex] = otherValue;
          } else {
            textAnswers.push(otherValue);
          }
        }
        
        onAnswer(question.id, textAnswers);
      } else {
        onAnswer(question.id, checkedOptions);
      }
    } else if (question.type === 'instagram' || question.type === 'url') {
      let formattedAnswer = textAnswer;
      if (question.type === 'instagram' && question.prefix && !formattedAnswer.startsWith(question.prefix)) {
        formattedAnswer = `${question.prefix}${formattedAnswer}`;
      } else if (question.type === 'url' && !formattedAnswer.startsWith('http')) {
        formattedAnswer = `https://${formattedAnswer}`;
      }
      onAnswer(question.id, formattedAnswer);
    } else {
      onAnswer(question.id, textAnswer);
    }
    onNext();
  };

  const isAnswerValid = () => {
    if (!question.required) return true;
    switch (question.type) {
      case 'radio':
        if (question.options) {
          const selected = question.options.find(opt => getOptionValue(opt) === selectedOption);
          if (selected && optionContainsText(selected, 'outro')) {
            return !!otherValue;
          }
        }
        return !!selectedOption;
      case 'checkbox':
        if (question.options) {
          const hasOtherSelected = question.options.some(opt => optionContainsText(opt, 'outro') && checkedOptions.includes(getOptionValue(opt)));
          if (hasOtherSelected && !otherValue) {
            return false;
          }
        }
        return checkedOptions.length > 0 && (!question.max_options || checkedOptions.length <= question.max_options);
      case 'text':
      case 'textarea':
      case 'email':
      case 'number':
      case 'instagram':
      case 'url':
        return !!textAnswer;
      default:
        return true;
    }
  };

  const convertOptionsIdsToText = (optionIds: string[]): string[] => {
    if (!question.options) return optionIds;
    
    return optionIds.map(optionId => {
      const option = question.options?.find(opt => getOptionValue(opt) === optionId);
      return option ? getOptionText(option) : optionId;
    });
  };

  const renderQuestion = () => {
    if (question.type === 'radio' && question.options && Array.isArray(question.options)) {
      return <div className="space-y-4">
          <p className="text-sm text-slate-300 mb-2">
            Selecione uma opção abaixo:
          </p>
          <RadioGroup value={selectedOption} onValueChange={handleRadioChange} className="space-y-3">
            {question.options.map((option, index) => {
            const optionText = getOptionText(option);
            const optionValue = getOptionValue(option);
            return <div key={index} className="flex items-center space-x-2">
                  <RadioGroupItem value={optionValue} id={`option-${question.id}-${index}`} />
                  <Label htmlFor={`option-${question.id}-${index}`} className="text-base text-white">
                    {optionText}
                  </Label>
                </div>;
          })}
          </RadioGroup>
          
          {showOtherInput && <div className="mt-2 pl-6">
            <DebouncedInput type="text" placeholder="Especifique sua resposta..." value={otherValue} onChange={setOtherValue} className="w-full text-slate-900 bg-white" />
          </div>}
        </div>;
    }
    if (question.type === 'text') {
      return <DebouncedInput type="text" placeholder={getPlaceholder(question)} value={textAnswer} onChange={setTextAnswer} className="w-full text-slate-900 bg-white mx-0 px-[40px]" />;
    }
    if (question.type === 'email') {
      return <DebouncedInput type="email" placeholder={getPlaceholder(question)} value={textAnswer} onChange={setTextAnswer} className="w-full text-slate-900 bg-white" />;
    }
    if (question.type === 'url') {
      return <UrlField id={`url-${question.id}`} value={textAnswer} onChange={setTextAnswer} placeholder={getPlaceholder(question)} hint={question.hint} required={question.required} prefix={question.prefix || 'https://'} error={validationError} />;
    }
    if (question.type === 'instagram') {
      return <InstagramField id={`instagram-${question.id}`} value={textAnswer} onChange={setTextAnswer} placeholder={getPlaceholder(question)} hint={question.hint} required={question.required} prefix={question.prefix || '@'} error={validationError} />;
    }
    if (question.type === 'number') {
      return <DebouncedInput type="number" placeholder={getPlaceholder(question)} value={textAnswer} onChange={setTextAnswer} className="w-full text-slate-900 bg-white" />;
    }
    if (question.type === 'textarea') {
      return <DebouncedTextarea placeholder={getPlaceholder(question)} value={textAnswer} onChange={setTextAnswer} className="min-h-[120px] text-slate-900 bg-white" />;
    }
    if (question.type === 'checkbox' && question.options) {
      return <div className="space-y-3">
          <p className="text-sm text-slate-300 mb-2">
            Marque quantas opções desejar:
          </p>
          {question.options.map((option, index) => {
          const optionText = getOptionText(option);
          const optionValue = getOptionValue(option);
          return <div key={index} className="flex items-center space-x-2">
                <Checkbox id={`checkbox-${question.id}-${index}`} checked={checkedOptions.includes(optionValue)} onCheckedChange={() => handleCheckboxChange(option)} />
                <label htmlFor={`checkbox-${question.id}-${index}`} className="text-white text-base font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                  {optionText}
                </label>
              </div>;
        })}
          
          {showOtherInput && <div className="mt-2 pl-6">
            <DebouncedInput type="text" placeholder="Especifique sua resposta..." value={otherValue} onChange={setOtherValue} className="w-full text-slate-900 bg-white" />
          </div>}
        </div>;
    }
    if (question.type === 'select' && question.options) {
      return <select className="w-full border border-gray-300 rounded-md p-2 text-slate-900 bg-white" value={selectedOption} onChange={e => setSelectedOption(e.target.value)}>
          <option value="">Selecione uma opção</option>
          {question.options.map((option, index) => {
          const optionText = getOptionText(option);
          const optionValue = getOptionValue(option);
          return <option key={index} value={optionValue}>
                {optionText}
              </option>;
        })}
        </select>;
    }

    return <Input type="text" placeholder="Digite sua resposta aqui..." value={textAnswer} onChange={e => setTextAnswer(e.target.value)} className="w-full text-slate-900 bg-white" />;
  };

  return <Card className="w-[800px] max-w-[90vw] mx-auto animate-fade-in quiz-card">
      <CardHeader>
        <CardTitle className="text-xl flex items-start text-white">
          <span>{question.text}</span>
          {question.required && <span className="text-red-500 ml-1">*</span>}
          {question.hint && <div className="relative ml-2 group">
              <InfoIcon className="h-5 w-5 text-slate-300 cursor-help" />
              <div className="absolute left-0 -bottom-2 transform translate-y-full z-10 hidden group-hover:block bg-black text-white text-xs p-2 rounded w-60">
                {question.hint}
              </div>
            </div>}
        </CardTitle>
      </CardHeader>
      
      <CardContent className="py-0 my-0 px-[30px]">
        {renderQuestion()}
        {validationError && <div className="mt-2 text-sm text-red-500">
            {validationError}
          </div>}
      </CardContent>
      
      <CardFooter className="flex justify-between my-[20px]">
        <Button variant="outline" onClick={onPrev} disabled={isFirst} className="border-[hsl(var(--quiz-border))] bg-slate-600 hover:bg-slate-500 text-white">
          Anterior
        </Button>
        
        <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 text-white">
          {isLast ? "Finalizar" : "Próximo"}
        </Button>
      </CardFooter>
    </Card>;
}
