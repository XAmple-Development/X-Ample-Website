// Upgraded AdminDashboard with Sidebar, Vacancies tab, Activity log, realtime, better filters, and animations
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useLocation } from 'react-router-dom';
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
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar';
import AppSidebar from '@/components/AppSidebar';
import AdminHeader from '@/components/AdminHeader';
import AdminStats from '@/components/AdminStats';
import ProjectsTable from '@/components/ProjectsTable';
import ProjectDialog from '@/components/ProjectDialog';
import ServerMonitor from '@/components/ServerMonitor';
import ParticlesBackground from '@/components/ParticlesBackground';
import AdminVacanciesPanel from '@/components/AdminVacanciesPanel';
import AdminActivity from '@/components/AdminActivity';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { motion } from 'framer-motion';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from 'recharts';

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
  const [filterStatus, setFilterStatus] = useState('all');
  const location = useLocation();
  const initialTab = (location.hash?.replace('#', '') || localStorage.getItem('admin-tab') || 'overview') as string;
  const [tab, setTab] = useState<string>(initialTab);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    localStorage.setItem('admin-tab', tab);
    // Keep URL hash in sync
    if (location.hash.replace('#', '') !== tab) {
      history.replaceState(null, '', `#${tab}`);
    }
  }, [tab]);

  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash.replace('#', '') || 'overview';
      setTab(h);
    };
    window.addEventListener('hashchange', onHashChange);
    return () => window.removeEventListener('hashchange', onHashChange);
  }, []);

  useEffect(() => {
    const subscription = supabase
      .channel('projects-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, () => {
        fetchData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select(`*, profiles!projects_client_id_fkey ( full_name, email )`)
        .order('created_at', { ascending: false });

      if (projectsError) {
        toast({ title: 'Error', description: 'Failed to fetch projects', variant: 'destructive' });
      } else {
        setProjects(projectsData || []);
      }
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateProjectStatus = async (projectId: string, status: string) => {
    try {
      const { error } = await supabase.from('projects').update({ status }).eq('id', projectId);
      if (error) throw error;
      fetchData();
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  const deleteProject = async (projectId: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', projectId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Project deleted successfully!' });
      fetchData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete project', variant: 'destructive' });
    }
  };

  const filteredProjects = filterStatus === 'all' ? projects : projects.filter(p => p.status === filterStatus);
  const uniqueClients = new Set(projects.map(p => p.profiles?.email)).size;

  const stats = {
    totalProjects: projects.length,
    totalClients: uniqueClients,
    activeProjects: projects.filter((p) => p.status === 'in_progress').length,
    completedProjects: projects.filter((p) => p.status === 'completed').length,
  };

  const pieData = [
    { name: 'In Progress', value: stats.activeProjects },
    { name: 'Completed', value: stats.completedProjects },
  ];

  const COLORS = ['#06b6d4', '#14b8a6'];

  return (
    <>
      <ParticlesBackground />
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <SidebarInset>
            <header className="h-12 flex items-center border-b px-2">
              <SidebarTrigger className="ml-1" />
              <div className="ml-2 text-sm text-muted-foreground">Admin</div>
            </header>

            <div className="relative z-10 p-6">
              <div className="max-w-7xl mx-auto space-y-6">
                <AdminHeader onSignOut={signOut} />

                <Tabs value={tab} onValueChange={setTab} className="w-full animate-fade-in">
                  <TabsList className="grid w-full grid-cols-6 bg-white/10 backdrop-blur-sm rounded-xl mb-6">
                    <TabsTrigger value="overview" className="text-white data-[state=active]:bg-white/20">Overview</TabsTrigger>
                    <TabsTrigger value="projects" className="text-white data-[state=active]:bg-white/20">Projects</TabsTrigger>
                    <TabsTrigger value="analytics" className="text-white data-[state=active]:bg-white/20">Analytics</TabsTrigger>
                    <TabsTrigger value="vacancies" className="text-white data-[state=active]:bg-white/20">Vacancies</TabsTrigger>
                    <TabsTrigger value="servers" className="text-white data-[state=active]:bg-white/20">Servers</TabsTrigger>
                    <TabsTrigger value="activity" className="text-white data-[state=active]:bg-white/20">Activity</TabsTrigger>
                  </TabsList>

                  <TabsContent value="overview">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg animate-fade-in">
                        <CardHeader><CardTitle>Admin Stats</CardTitle></CardHeader>
                        <CardContent>
                          <AdminStats {...stats} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="projects">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
                        <CardHeader>
                          <CardTitle>Projects</CardTitle>
                          <div className="mt-4">
                            <Select onValueChange={(val) => setFilterStatus(val)} value={filterStatus}>
                              <SelectTrigger className="w-48">
                                <SelectValue placeholder="Filter by status" />
                              </SelectTrigger>
                              <SelectContent className="bg-white z-50">
                                <SelectItem value="all">All</SelectItem>
                                <SelectItem value="in_progress">In Progress</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="cancelled">Cancelled</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </CardHeader>
                        <CardContent>
                          {filteredProjects.length === 0 && !loading ? (
                            <div className="text-center text-white/70 py-10">
                              <p className="mb-4">No projects found. Why not start one?</p>
                              <button onClick={() => setShowCreateDialog(true)} className="px-4 py-2 bg-cyan-600 text-white rounded-md hover-scale">Create Project</button>
                            </div>
                          ) : (
                            <ProjectsTable
                              projects={filteredProjects}
                              loading={loading}
                              onCreateProject={() => setShowCreateDialog(true)}
                              onUpdateProjectStatus={updateProjectStatus}
                              onDeleteProject={deleteProject}
                            />
                          )}
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="analytics">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
                        <CardHeader><CardTitle>Analytics</CardTitle></CardHeader>
                        <CardContent>
                          <div className="w-full h-96">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                                  {pieData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                  ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="vacancies">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
                        <CardHeader><CardTitle>Vacancies</CardTitle></CardHeader>
                        <CardContent>
                          <AdminVacanciesPanel />
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="servers">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white rounded-2xl shadow-lg">
                        <CardHeader><CardTitle>Server Monitor</CardTitle></CardHeader>
                        <CardContent><ServerMonitor /></CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>

                  <TabsContent value="activity">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
                      <AdminActivity />
                    </motion.div>
                  </TabsContent>
                </Tabs>
              </div>

              <ProjectDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} onProjectCreated={fetchData} />
            </div>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </>
  );
};

export default AdminDashboard;
