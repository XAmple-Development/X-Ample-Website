import React, { useState, useEffect } from 'react';
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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
                <div className="text-white text-xl">Loading...</div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen bg-cover bg-center flex items-center justify-center p-4"
            style={{ backgroundImage: "url('https://i.imgur.com/NPqtPtB.jpeg')" }}
        >
            <Card className="w-full max-w-md border border-white/10 backdrop-blur-md bg-white/5 text-white shadow-lg rounded-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-3xl font-bold">
                        {isLogin ? 'Welcome Back' : 'Join X-Ample Development'}
                    </CardTitle>
                    <CardDescription>
                        {isLogin ? 'Sign in to your account' : 'Create your account'}
                    </CardDescription>
                </CardHeader>

                <CardContent>
                    {alert && (
                        <Alert
                            title={alert.type === 'success' ? 'Success' : 'Error'}
                            description={alert.message}
                            variant={alert.type}
                            className="mb-4"
                        />
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {!isLogin && (
                            <div>
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
                                    className="mt-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-white/20"
                                    placeholder="Enter your full name"
                                    required
                                />
                            </div>
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
                                className="mt-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-white/20"
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
                                className="mt-2 bg-white/5 backdrop-blur-sm border border-white/10 text-white placeholder-white/50 rounded-lg px-4 py-2 w-full focus:outline-none focus:ring-1 focus:ring-white/20"
                                placeholder="Enter your password"
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={submitting}
                            className="w-full bg-white/10 backdrop-blur-sm hover:bg-white/20 border border-white/20 text-white font-medium py-3 rounded-lg transition-all duration-200 hover:border-white/30 hover:shadow-lg"
                        >
                            {submitting ? 'Loading...' : isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>
                </CardContent>

                <CardFooter className="flex justify-center">
                    <button
                        onClick={() => setIsLogin(!isLogin)}
                        className="text-white/70 hover:text-white text-sm"
                        type="button"
                    >
                        {isLogin
                            ? "Don't have an account? Sign up"
                            : 'Already have an account? Sign in'}
                    </button>
                </CardFooter>
            </Card>
        </div>
    );
};

export default Auth;
