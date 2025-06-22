import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, LogOut, User, Folder, Pencil } from 'lucide-react';
import SecureProjectDialog from '@/components/SecureProjectDialog';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/glass/card';
import { motion } from 'framer-motion';
import ParticlesBackground from '@/components/ParticlesBackground';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

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
    const [editProject, setEditProject] = useState<Project | null>(null);

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

    const updateProject = async () => {
        if (!editProject) return;

        const { id, title, description, category, status } = editProject;

        const { error } = await supabase.from('projects').update({ title, description, category, status }).eq('id', id);
        if (error) {
            console.error('Error updating project:', error);
        } else {
            setEditProject(null);
            fetchProjects();
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
        <>
            <ParticlesBackground />
            <div className="relative z-10 min-h-screen bg-black/50 p-6">
                <div className="max-w-7xl mx-auto">
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

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
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
                    </motion.div>

                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
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
                                                    <div className="flex gap-2">
                                                        <Badge className={`${getStatusColor(project.status)} text-white`}>
                                                            {project.status.replace('_', ' ')}
                                                        </Badge>
                                                        <Button
                                                            size="icon"
                                                            variant="ghost"
                                                            className="text-white hover:text-cyan-400"
                                                            onClick={() => setEditProject(project)}
                                                        >
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                    </div>
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
                    </motion.div>
                </div>

                <SecureProjectDialog
                    open={showProjectDialog}
                    onOpenChange={setShowProjectDialog}
                    onProjectCreated={fetchProjects}
                />

                {/* Edit Project Dialog */}
                {editProject && (
                    <Dialog open={!!editProject} onOpenChange={() => setEditProject(null)}>
                        <DialogContent className="bg-white/10 backdrop-blur-lg border border-white/20">
                            <div className="space-y-4">
                                <h2 className="text-white text-lg font-semibold">Edit Project</h2>
                                <Input
                                    className="text-white bg-white/5 border-white/20"
                                    value={editProject.title}
                                    onChange={(e) => setEditProject({ ...editProject, title: e.target.value })}
                                    placeholder="Project Title"
                                />
                                <Input
                                    className="text-white bg-white/5 border-white/20"
                                    value={editProject.description}
                                    onChange={(e) => setEditProject({ ...editProject, description: e.target.value })}
                                    placeholder="Project Description"
                                />
                                <Input
                                    className="text-white bg-white/5 border-white/20"
                                    value={editProject.category}
                                    onChange={(e) => setEditProject({ ...editProject, category: e.target.value })}
                                    placeholder="Category"
                                />
                                <Select
                                    value={editProject.status}
                                    onValueChange={(value) => setEditProject({ ...editProject, status: value })}
                                >
                                    <SelectTrigger className="text-white bg-white/5 border-white/20">
                                        <SelectValue placeholder="Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="pending">Pending</SelectItem>
                                        <SelectItem value="in_progress">In Progress</SelectItem>
                                        <SelectItem value="completed">Completed</SelectItem>
                                        <SelectItem value="cancelled">Cancelled</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button onClick={updateProject} className="bg-cyan-600 text-white w-full">
                                    Save Changes
                                </Button>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}
            </div>
        </>
    );
};

export default ClientDashboard;
