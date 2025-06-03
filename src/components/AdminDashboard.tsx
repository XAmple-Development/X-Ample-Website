
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import AdminHeader from '@/components/AdminHeader';
import AdminStats from '@/components/AdminStats';
import ProjectsTable from '@/components/ProjectsTable';
import UsersTable from '@/components/UsersTable';
import ProjectDialog from '@/components/ProjectDialog';
import UserDialog from '@/components/UserDialog';

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
  const [showUserDialog, setShowUserDialog] = useState(false);
  const [editingUser, setEditingUser] = useState<Profile | null>(null);
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

      if (projectsError) {
        console.error('Error fetching projects:', projectsError);
      }

      // Fetch all profiles with more detailed logging
      console.log('Fetching all profiles...');
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
      } else {
        console.log('Fetched profiles:', profilesData);
        console.log('Number of profiles found:', profilesData?.length || 0);
      }

      // Also fetch auth users to compare
      try {
        const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers();
        if (usersError) {
          console.error('Error fetching auth users:', usersError);
        } else {
          console.log('Auth users found:', users?.length || 0);
          console.log('Auth users:', users?.map(u => ({ id: u.id, email: u.email, created_at: u.created_at })));
        }
      } catch (authError) {
        console.error('Cannot fetch auth users (normal if not admin):', authError);
      }

      setProjects(projectsData || []);
      setProfiles(profilesData || []);
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

  const deleteUser = async (userId: string) => {
    try {
      // Delete user from auth (this will cascade to profiles due to foreign key)
      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: "User deleted successfully!"
      });
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    }
  };

  const toggleUserRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'client' : 'admin';
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          role: newRole,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId);

      if (error) throw error;
      
      toast({
        title: "Success",
        description: `User ${newRole === 'admin' ? 'promoted to admin' : 'demoted to client'} successfully!`
      });
      
      fetchData(); // Refresh data
    } catch (error) {
      console.error('Error updating user role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const handleEditUser = (user: Profile) => {
    setEditingUser(user);
    setShowUserDialog(true);
  };

  const handleCloseUserDialog = () => {
    setShowUserDialog(false);
    setEditingUser(null);
  };

  const stats = {
    totalProjects: projects.length,
    totalClients: profiles.filter(p => p.role === 'client').length,
    activeProjects: projects.filter(p => p.status === 'in_progress').length,
    completedProjects: projects.filter(p => p.status === 'completed').length
  };

  console.log('Rendering AdminDashboard with profiles:', profiles);

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

        <UsersTable
          profiles={profiles}
          currentUserId={profile?.id}
          onCreateUser={() => setShowUserDialog(true)}
          onEditUser={handleEditUser}
          onToggleUserRole={toggleUserRole}
          onDeleteUser={deleteUser}
        />
      </div>
      
      <ProjectDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onProjectCreated={fetchData}
      />

      <UserDialog
        open={showUserDialog}
        onOpenChange={handleCloseUserDialog}
        onUserCreated={fetchData}
        user={editingUser}
      />
    </div>
  );
};

export default AdminDashboard;
