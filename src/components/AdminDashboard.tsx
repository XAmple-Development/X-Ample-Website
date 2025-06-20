import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/glass/card';
import AdminHeader from '@/components/AdminHeader';
import AdminStats from '@/components/AdminStats';
import AdminSystemInfo from '@/components/AdminSystemInfo';
import ProjectsTable from '@/components/ProjectsTable';
import ProjectDialog from '@/components/ProjectDialog';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import DiscordIntegration from '@/components/DiscordIntegration';

interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    created_at: string;
    profiles: {
        full_name: string;
        email: string;
    };
}

const AdminDashboard = () => {
    const { profile, signOut } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const { toast } = useToast();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const { data: projectsData, error: projectsError } = await supabase
                .from('projects')
                .select(`
          *,
          profiles!projects_client_id_fkey (
            full_name,
            email
          )
        `)
                .order('created_at', { ascending: false });

            if (projectsError) {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch projects',
                    variant: 'destructive',
                });
            } else {
                setProjects(projectsData || []);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    const updateProjectStatus = async (projectId: string, status: string) => {
        try {
            const { error } = await supabase
                .from('projects')
                .update({ status })
                .eq('id', projectId);

            if (error) throw error;
            fetchData();
        } catch (error) {
            console.error('Error updating project:', error);
        }
    };

    const deleteProject = async (projectId: string) => {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) throw error;

            toast({
                title: 'Success',
                description: 'Project deleted successfully!',
            });

            fetchData();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete project',
                variant: 'destructive',
            });
        }
    };

    const stats = {
        totalProjects: projects.length,
        totalClients: 0,
        activeProjects: projects.filter((p) => p.status === 'in_progress').length,
        completedProjects: projects.filter((p) => p.status === 'completed').length,
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <AdminHeader onSignOut={signOut} />

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-5 bg-white/10 backdrop-blur-sm rounded-xl mb-6">
                        <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="projects" className="text-white data-[state=active]:bg-white/20">
                            Projects
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">
                            Analytics
                        </TabsTrigger>
                        <TabsTrigger value="system" className="text-white data-[state=active]:bg-white/20">
                            System
                        </TabsTrigger>
                        <TabsTrigger value="integrations" className="text-white data-[state=active]:bg-white/20">
                            Integrations
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle>Admin Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AdminStats
                                    totalProjects={stats.totalProjects}
                                    totalClients={stats.totalClients}
                                    activeProjects={stats.activeProjects}
                                    completedProjects={stats.completedProjects}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="projects">
                        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle>Projects</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProjectsTable
                                    projects={projects}
                                    loading={loading}
                                    onCreateProject={() => setShowCreateDialog(true)}
                                    onUpdateProjectStatus={updateProjectStatus}
                                    onDeleteProject={deleteProject}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics">
                        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle>Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AnalyticsDashboard />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="system">
                        <AdminSystemInfo />
                    </TabsContent>

                    <TabsContent value="integrations">
                        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle>Discord Integration</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <DiscordIntegration />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <ProjectDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onProjectCreated={fetchData}
            />
        </div>
    );
};

export default AdminDashboard;
=======
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import {
    Tabs,
    TabsContent,
    TabsList,
    TabsTrigger,
} from '@/components/ui/tabs';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '@/components/ui/glass/card';
import AdminHeader from '@/components/AdminHeader';
import AdminStats from '@/components/AdminStats';
import ProjectsTable from '@/components/ProjectsTable';
import ProjectDialog from '@/components/ProjectDialog';
import AnalyticsDashboard from '@/components/AnalyticsDashboard';
import { useRouter } from 'next/router'; // Assuming Next.js

interface Project {
    id: string;
    title: string;
    description: string;
    category: string;
    status: string;
    created_at: string;
    profiles: {
        full_name: string;
        email: string;
    };
}

const AdminDashboard = () => {
    const { profile, signOut } = useAuth();
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [showCreateDialog, setShowCreateDialog] = useState(false);
    const { toast } = useToast();
    const router = useRouter();

    useEffect(() => {
        fetchData();
    }, []);

    // Fetch projects with correct type
    const fetchData = async () => {
        setLoading(true);
        try {
            const { data: projectsData, error: projectsError } = await supabase
                .from<Project>('projects')
                .select(`
                    *,
                    profiles!projects_client_id_fkey (
                        full_name,
                        email
                    )
                `)
                .order('created_at', { ascending: false });

            if (projectsError) {
                toast({
                    title: 'Error',
                    description: 'Failed to fetch projects',
                    variant: 'destructive',
                });
            } else {
                setProjects(projectsData || []);
            }
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch data',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    // Update project status locally after successful DB update
    const updateProjectStatus = async (projectId: string, status: string) => {
        try {
            const { error } = await supabase
                .from('projects')
                .update({ status })
                .eq('id', projectId);

            if (error) throw error;

            // Update local state
            setProjects((prev) =>
                prev.map((p) =>
                    p.id === projectId ? { ...p, status } : p
                )
            );
        } catch (error) {
            console.error('Error updating project:', error);
            toast({
                title: 'Error',
                description: 'Failed to update project status',
                variant: 'destructive',
            });
        }
    };

    // Delete project locally after successful DB delete
    const deleteProject = async (projectId: string) => {
        try {
            const { error } = await supabase
                .from('projects')
                .delete()
                .eq('id', projectId);

            if (error) throw error;

            // Remove project from local state
            setProjects((prev) => prev.filter((p) => p.id !== projectId));

            toast({
                title: 'Success',
                description: 'Project deleted successfully!',
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to delete project',
                variant: 'destructive',
            });
        }
    };

    // Memoize stats calculation
    const stats = useMemo(() => {
        const uniqueClients = new Set(projects.map(p => p.profiles.email)).size;
        return {
            totalProjects: projects.length,
            totalClients: uniqueClients,
            activeProjects: projects.filter((p) => p.status === 'in_progress').length,
            completedProjects: projects.filter((p) => p.status === 'completed').length,
        };
    }, [projects]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
            <div className="max-w-7xl mx-auto space-y-6">
                <AdminHeader onSignOut={signOut} />

                {/* Home button */}
                <div className="mb-4">
                    <button
                        onClick={() => router.push('/')}
                        className="px-4 py-2 bg-purple-700 text-white rounded hover:bg-purple-600 transition"
                    >
                        Home
                    </button>
                </div>

                <Tabs defaultValue="overview" className="w-full">
                    <TabsList className="grid w-full grid-cols-3 bg-white/10 backdrop-blur-sm rounded-xl mb-6">
                        <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="projects" className="text-white data-[state=active]:bg-white/20">
                            Projects
                        </TabsTrigger>
                        <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">
                            Analytics
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview">
                        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle>Admin Stats</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AdminStats
                                    totalProjects={stats.totalProjects}
                                    totalClients={stats.totalClients}
                                    activeProjects={stats.activeProjects}
                                    completedProjects={stats.completedProjects}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="projects">
                        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle>Projects</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ProjectsTable
                                    projects={projects}
                                    loading={loading}
                                    onCreateProject={() => setShowCreateDialog(true)}
                                    onUpdateProjectStatus={updateProjectStatus}
                                    onDeleteProject={deleteProject}
                                />
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="analytics">
                        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
                            <CardHeader>
                                <CardTitle>Analytics</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <AnalyticsDashboard />
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>

            <ProjectDialog
                open={showCreateDialog}
                onOpenChange={setShowCreateDialog}
                onProjectCreated={fetchData}
            />
        </div>
    );
};

export default AdminDashboard;