
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { PrefixInput } from '@/components/ui/prefix-input';

interface InstagramFieldProps {
  id: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hint?: string;
  required?: boolean;
  prefix?: string;
  error?: string | null;
}

export const InstagramField: React.FC<InstagramFieldProps> = ({
  id,
  value,
  onChange,
  placeholder = "Digite seu usuário do Instagram",
  hint,
  required = false,
  prefix = "@",
  error
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const inputValue = e.target.value.replace(/^@/, ''); // Remove @ if user types it
    onChange(inputValue);
  };

  return (
    <div>
      <PrefixInput 
        id={id}
        prefix={prefix}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full text-black bg-white" // Explicitly set text color to black
      />
      {hint && <p className="text-sm text-gray-500 mt-1">{hint}</p>}
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  );
};
