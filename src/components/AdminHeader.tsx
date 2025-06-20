import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut, Users, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import NotificationCenter from '@/components/NotificationCenter';

interface AdminHeaderProps {
    onSignOut: () => void;
}

const AdminHeader = ({ onSignOut }: AdminHeaderProps) => {
    const navigate = useNavigate();
    const location = useLocation();
    const isOnUserManagement = location.pathname === '/users';
    const isOnDashboard = location.pathname === '/dashboard';

    return (
        <div className="flex justify-between items-center mb-8">
            <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                    Admin Dashboard
                </h1>
                <p className="text-gray-300">Manage all projects and users</p>
            </div>
            <div className="flex items-center space-x-4">
                <NotificationCenter />

                {/* Home Button */}
                <Button
                    onClick={() => navigate('/')}
                    variant="outline"
                    className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                >
                    <Home className="w-4 h-4 mr-2" />
                    Home
                </Button>

                {/* Status Button */}
                <Button
                    onClick={() => window.open('https://status.x-ampledevelopment.com')}
                    variant="outline"
                    className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
                >
                    <Home className="w-4 h-4 mr-2" />
                    Live Status
                </Button>

                {/* Conditional Buttons */}
                {isOnUserManagement ? (
                    <Button
                        onClick={() => navigate('/dashboard')}
                        variant="outline"
                        className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                    >
                        Back to Dashboard
                    </Button>
                ) : isOnDashboard ? (
                    <Button
                        onClick={() => navigate('/users')}
                        variant="outline"
                        className="border-green-500/20 text-green-400 hover:bg-green-500/10"
                    >
                        <Users className="w-4 h-4 mr-2" />
                        Manage Users
                    </Button>
                ) : null}

                {/* Sign Out Button */}
                <Button
                    onClick={onSignOut}
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                </Button>
            </div>
        </div>
    );
};

export default AdminHeader;
