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
  // Optional prop for icon, though Lock is hardcoded now
  // icon?: React.ReactNode;
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
      <label className="block text-sm font-medium text-black mb-2">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500 w-5 h-5" />
        <input
          type={showPassword ? 'text' : 'password'}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full pl-12 pr-12 py-3 bg-white border rounded-xl text-black placeholder-slate-500
            focus:outline-none focus:ring-2 transition-all shadow-sm
            ${error
              ? 'border-red-500 focus:ring-red-500/50'
              : 'border-green-200 focus:border-purple-500 focus:ring-purple-500/50'
            }`}
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-700 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
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

export default PasswordInput;
