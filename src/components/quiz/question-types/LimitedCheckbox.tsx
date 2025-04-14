
import { useState, useEffect } from 'react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { AlertCircle } from 'lucide-react';

interface LimitedCheckboxProps {
  id: string;
  options: string[];
  value: string[];
  onChange: (value: string[]) => void;
  maxOptions?: number;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
}

export function LimitedCheckbox({
  id,
  options,
  value = [],
  onChange,
  maxOptions,
  hint,
  required = false,
  disabled = false,
  error
}: LimitedCheckboxProps) {
  const [selectedOptions, setSelectedOptions] = useState<string[]>(value || []);
  
  useEffect(() => {
    // Sincronizar com o valor externo
    if (JSON.stringify(value) !== JSON.stringify(selectedOptions)) {
      setSelectedOptions(value || []);
    }
  }, [value]);
  
  const handleCheckboxChange = (option: string, checked: boolean) => {
    let newSelectedOptions: string[];
    
    if (checked) {
      // Se já atingiu o máximo e tenta adicionar mais um, não permitir
      if (maxOptions && selectedOptions.length >= maxOptions) {
        return;
      }
      newSelectedOptions = [...selectedOptions, option];
    } else {
      newSelectedOptions = selectedOptions.filter(item => item !== option);
    }
    
    setSelectedOptions(newSelectedOptions);
    onChange(newSelectedOptions);
  };
  
  const reachedMaxLimit = maxOptions !== undefined && selectedOptions.length >= maxOptions;
  
  return (
    <div className="space-y-4">
      {maxOptions && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 p-2 rounded">
          <AlertCircle className="h-4 w-4" />
          <span>
            {selectedOptions.length === 0 ? (
              `Selecione até ${maxOptions} ${maxOptions === 1 ? 'opção' : 'opções'}`
            ) : (
              `${selectedOptions.length} de ${maxOptions} ${maxOptions === 1 ? 'opção selecionada' : 'opções selecionadas'}`
            )}
          </span>
        </div>
      )}
      
      <div className="space-y-3">
        {options.map((option, index) => {
          const optionId = `${id}-${index}`;
          const isChecked = selectedOptions.includes(option);
          
          return (
            <div key={optionId} className="flex items-start space-x-2">
              <Checkbox
                id={optionId}
                checked={isChecked}
                onCheckedChange={(checked) => {
                  if (checked !== 'indeterminate') {
                    handleCheckboxChange(option, checked);
                  }
                }}
                disabled={disabled || (!isChecked && reachedMaxLimit)}
              />
              <Label
                htmlFor={optionId}
                className={cn(
                  "text-sm font-normal leading-snug",
                  (!isChecked && reachedMaxLimit) && "text-muted-foreground",
                  disabled && "text-muted-foreground"
                )}
              >
                {option}
              </Label>
            </div>
          );
        })}
      </div>
      
      {hint && !error && (
        <p className="text-sm text-muted-foreground">
          {hint}
        </p>
      )}
      
      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}
