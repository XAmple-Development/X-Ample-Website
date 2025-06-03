import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { LogOut, Users, Folder, CheckCircle, Clock, Plus, Trash2 } from 'lucide-react';
import ProjectDialog from '@/components/ProjectDialog';
import { useToast } from '@/hooks/use-toast';

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

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

const AdminDashboard = () => {
  const { profile, signOut } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch projects with client info
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

      if (projectsError) throw projectsError;

      // Fetch all profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      setProjects(projectsData || []);
      setProfiles(profilesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
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
      fetchData(); // Refresh data
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
        title: "Success",
        description: "Project deleted successfully!"
      });
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive"
      });
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

  const stats = {
    totalProjects: projects.length,
    totalClients: profiles.filter(p => p.role === 'client').length,
    activeProjects: projects.filter(p => p.status === 'in_progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Admin Dashboard
            </h1>
            <p className="text-gray-300">Manage all projects and clients</p>
          </div>
          <Button
            onClick={() => signOut()}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign Out
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
            <div className="flex items-center">
              <Folder className="w-8 h-8 text-purple-400 mr-3" />
              <div>
                <p className="text-gray-300">Total Projects</p>
                <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-cyan-400 mr-3" />
              <div>
                <p className="text-gray-300">Total Clients</p>
                <p className="text-2xl font-bold text-white">{stats.totalClients}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
            <div className="flex items-center">
              <Clock className="w-8 h-8 text-blue-400 mr-3" />
              <div>
                <p className="text-gray-300">Active Projects</p>
                <p className="text-2xl font-bold text-white">{stats.activeProjects}</p>
              </div>
            </div>
          </Card>
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
            <div className="flex items-center">
              <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
              <div>
                <p className="text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-white">{stats.completedProjects}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Projects Table */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">All Projects</h2>
              <Button
                onClick={() => setShowCreateDialog(true)}
                className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Project
              </Button>
            </div>
            {loading ? (
              <div className="text-white">Loading...</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="border-white/20">
                    <TableHead className="text-gray-300">Project</TableHead>
                    <TableHead className="text-gray-300">Client</TableHead>
                    <TableHead className="text-gray-300">Category</TableHead>
                    <TableHead className="text-gray-300">Status</TableHead>
                    <TableHead className="text-gray-300">Created</TableHead>
                    <TableHead className="text-gray-300">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {projects.map((project) => (
                    <TableRow key={project.id} className="border-white/20">
                      <TableCell className="text-white">
                        <div>
                          <p className="font-medium">{project.title}</p>
                          <p className="text-sm text-gray-400">{project.description}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-white">
                        <div>
                          <p>{project.profiles?.full_name || 'Unknown'}</p>
                          <p className="text-sm text-gray-400">{project.profiles?.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="bg-white/20 text-white">
                          {project.category}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getStatusColor(project.status)} text-white`}>
                          {project.status.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-gray-300">
                        {new Date(project.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <select
                            value={project.status}
                            onChange={(e) => updateProjectStatus(project.id, e.target.value)}
                            className="bg-white/10 border border-white/20 rounded px-2 py-1 text-white text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="in_progress">In Progress</option>
                            <option value="completed">Completed</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="bg-slate-900 border-white/20">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-white">Delete Project</AlertDialogTitle>
                                <AlertDialogDescription className="text-gray-300">
                                  Are you sure you want to delete "{project.title}"? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteProject(project.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </Card>

        {/* Clients Table */}
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-6">All Users</h2>
            <Table>
              <TableHeader>
                <TableRow className="border-white/20">
                  <TableHead className="text-gray-300">Name</TableHead>
                  <TableHead className="text-gray-300">Email</TableHead>
                  <TableHead className="text-gray-300">Role</TableHead>
                  <TableHead className="text-gray-300">Joined</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.id} className="border-white/20">
                    <TableCell className="text-white">{profile.full_name || 'Unknown'}</TableCell>
                    <TableCell className="text-white">{profile.email}</TableCell>
                    <TableCell>
                      <Badge 
                        className={profile.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}
                      >
                        {profile.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-gray-300">
                      {new Date(profile.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
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
