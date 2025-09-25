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
  const [internalOtherText, setInternalOtherText] = useState('');
  const [selectedValue, setSelectedValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const otherOption = options.find(option => 
    option.text.toLowerCase().includes('outro')
  );

  const isCustomValue = value && !options.some(option => option.text === value);

  useEffect(() => {
    if (isCustomValue && otherOption) {
      setSelectedValue(otherOption.text);
      setInternalOtherText(value);
    } else {
      setSelectedValue(value);
      if (value !== otherOption?.text) {
        setInternalOtherText('');
      }
    }
  }, [value, isCustomValue, otherOption]);

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
      onChange(internalOtherText.trim() ? internalOtherText : otherOption.text);
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