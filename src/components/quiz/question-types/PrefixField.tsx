import React from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface PrefixFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  onBlur?: (value: any) => Promise<boolean>;
  disabled?: boolean;
  hint?: string;
  error?: string | null;
  prefix: string;
  placeholder?: string;
  required?: boolean;
}

export const PrefixField: React.FC<PrefixFieldProps> = ({
  id,
  value,
  onChange,
  onBlur,
  disabled = false,
  hint,
  error,
  prefix,
  placeholder,
  required = false
}) => {
  return (
    <div className="grid gap-2">
      <div className="flex items-center border border-input rounded-md focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <span className="px-3 py-2 text-sm text-muted-foreground bg-muted border-r border-input rounded-l-md">
          {prefix}
        </span>
        <Input
          id={id}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur ? (e) => onBlur(e.target.value) : undefined}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-none"
        />
      </div>
      {hint && <p className="text-sm text-muted-foreground">{hint}</p>}
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
};