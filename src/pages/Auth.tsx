import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import LiquidGlass from 'liquid-glass-react';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  const { signUp, signIn, user, profile, loading } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  console.log('Auth page: loading:', loading, 'user:', user?.email, 'profile:', profile?.email);

  // Redirect authenticated users - but give a reasonable timeout
  useEffect(() => {
    if (!loading && user) {
      console.log('Auth page: User is authenticated, redirecting to dashboard');
      // Redirect immediately if we have both user and profile
      if (profile) {
        navigate('/dashboard', { replace: true });
        return;
      }
      
      // If we have user but no profile yet, wait a bit but not forever
      const timer = setTimeout(() => {
        console.log('Auth page: Timeout reached, redirecting anyway');
        navigate('/dashboard', { replace: true });
      }, 3000); // Reduced from 5000 to 3000ms
      
      return () => clearTimeout(timer);
    }
  }, [user, profile, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      let result;
      if (isLogin) {
        console.log('Auth page: Attempting sign in');
        result = await signIn(email, password);
      } else {
        console.log('Auth page: Attempting sign up');
        result = await signUp(email, password, fullName);
      }

      if (result.error) {
        console.error('Auth page: Auth error:', result.error);
        toast({
          title: "Error",
          description: result.error.message,
          variant: "destructive"
        });
      } else {
        console.log('Auth page: Auth successful');
        if (!isLogin) {
          toast({
            title: "Success",
            description: "Please check your email to confirm your account."
          });
        } else {
          toast({
            title: "Success",
            description: "Signed in successfully!"
          });
        }
      }
    } catch (error: any) {
      console.error('Auth page: Unexpected error:', error);
      toast({
        title: "Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Show loading with timeout - don't get stuck forever
  if (loading) {
    console.log('Auth page: Showing loading state');
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // If user is authenticated but we're still here, show the form anyway
  // This prevents infinite loading if there are profile issues
  console.log('Auth page: Rendering auth form');
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <LiquidGlass
        width={400}
        height={600}
        borderRadius={16}
        glassOpacity={0.1}
        blur={20}
        className="p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            {isLogin ? 'Welcome Back' : 'Join X-Ample Dev'}
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
                className="mt-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-1 focus:ring-white/20 rounded-lg transition-all duration-200"
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
              className="mt-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-1 focus:ring-white/20 rounded-lg transition-all duration-200"
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
              className="mt-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder:text-white/50 focus:border-white/30 focus:ring-1 focus:ring-white/20 rounded-lg transition-all duration-200"
              placeholder="Enter your password"
              required
            />
          </div>

          <Button
            type="submit"
            className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white font-medium py-3 rounded-lg transition-all duration-200 hover:border-white/30 hover:shadow-lg"
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
      </LiquidGlass>
    </div>
  );
};

export default Auth;
