import React from 'react';
import {
    Card,
    CardHeader,
    CardTitle,
    CardContent,
} from '@/components/ui/glass/card';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';

const Dashboard = () => {
    const { user, profile, loading } = useAuth();

    console.log('Dashboard: loading:', loading, 'user:', user?.email, 'profile:', profile);
    console.log('Dashboard: profile role:', profile?.role);
    console.log('Dashboard: profile object:', JSON.stringify(profile, null, 2));

    const GlassLoadingCard = ({ title, message }: { title: string; message: string }) => (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
            <Card className="w-full max-w-md border border-white/10 backdrop-blur-md bg-white/5 text-white shadow-lg rounded-2xl">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-white/80">
                    {message}
                </CardContent>
            </Card>
        </div>
    );

    // Show loading only if auth is still initializing
    if (loading) {
        return <GlassLoadingCard title="Loading" message="Please wait while we load your account..." />;
    }

    // Redirect to auth if no user
    if (!user) {
        return <Navigate to="/auth" replace />;
    }

    // If user exists but no profile yet, show loading for profile specifically
    if (!profile) {
        return <GlassLoadingCard title="Loading Profile" message="Setting up your profile..." />;
    }

    // Add explicit check for admin role
    const isAdmin = profile.role === 'admin';
    console.log('Dashboard: isAdmin check:', isAdmin);

    return isAdmin ? <AdminDashboard /> : <ClientDashboard />;
};

export default Dashboard;
