
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, LogOut, User, Folder } from 'lucide-react';
import SecureProjectDialog from '@/components/SecureProjectDialog';
import DiscordIntegration from '@/components/DiscordIntegration';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/glass/card';

interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    created_at: string;
    client_id: string;
}

const ClientDashboard = () => {
    const { profile, user, signOut } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showProjectDialog, setShowProjectDialog] = useState(false);

    useEffect(() => {
        if (user) fetchProjects();
    }, [user]);

    const fetchProjects = async () => {
        if (!user) {
            setLoading(false);
            return;
        }

        try {
            const { data, error } = await supabase
                .from('projects')
                .select('*')
                .eq('client_id', user.id)
                .order('created_at', { ascending: false });

            if (error) throw error;
            setProjects(data || []);
        } catch (error) {
            console.error('Error fetching projects:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'bg-green-500';
            case 'in_progress': return 'bg-blue-500';
            case 'pending': return 'bg-yellow-500';
            case 'cancelled': return 'bg-red-500';
            default: return 'bg-gray-500';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            Welcome back, {profile?.full_name || 'Client'}!
                        </h1>
                        <p className="text-gray-300">Manage your projects and track progress</p>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            onClick={() => setShowProjectDialog(true)}
                            className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            New Project
                        </Button>
                        <Button
                            onClick={signOut}
                            variant="outline"
                            className="border-white/20 text-white hover:bg-white/10"
                        >
                            <LogOut className="w-4 h-4 mr-2" />
                            Sign Out
                        </Button>
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white shadow-lg rounded-2xl">
                        <CardContent className="p-6 flex items-center">
                            <Folder className="w-8 h-8 text-purple-400 mr-3" />
                            <div>
                                <p className="text-gray-300">Total Projects</p>
                                <p className="text-2xl font-bold text-white">{projects.length}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white shadow-lg rounded-2xl">
                        <CardContent className="p-6 flex items-center">
                            <User className="w-8 h-8 text-cyan-400 mr-3" />
                            <div>
                                <p className="text-gray-300">Active Projects</p>
                                <p className="text-2xl font-bold text-white">
                                    {projects.filter((p) => p.status === 'in_progress').length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white shadow-lg rounded-2xl">
                        <CardContent className="p-6 flex items-center">
                            <div className="w-8 h-8 bg-green-500 rounded-full mr-3 flex items-center justify-center text-white font-bold">
                                ✓
                            </div>
                            <div>
                                <p className="text-gray-300">Completed</p>
                                <p className="text-2xl font-bold text-white">
                                    {projects.filter((p) => p.status === 'completed').length}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Discord Integration Section */}
                <div className="mb-8">
                    <DiscordIntegration />
                </div>

                {/* Projects Section */}
                <div className="mb-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Your Projects</h2>
                    {loading ? (
                        <div className="text-white">Loading projects...</div>
                    ) : projects.length === 0 ? (
                        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white shadow-lg rounded-2xl text-center p-8">
                            <CardContent>
                                <p className="text-gray-300 mb-4">No projects yet</p>
                                <Button
                                    onClick={() => setShowProjectDialog(true)}
                                    className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
                                >
                                    Create Your First Project
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {projects.map((project) => (
                                <Card
                                    key={project.id}
                                    className="bg-white/5 border border-white/10 backdrop-blur-md text-white shadow-lg rounded-2xl"
                                >
                                    <CardContent className="p-6">
                                        <div className="flex justify-between items-start mb-4">
                                            <h3 className="text-xl font-semibold text-white">{project.title}</h3>
                                            <Badge className={`${getStatusColor(project.status)} text-white`}>
                                                {project.status.replace('_', ' ')}
                                            </Badge>
                                        </div>
                                        <p className="text-gray-300 mb-4">{project.description}</p>
                                        <div className="flex justify-between items-center">
                                            <Badge variant="secondary" className="bg-white/20 text-white">
                                                {project.category}
                                            </Badge>
                                            <p className="text-sm text-gray-400">
                                                {new Date(project.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <SecureProjectDialog
                open={showProjectDialog}
                onOpenChange={setShowProjectDialog}
                onProjectCreated={fetchProjects}
            />
        </div>
    );
};

export default ClientDashboard;
