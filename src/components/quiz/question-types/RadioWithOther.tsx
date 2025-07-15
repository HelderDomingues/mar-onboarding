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
  disabled?: boolean;
  hint?: string;
  error?: string | null;
}

export const RadioWithOther: React.FC<RadioWithOtherProps> = ({
  id,
  options,
  value,
  onChange,
  disabled = false,
  hint,
  error
}) => {
  const [otherText, setOtherText] = useState('');
  const [selectedValue, setSelectedValue] = useState(value);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Encontrar a opção "Outro" ou "Outros"
  const otherOption = options.find(option => 
    option.text.toLowerCase().includes('outro')
  );

  // Verificar se o valor atual é um texto personalizado (não está nas opções predefinidas)
  const isCustomValue = value && !options.some(option => option.text === value);

  useEffect(() => {
    if (isCustomValue && otherOption) {
      setSelectedValue(otherOption.text);
      setOtherText(value);
    } else {
      setSelectedValue(value);
      setOtherText('');
    }
  }, [value, isCustomValue, otherOption]);

  const handleRadioChange = (selectedOptionText: string) => {
    setSelectedValue(selectedOptionText);
    
    if (otherOption && selectedOptionText === otherOption.text) {
      // Se selecionou "Outro", manter o texto atual ou limpar
      onChange(otherText || selectedOptionText);
    } else {
      // Se selecionou uma opção predefinida, usar o texto da opção
      setOtherText('');
      onChange(selectedOptionText);
    }
  };

  const handleOtherTextChange = (text: string) => {
    setOtherText(text);
    
    // Clear previous timeout
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    // Debounce the onChange call
    debounceRef.current = setTimeout(() => {
      if (otherOption && selectedValue === otherOption.text) {
        // Sempre enviar o texto digitado, mesmo se estiver vazio
        onChange(text.trim() ? text : otherOption.text);
      }
    }, 500);
  };

  const isOtherSelected = otherOption && selectedValue === otherOption.text;

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

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
            
            {/* Campo de texto adicional para "Outro" */}
            {otherOption && option.id === otherOption.id && isOtherSelected && (
              <div className="ml-6">
                <Input
                  type="text"
                  value={otherText}
                  onChange={(e) => handleOtherTextChange(e.target.value)}
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