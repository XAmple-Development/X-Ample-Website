import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { LiquidGlass } from "https://esm.sh/liquid-glass-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { signUp, signIn, user, profile, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && user) {
      if (profile) {
        navigate('/dashboard', { replace: true });
        return;
      }
      const timer = setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [user, profile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let result;
      if (isLogin) {
        result = await signIn(email, password);
      } else {
        result = await signUp(email, password, fullName);
      }

      if (result.error) {
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Success",
          description: isLogin
            ? "Signed in successfully!"
            : "Please check your email to confirm your account."
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <LiquidGlass>
        <div className="p-8 w-full max-w-md rounded-2xl shadow-2xl border border-white/20">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isLogin ? 'Welcome Back' : 'Join X-Ample Development'}
            </h1>
            <p className="text-gray-300">
              {isLogin ? 'Sign in to your account' : 'Create your account'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <Label htmlFor="fullName" className="text-white/90 text-sm font-medium">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-2 bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-1 focus:ring-white/20 rounded-lg transition-all duration-200"
                  placeholder="Enter your full name"
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="email" className="text-white/90 text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-2 bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-1 focus:ring-white/20 rounded-lg transition-all duration-200"
                placeholder="Enter your email"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-white/90 text-sm font-medium">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-2 bg-white/5 border border-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-1 focus:ring-white/20 rounded-lg transition-all duration-200"
                placeholder="Enter your password"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-medium py-3 rounded-lg transition-all duration-200 hover:border-white/30 hover:shadow-lg"
              disabled={submitting}
            >
              {submitting ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="text-white/70 hover:text-white transition-colors duration-200 text-sm"
              type="button"
            >
              {isLogin ? "Don't have an account? Sign up" : "Already have an account? Sign in"}
            </button>
          </div>
        </div>
      </LiquidGlass>
    </div>
  );
};

export default Auth;
