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

interface LoginScreenProps {
  onBack: () => void;
  onSwitchToSignUp: () => void;
  onSuccess: () => void;
}

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const LoginScreen: React.FC<LoginScreenProps> = ({ onBack, onSwitchToSignUp, onSuccess }) => {
  const { t } = useLanguage();
  const { signIn } = useAuth();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    // Validate form data
    const result = loginSchema.safeParse(formData);
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
    
    const { error } = await signIn(formData.email, formData.password);
    
    setIsLoading(false);
    
    if (error) {
      toast({
        title: "Login Failed",
        description: error.message === 'Invalid login credentials' 
          ? 'Invalid email or password. Please try again.'
          : error.message,
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Welcome Back!",
      description: "Successfully logged in",
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
            {t.welcomeBack}
          </h1>
          <div className="w-16 h-1 bg-primary rounded-full mx-auto" />
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div>
            <div className="relative">
              <Input
                type="email"
                placeholder={t.emailAddress}
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

          {/* Forgot Password */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-primary font-medium hover:underline"
            >
              {t.forgotPassword}
            </button>
          </div>

          {/* Login Button */}
          <Button type="submit" variant="farmer" size="lg" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                {t.loggingIn}
              </>
            ) : (
              t.login
            )}
          </Button>
        </form>

        {/* Social Login */}
        <div className="mt-8">
          <SocialLoginButtons />
        </div>

        {/* Switch to Sign Up */}
        <div className="mt-8 text-center">
          <span className="text-muted-foreground">{t.dontHaveAccount} </span>
          <button
            onClick={onSwitchToSignUp}
            className="text-primary font-semibold hover:underline"
          >
            {t.signUp}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginScreen;
