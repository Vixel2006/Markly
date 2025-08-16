// components/auth/PasswordStrengthIndicator.tsx
import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getStrength = (pass: string) => {
    if (pass.length === 0) return { strength: 0, label: '', color: '' };
    if (pass.length < 6) return { strength: 1, label: 'Weak', color: 'text-red-400' };
    if (pass.length < 10) return { strength: 2, label: 'Medium', color: 'text-yellow-400' };
    return { strength: 3, label: 'Strong', color: 'text-green-400' };
  };

  const strength = getStrength(password);

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-slate-700 rounded-full h-1">
          <div
            className={`h-1 rounded-full transition-all duration-300 ${
              strength.strength === 1 ? 'w-1/3 bg-red-500' :
              strength.strength === 2 ? 'w-2/3 bg-yellow-500' :
              strength.strength === 3 ? 'w-full bg-green-500' : 'w-0'
            }`}
          />
        </div>
        <span className={`text-xs ${strength.color}`}>{strength.label}</span>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;
