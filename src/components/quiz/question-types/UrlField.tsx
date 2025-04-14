
import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

interface UrlFieldProps {
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

export function UrlField({
  id,
  value,
  onChange,
  placeholder = 'www.exemplo.com.br',
  hint,
  required = false,
  disabled = false,
  error,
  prefix = 'https://'
}: UrlFieldProps) {
  // Remover o prefixo se o valor começar com ele
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
    
    // Limpar prefixos comuns se o usuário digitar
    let cleanValue = newValue;
    const prefixes = ['http://', 'https://', 'www.'];
    for (const p of prefixes) {
      if (cleanValue.startsWith(p)) {
        cleanValue = cleanValue.substring(p.length);
      }
    }
    
    setInputValue(cleanValue);
    onChange(cleanValue ? `${prefix}${cleanValue}` : '');
  };
  
  // Validação simples de URL
  const validateUrl = (url: string): boolean => {
    try {
      // Adicionar o prefixo se não estiver presente
      const completeUrl = url.startsWith('http://') || url.startsWith('https://')
        ? url
        : `${prefix}${url}`;
      new URL(completeUrl);
      return true;
    } catch (e) {
      return false;
    }
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
          type="text"
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className={cn(
            "pl-16",
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
