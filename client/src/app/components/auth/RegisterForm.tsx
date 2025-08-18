// components/auth/RegisterForm.tsx
"use client";

import React, { useState } from 'react';
import { BookOpen, ArrowRight, AlertCircle, Check, Mail, Lock, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import TextInput from './TextInput';
import PasswordInput from './PasswordInput';
import SocialButtons from './SocialButtons';
import PasswordStrengthIndicator from './PasswordStrengthIndicator';

interface RegisterFormProps {
  onSwitchToSignIn: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToSignIn }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
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

    try {
      const res = await fetch("http://localhost:8080/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include", // make sure spelling is correct
      });

      if (!res.ok) {
        const errorText = await res.text();
        alert(errorText || "Registration failed");
        return;
      }

      // If registration succeeded, redirect to sign-in
      router.push('/auth?form=sign-in');
    } catch (err) {
      console.error("Network error:", err);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
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
        <h1 className="text-3xl font-bold mb-2">Create your account</h1>
        <p className="text-slate-400">Start organizing your bookmarks with AI</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <TextInput
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
          placeholder="Enter your full name"
          icon={<User className="w-5 h-5" />}
          type="text"
        />

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
          placeholder="Create a password"
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
        />
        {formData.password && <PasswordStrengthIndicator password={formData.password} />}

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          placeholder="Confirm your password"
          showPassword={showConfirmPassword}
          toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
        />
        {formData.confirmPassword && formData.password === formData.confirmPassword && (
          <div className="flex items-center gap-2 mt-2 text-green-400 text-sm">
            <Check className="w-4 h-4" />
            Passwords match
          </div>
        )}

        <div>
          <label className="flex items-start gap-3">
            <input type="checkbox" className="mt-1 rounded bg-slate-800 border-slate-700 text-blue-500 focus:ring-blue-500/50" required />
            <span className="text-sm text-slate-400">
              I agree to the{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Privacy Policy</a>
            </span>
          </label>
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
              Create Account
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-slate-900 px-4 text-slate-400">Or sign up with</span>
          </div>
        </div>

        <SocialButtons />

        <p className="text-center text-slate-400">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;
