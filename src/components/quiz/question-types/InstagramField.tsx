
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface InstagramFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  prefix?: string;
}

export function InstagramField({
  id,
  value,
  onChange,
  placeholder = 'nome.usuario',
  hint,
  required = false,
  disabled = false,
  error,
  prefix = '@'
}: InstagramFieldProps) {
  // Remover o @ se o valor começar com ele
  const [inputValue, setInputValue] = useState(
    value?.startsWith(prefix) ? value.substring(prefix.length) : value || ''
  );
  
  useEffect(() => {
    // Atualizar o inputValue quando o value externo mudar
    const newValue = value?.startsWith(prefix) ? value.substring(prefix.length) : value || '';
    if (newValue !== inputValue) {
      setInputValue(newValue);
    }
  }, [value, prefix, inputValue]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    // Remover @ se o usuário digitar
    const cleanValue = newValue.startsWith('@') ? newValue.substring(1) : newValue;
    setInputValue(cleanValue);
    onChange(cleanValue ? `${prefix}${cleanValue}` : '');
  };
  
  return (
    <div className="space-y-2">
      <div className="relative">
        <div
          className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 pointer-events-none"
          aria-hidden="true"
        >
          {prefix}
        </div>
        <Input
          id={id}
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            "pl-8",
            error && "border-red-500 focus-visible:ring-red-500"
          )}
          aria-invalid={!!error}
          aria-describedby={hint ? `${id}-hint` : undefined}
        />
      </div>
      
      {hint && !error && (
        <p id={`${id}-hint`} className="text-sm text-muted-foreground">
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
