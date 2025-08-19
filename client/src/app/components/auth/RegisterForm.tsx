"use client";

import React, { useState } from 'react';
import { ArrowRight, Check, Mail, Lock, User } from 'lucide-react'; // Removed BookOpen
import { useRouter } from 'next/navigation';
import TextInput from './TextInput';
import PasswordInput from './PasswordInput';
import SocialButtons from './SocialButtons';
import PasswordStrengthIndicator from './PasswordStrengthIndicator'; // Assuming this exists and is styled

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
      newErrors.name = 'Full name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
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
        credentials: "include",
      });

      if (!res.ok) {
        const errorText = await res.text();
        setErrors({ general: errorText || "Registration failed." });
        return;
      }

      // If registration succeeded, redirect to sign-in page, assuming a successful registration means you want them to sign in
      router.push('/auth?form=signin');
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
        <h1 className="text-3xl font-bold text-black mb-2">Create your account</h1>
        <p className="text-slate-600">Start organizing your bookmarks with AI</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {errors.general && (
          <div className="bg-red-50 text-red-700 p-3 rounded-lg flex items-center gap-2">
            <Lock className="w-5 h-5" />
            <p className="text-sm">{errors.general}</p>
          </div>
        )}
        <TextInput
          label="Full Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          error={errors.name}
          placeholder="John Doe"
          icon={<User className="w-5 h-5 text-slate-500" />}
          type="text"
        />

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
          placeholder="Create a strong password"
          showPassword={showPassword}
          toggleShowPassword={() => setShowPassword(!showPassword)}
          icon={<Lock className="w-5 h-5 text-slate-500" />}
        />
        {formData.password && <PasswordStrengthIndicator password={formData.password} />}

        <PasswordInput
          label="Confirm Password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleInputChange}
          error={errors.confirmPassword}
          placeholder="Re-enter your password"
          showPassword={showConfirmPassword}
          toggleShowPassword={() => setShowConfirmPassword(!showConfirmPassword)}
          icon={<Lock className="w-5 h-5 text-slate-500" />}
        />
        {formData.confirmPassword && formData.password === formData.confirmPassword && !errors.confirmPassword && (
          <div className="flex items-center gap-2 mt-2 text-green-600 text-sm">
            <Check className="w-4 h-4" />
            Passwords match!
          </div>
        )}

        <div>
          <label className="flex items-start gap-3 cursor-pointer">
            <input
              type="checkbox"
              className="mt-1 rounded bg-green-100 border-green-200 text-purple-600 focus:ring-purple-600/50 focus:ring-2"
              required
            />
            <span className="text-sm text-slate-600">
              I agree to the{' '}
              <a href="#" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">Terms of Service</a>
              {' '}and{' '}
              <a href="#" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">Privacy Policy</a>
            </span>
          </label>
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
              Create Account
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-green-100"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white/80 px-4 text-slate-600">Or sign up with</span>
          </div>
        </div>

        <SocialButtons /> {/* Assuming this component is styled internally */}

        <p className="text-center text-slate-600 mt-6">
          Already have an account?{' '}
          <button
            type="button"
            onClick={onSwitchToSignIn}
            className="text-purple-600 hover:text-purple-700 font-semibold transition-colors"
          >
            Sign in
          </button>
        </p>
      </form>
    </div>
  );
};

export default RegisterForm;
