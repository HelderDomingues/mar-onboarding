import React, { useState, useEffect, useRef } from 'react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { QuizOption } from '@/types/quiz';

interface RadioWithOtherProps {
  id: string;
  options: QuizOption[];
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: string) => void;
  disabled?: boolean;
  hint?: string;
  error?: string | null;
}

export const RadioWithOther: React.FC<RadioWithOtherProps> = ({
  id,
  options,
  value,
  onChange,
  onBlur,
  disabled = false,
  hint,
  error
}) => {
  const [internalOtherText, setInternalOtherText] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const otherOption = options.find(option => 
    option.text.toLowerCase().includes('outro')
  );

  useEffect(() => {
    // Tenta encontrar a opção por ID ou por Texto
    const selectedOption = options.find(opt => opt.id === value || opt.text === value);

    if (selectedOption) {
      // Encontrou uma opção predefinida
      setSelectedValue(selectedOption.text);
      if (otherOption && selectedOption.id !== otherOption.id) {
        setInternalOtherText('');
      }
    } else if (value && otherOption) {
      // Não encontrou, então deve ser um valor personalizado para "Outro"
      setSelectedValue(otherOption.text);
      setInternalOtherText(value);
    } else {
      // Nenhum valor ou valor inválido, reseta o estado
      setSelectedValue('');
      setInternalOtherText('');
    }
  }, [value, options, otherOption]);

  const handleRadioChange = (selectedOptionText: string) => {
    setSelectedValue(selectedOptionText);
    
    if (otherOption && selectedOptionText === otherOption.text) {
      if (internalOtherText) {
        onChange(internalOtherText);
      } else {
        onChange(selectedOptionText);
      }
      inputRef.current?.focus();
    } else {
      setInternalOtherText('');
      onChange(selectedOptionText);
    }
  };

  const handleOtherTextBlur = () => {
    if (otherOption) {
      const finalValue = internalOtherText.trim() ? internalOtherText : otherOption.text;
      onChange(finalValue);
      if (onBlur) {
        onBlur(finalValue);
      }
    }
  };

  const isOtherSelected = otherOption && selectedValue === otherOption.text;

  useEffect(() => {
    if (isOtherSelected) {
      inputRef.current?.focus();
    }
  }, [isOtherSelected]);

  return (
    <div className="grid gap-2">
      <RadioGroup 
        value={selectedValue} 
        onValueChange={handleRadioChange}
        disabled={disabled}
      >
        {options.map((option) => (
          <div key={option.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.text} 
                id={`${id}-${option.id}`} 
                disabled={disabled}
              />
              <Label htmlFor={`${id}-${option.id}`} className="cursor-pointer">
                {option.text}
              </Label>
            </div>
            
            {otherOption && option.id === otherOption.id && isOtherSelected && (
              <div className="ml-6">
                <Input
                  ref={inputRef}
                  type="text"
                  value={internalOtherText}
                  onChange={(e) => setInternalOtherText(e.target.value)}
                  onBlur={handleOtherTextBlur}
                  placeholder="Especifique..."
                  disabled={disabled}
                  className="w-full"
                />
              </div>
            )}
          </div>
        ))}
      </RadioGroup>
      
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};