import React, { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { QuizOption } from '@/types/quiz';

interface CheckboxWithOtherProps {
  id: string;
  options: QuizOption[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
  hint?: string;
  error?: string | null;
  maxOptions?: number;
}

export const CheckboxWithOther: React.FC<CheckboxWithOtherProps> = ({
  id,
  options,
  value = [],
  onChange,
  disabled = false,
  hint,
  error,
  maxOptions
}) => {
  const [otherText, setOtherText] = useState('');

  // Encontrar a opção "Outro" ou "Outros"
  const otherOption = options.find(option => 
    option.text.toLowerCase().includes('outro')
  );

  // Separar valores predefinidos dos personalizados
  const predefinedValues = value.filter(v => 
    options.some(option => option.text === v)
  );
  const customValues = value.filter(v => 
    !options.some(option => option.text === v)
  );

  useEffect(() => {
    // Se há valores personalizados, mostrar no campo de texto
    if (customValues.length > 0) {
      setOtherText(customValues.join(', '));
    } else {
      setOtherText('');
    }
  }, [value]);

  const isOtherSelected = otherOption && (
    predefinedValues.includes(otherOption.text) || customValues.length > 0
  );

  const handleCheckboxChange = (optionText: string, checked: boolean) => {
    let newValues: string[];

    if (otherOption && optionText === otherOption.text) {
      if (checked) {
        // Adicionar "Outros" e manter texto personalizado se houver
        newValues = [...predefinedValues.filter(v => v !== otherOption.text), otherOption.text];
        if (otherText.trim()) {
          const customTexts = otherText.split(',').map(t => t.trim()).filter(t => t);
          newValues = [...newValues, ...customTexts];
        }
      } else {
        // Remover "Outros" e textos personalizados
        newValues = predefinedValues.filter(v => v !== otherOption.text);
        setOtherText('');
      }
    } else {
      if (checked) {
        // Verificar limite máximo se definido
        if (maxOptions && value.length >= maxOptions) {
          return; // Não adicionar se já atingiu o limite
        }
        newValues = [...value, optionText];
      } else {
        newValues = value.filter(v => v !== optionText);
      }
    }

    onChange(newValues);
  };

  const handleOtherTextChange = (text: string) => {
    setOtherText(text);
    
    if (otherOption && isOtherSelected) {
      const baseValues = predefinedValues.filter(v => v !== otherOption.text);
      if (text.trim()) {
        // Enviar o texto completo como um valor único, preservando espaços
        onChange([...baseValues, text]);
      } else {
        // Se o texto estiver vazio, manter apenas valores predefinidos
        onChange(baseValues);
      }
    }
  };

  const reachedMaxLimit = maxOptions && value.length >= maxOptions;

  return (
    <div className="grid gap-2">
      {options.map((option) => {
        const isChecked = predefinedValues.includes(option.text) || 
          (otherOption && option.id === otherOption.id && isOtherSelected);
        const isOtherDisabled = disabled || 
          (reachedMaxLimit && !isChecked && otherOption && option.id !== otherOption.id);

        return (
          <div key={option.id} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id={`${id}-${option.id}`}
                checked={isChecked}
                onCheckedChange={(checked) => handleCheckboxChange(option.text, checked as boolean)}
                disabled={isOtherDisabled}
              />
              <Label htmlFor={`${id}-${option.id}`} className="cursor-pointer">
                {option.text}
              </Label>
            </div>
            
            {/* Campo de texto adicional para "Outros" */}
            {otherOption && option.id === otherOption.id && isOtherSelected && (
              <div className="ml-6">
                <Input
                  type="text"
                  value={otherText}
                  onChange={(e) => handleOtherTextChange(e.target.value)}
                  placeholder="Especifique (separe múltiplas opções por vírgula)..."
                  disabled={disabled}
                  className="w-full"
                />
              </div>
            )}
          </div>
        );
      })}
      
      {maxOptions && (
        <p className="text-sm text-muted-foreground">
          {reachedMaxLimit 
            ? `Limite máximo de ${maxOptions} opções atingido`
            : `Você pode selecionar até ${maxOptions} opções`
          }
        </p>
      )}
      
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};