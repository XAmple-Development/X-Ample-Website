import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
    CardFooter,
} from '@/components/ui/glass/card';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import SEO from '@/components/SEO';
import ParticlesBackground from '@/components/ParticlesBackground';

const Auth = () => {
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [alert, setAlert] = useState<{
        type: 'success' | 'error';
        message: string;
    } | null>(null);

    const { signUp, signIn, user, profile, loading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!loading && user) {
            if (profile) {
                navigate('/dashboard', { replace: true });
            } else {
                setAlert({
                    type: 'success',
                    message: 'Setting up your profile, please wait...',
                });
                const timer = setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 3000);
                return () => clearTimeout(timer);
            }
        }
    }, [user, profile, loading, navigate]);

    useEffect(() => {
        if (alert) {
            const timer = setTimeout(() => setAlert(null), 4000);
            return () => clearTimeout(timer);
        }
    }, [alert]);

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
                setAlert({
                    type: 'error',
                    message: result.error.message,
                });
            } else {
                setAlert({
                    type: 'success',
                    message: isLogin
                        ? 'Signed in successfully!'
                        : 'Please check your email to confirm your account.',
                });
            }
        } catch (error: unknown) {
            const message =
                error instanceof Error
                    ? error.message
                    : 'An unexpected error occurred';
            setAlert({
                type: 'error',
                message,
            });
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center relative">
                <ParticlesBackground className="absolute inset-0 z-0" />
                <motion.div 
                    className="text-white text-xl relative z-10"
                    animate={{ opacity: [0.5, 1, 0.5] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    Loading...
                </motion.div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4 relative">
            <SEO 
                title="Sign In - X-Ample Development"
                description="Sign in to your X-Ample Development account to access your dashboard and manage your projects."
                url="https://x-ampledevelopment.com/auth"
            />
            
            <ParticlesBackground className="absolute inset-0 z-0" />
            
            <motion.div
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="relative z-10"
            >
                <Card className="w-full max-w-md border border-white/10 backdrop-blur-md bg-white/5 text-white shadow-lg rounded-2xl">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <CardHeader className="text-center">
                            <CardTitle className="text-3xl font-bold">
                                {isLogin ? 'Welcome Back' : 'Join X-Ample Development'}
                            </CardTitle>
                            <CardDescription>
                                {isLogin ? 'Sign in to your account' : 'Create your account'}
                            </CardDescription>
                        </CardHeader>
                    </motion.div>

                    <CardContent>
                        {alert && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`mb-4 p-3 rounded-lg border ${
                                    alert.type === 'success' 
                                        ? 'bg-green-500/10 border-green-500/30 text-green-300' 
                                        : 'bg-red-500/10 border-red-500/30 text-red-300'
                                }`}
                            >
                                <div className="font-medium">
                                    {alert.type === 'success' ? 'Success' : 'Error'}
                                </div>
                                <div className="text-sm">{alert.message}</div>
                            </motion.div>
                        )}

                        <motion.form 
                            onSubmit={handleSubmit} 
                            className="space-y-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.4 }}
                        >
                            {!isLogin && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <label
                                        htmlFor="fullName"
                                        className="block text-white/90 text-sm font-medium"
                                    >
                                        Full Name
                                    </label>
                                    <input
                                        id="fullName"
                                        type="text"
                                        value={fullName}
                                        onChange={(e) => setFullName(e.target.value)}
                                        className="mt-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-300"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </motion.div>
                            )}

                            <div>
                                <label
                                    htmlFor="email"
                                    className="block text-white/90 text-sm font-medium"
                                >
                                    Email
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="mt-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-300"
                                    placeholder="Enter your email"
                                    autoComplete="email"
                                    required
                                />
                            </div>

                            <div>
                                <label
                                    htmlFor="password"
                                    className="block text-white/90 text-sm font-medium"
                                >
                                    Password
                                </label>
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="mt-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-white/20 transition-all duration-300"
                                    placeholder="Enter your password"
                                    autoComplete={isLogin ? 'current-password' : 'new-password'}
                                    required
                                />
                            </div>

                            <motion.button
                                type="submit"
                                disabled={submitting}
                                className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white font-medium py-3 rounded-lg transition-all duration-200 hover:border-white/30 hover:shadow-lg disabled:opacity-50"
                                whileHover={{ scale: submitting ? 1 : 1.02 }}
                                whileTap={{ scale: submitting ? 1 : 0.98 }}
                            >
                                {submitting ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
                            </motion.button>
                        </motion.form>
                    </CardContent>

                    <CardFooter className="flex justify-center">
                        <motion.button
                            onClick={() => setIsLogin(!isLogin)}
                            className="text-white/70 hover:text-white text-sm transition-colors"
                            type="button"
                            whileHover={{ scale: 1.05 }}
                        >
                            {isLogin
                                ? "Don't have an account? Sign up"
                                : 'Already have an account? Sign in'}
                        </motion.button>
                    </CardFooter>
                </Card>
            </motion.div>
        </div>
    );
};

export default Auth;
