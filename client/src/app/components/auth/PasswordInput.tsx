// components/auth/PasswordInput.tsx
import React from 'react';
import { AlertCircle, Eye, EyeOff, Lock } from 'lucide-react';

interface PasswordInputProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  placeholder: string;
  showPassword: boolean;
  toggleShowPassword: () => void;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  label,
  name,
  value,
  onChange,
  error,
  placeholder,
  showPassword,
  toggleShowPassword,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full pl-12 pr-12 py-3 bg-slate-800 border rounded-xl focus:outline-none focus:ring-2 transition-all ${
            error
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-slate-700 focus:border-blue-500 focus:ring-blue-500/50'
          }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-300"
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      </div>
      {error && (
        <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

export default PasswordInput;
