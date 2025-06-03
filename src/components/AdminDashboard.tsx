
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/AdminHeader';
import AdminStats from '@/components/AdminStats';
import ProjectsTable from '@/components/ProjectsTable';
import ProjectDialog from '@/components/ProjectDialog';

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
      console.log('Fetching data for admin dashboard...');
      
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

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
        toast({
          title: "Error",
          description: "Failed to fetch projects",
          variant: "destructive"
        });
      } else {
        console.log('Projects fetched successfully:', projectsData?.length || 0);
        setProjects(projectsData || []);
      }

    } catch (error) {
      console.error('Error in fetchData:', error);
      toast({
        title: "Error",
        description: "Failed to fetch data",
        variant: "destructive"
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

  const stats = {
    totalProjects: projects.length,
    totalClients: 0, // We'll calculate this differently later
    activeProjects: projects.filter(p => p.status === 'in_progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length
  };

  console.log('Rendering AdminDashboard');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto">
        <AdminHeader onSignOut={signOut} />
        
        <AdminStats 
          totalProjects={stats.totalProjects}
          totalClients={stats.totalClients}
          activeProjects={stats.activeProjects}
          completedProjects={stats.completedProjects}
        />

        <ProjectsTable
          projects={projects}
          loading={loading}
          onCreateProject={() => setShowCreateDialog(true)}
          onUpdateProjectStatus={updateProjectStatus}
          onDeleteProject={deleteProject}
        />
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
