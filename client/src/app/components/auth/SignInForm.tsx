// components/auth/SignInForm.tsx
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Mail, Lock } from 'lucide-react';
import TextInput from './TextInput';
import PasswordInput from './PasswordInput';
import SocialButtons from './SocialButtons';

interface SignInFormProps {
  onSwitchToRegister: () => void;
}

const SignInForm: React.FC<SignInFormProps> = ({ onSwitchToRegister }) => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
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
      newErrors.email = 'Please enter a valid email address';
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

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        // A more user-friendly error display might be needed in a real app
        setErrors({ general: errorText || "Login Failed. Please check your credentials." });
        return;
      }

      const { token } = await res.json();
      localStorage.setItem("token", token);
      router.push('/app'); // Redirect to dashboard
    } catch (err: any) {
      console.error("Network error:", err);
      setErrors({ general: err.message || "Something went wrong. Please try again." });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1> {/* Updated text color */}
        <p className="text-slate-700">Sign in to your account to continue your journey</p> {/* Updated text color */}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <p className="text-sm">{errors.general}</p>
          </div>
        )}
        <TextInput
          label="Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
          error={errors.email}
          placeholder="your@email.com"
          icon={<Mail className="w-5 h-5 text-slate-500" />}
          type="email"
        />

        <PasswordInput
          label="Password"
          name="password"
          value={formData.password}
          onChange={handleInputChange}
          error={errors.password}
          placeholder="••••••••"
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
        />

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="rounded bg-indigo-100 border-indigo-200 text-purple-600 focus:ring-purple-600/50 focus:ring-2" // Updated bg and border
            />
            <span className="text-sm text-slate-700">Remember me</span> {/* Updated text color */}
          </label>
          <a
            href="#"
            className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
          >
            Forgot password?
          </a>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600
                     disabled:from-slate-300 disabled:to-slate-400 disabled:text-slate-600
                     py-3 rounded-xl font-semibold text-white transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed
                     flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
        >
          {isLoading ? (
            <div className="w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Sign In
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-indigo-100"></div> {/* Updated border color */}
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white/80 px-4 text-slate-700">Or continue with</span> {/* Updated text color */}
          </div>
        </div>

        <SocialButtons />

        <p className="text-center text-slate-700 mt-6"> {/* Updated text color */}
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
          >
            Sign up
          </button>
        </p>
      </form>
    </div>
  );
};

export default SignInForm;

