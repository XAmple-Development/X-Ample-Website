
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import ClientDashboard from '@/components/ClientDashboard';
import AdminDashboard from '@/components/AdminDashboard';

const Dashboard = () => {
  const { user, profile, loading } = useAuth();

  console.log('Dashboard: loading:', loading, 'user:', user?.email, 'profile:', profile);
  console.log('Dashboard: profile role:', profile?.role);
  console.log('Dashboard: profile object:', JSON.stringify(profile, null, 2));

  // Show loading only if auth is still initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  // Redirect to auth if no user
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  // If user exists but no profile yet, show loading for profile specifically
  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading profile...</div>
      </div>
    );
  }

  // Add explicit check for admin role
  const isAdmin = profile.role === 'admin';
  console.log('Dashboard: isAdmin check:', isAdmin);

  return isAdmin ? <AdminDashboard /> : <ClientDashboard />;
};

export default Dashboard;
