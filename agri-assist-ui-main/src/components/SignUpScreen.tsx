import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff, Mic, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import LanguageSelector from './LanguageSelector';
import SocialLoginButtons from './SocialLoginButtons';
import { z } from 'zod';

interface SignUpScreenProps {
  onBack: () => void;
  onSwitchToLogin: () => void;
  onSuccess: () => void;
}

const signUpSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const SignUpScreen: React.FC<SignUpScreenProps> = ({ onBack, onSwitchToLogin, onSuccess }) => {
  const { t } = useLanguage();
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form data
    const result = signUpSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setIsLoading(true);
    
    const { error } = await signUp(formData.email, formData.password, formData.fullName);
    
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Sign Up Failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Account Created!",
      description: "Welcome to Farmers Friendly",
    });
    
    onSuccess();
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="text-foreground"
        >
          <ArrowLeft className="w-6 h-6" />
        </Button>
        <LanguageSelector />
      </div>

      {/* Content */}
      <div className="px-6 pb-8 animate-fade-in">
        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-foreground mb-2">
            {t.createAccount}
          </h1>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <div className="relative">
              <Input
                type="text"
                placeholder={t.fullName}
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
                aria-label="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            {errors.fullName && <p className="text-destructive text-sm mt-1">{errors.fullName}</p>}
          </div>

          {/* Email */}
          <div>
            <div className="relative">
              <Input
                type="email"
                placeholder="Email Address"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="pr-12"
                disabled={isLoading}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-primary hover:text-primary/80 transition-colors"
                aria-label="Voice input"
              >
                <Mic className="w-5 h-5" />
              </button>
            </div>
            {errors.email && <p className="text-destructive text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={t.password}
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="pr-20"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 transition-colors"
                  aria-label="Voice input"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>
            {errors.password && <p className="text-destructive text-sm mt-1">{errors.password}</p>}
          </div>

          {/* Confirm Password */}
          <div>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder={t.confirmPassword}
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="pr-20"
                disabled={isLoading}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
                <button
                  type="button"
                  className="text-primary hover:text-primary/80 transition-colors"
                  aria-label="Voice input"
                >
                  <Mic className="w-5 h-5" />
                </button>
              </div>
            </div>
            {errors.confirmPassword && <p className="text-destructive text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Sign Up Button */}
          <Button type="submit" variant="farmer" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Creating Account...
              </>
            ) : (
              t.signUp
            )}
          </Button>
        </form>

        {/* Social Login */}
        <div className="mt-8">
          <SocialLoginButtons />
        </div>

        {/* Switch to Login */}
        <div className="mt-8 text-center">
          <span className="text-muted-foreground">{t.alreadyHaveAccount} </span>
          <button
            onClick={onSwitchToLogin}
            className="text-primary font-semibold hover:underline"
          >
            {t.login}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpScreen;
