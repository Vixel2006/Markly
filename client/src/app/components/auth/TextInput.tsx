// components/auth/TextInput.tsx
import React from 'react';
import { AlertCircle } from 'lucide-react';

interface TextInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder: string;
  icon: React.ReactNode; // Icon passed as prop
  type: 'text' | 'email';
}

const TextInput: React.FC<TextInputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  icon,
  type,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-black mb-2">{label}</label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full pl-12 pr-4 py-3 bg-white border rounded-xl text-black placeholder-slate-500
            focus:outline-none focus:ring-2 transition-all shadow-sm
            ${error
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-green-200 focus:border-purple-500 focus:ring-purple-500/50'
            }`}
          placeholder={placeholder}
        />
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default TextInput;
