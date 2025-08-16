// components/auth/SignInForm.tsx
"use client";

import React, { useState } from 'react';
import { BookOpen, ArrowRight, AlertCircle, Mail, Lock } from 'lucide-react';
import TextInput from './TextInput';
import PasswordInput from './PasswordInput';
import SocialButtons from './SocialButtons';

interface SignInFormProps {
  onSwitchToRegister: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSwitchToRegister }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    }

    return newErrors;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors = validateForm();

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);
    setErrors({});

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false);
      console.log('Sign In submitted:', formData);
      // Redirect or handle success
    }, 2000);
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
            <BookOpen className="w-7 h-7" />
          </div>
          <span className="text-2xl font-bold">Markly</span>
        </div>
        <h1 className="text-3xl font-bold mb-2">Welcome back</h1>
        <p className="text-slate-400">Sign in to your account to continue</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <TextInput
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          placeholder="Enter your email"
          icon={<Mail className="w-5 h-5" />}
          type="email"
        />

        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          placeholder="Enter your password"
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-blue-500/50" />
            <span className="text-sm text-slate-400">Remember me</span>
          </label>
          <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors">
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-slate-600 disabled:to-slate-600 py-3 rounded-xl font-semibold transition-all transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-slate-900 px-4 text-slate-400">Or continue with</span>
          </div>
        </div>

        <SocialButtons />

        <p className="text-center text-slate-400">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignInForm;
