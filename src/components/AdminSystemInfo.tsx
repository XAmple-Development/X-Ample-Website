
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Server, 
  Database, 
  Users, 
  Activity,
  RefreshCw,
  AlertTriangle
} from 'lucide-react';

interface SystemStats {
  totalUsers: number;
  activeUsers: number;
  totalProjects: number;
  discordIntegrations: number;
  recentActivity: any[];
}

const AdminSystemInfo = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 0,
    activeUsers: 0,
    totalProjects: 0,
    discordIntegrations: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSystemStats = async () => {
    try {
      setLoading(true);
      
      // Fetch user count
      const { data: users, error: usersError } = await supabase
        .from('profiles')
        .select('id, created_at')
        .order('created_at', { ascending: false });

      if (usersError) throw usersError;

      // Fetch projects count
      const { data: projects, error: projectsError } = await supabase
        .from('projects')
        .select('id, created_at, status')
        .order('created_at', { ascending: false });

      if (projectsError) throw projectsError;

      // Fetch Discord integrations count
      const { data: discordIntegrations, error: discordError } = await supabase
        .from('discord_integrations')
        .select('id');

      if (discordError) throw discordError;

      // Calculate stats
      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      
      const activeUsers = users?.filter(user => 
        new Date(user.created_at) > oneWeekAgo
      ).length || 0;

      setStats({
        totalUsers: users?.length || 0,
        activeUsers,
        totalProjects: projects?.length || 0,
        discordIntegrations: discordIntegrations?.length || 0,
        recentActivity: projects?.slice(0, 5) || []
      });

    } catch (error) {
      console.error('Error fetching system stats:', error);
      toast({
        title: "Error",
        description: "Failed to load system statistics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSystemStats();
  }, []);

  return (
    <div className="space-y-6">
      {/* System Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white shadow-lg rounded-2xl">
          <CardContent className="p-6 flex items-center">
            <Users className="w-8 h-8 text-blue-400 mr-3" />
            <div>
              <p className="text-gray-300">Total Users</p>
              <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white shadow-lg rounded-2xl">
          <CardContent className="p-6 flex items-center">
            <Activity className="w-8 h-8 text-green-400 mr-3" />
            <div>
              <p className="text-gray-300">Active Users</p>
              <p className="text-2xl font-bold text-white">{stats.activeUsers}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white shadow-lg rounded-2xl">
          <CardContent className="p-6 flex items-center">
            <Database className="w-8 h-8 text-purple-400 mr-3" />
            <div>
              <p className="text-gray-300">Total Projects</p>
              <p className="text-2xl font-bold text-white">{stats.totalProjects}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white shadow-lg rounded-2xl">
          <CardContent className="p-6 flex items-center">
            <Server className="w-8 h-8 text-cyan-400 mr-3" />
            <div>
              <p className="text-gray-300">Discord Links</p>
              <p className="text-2xl font-bold text-white">{stats.discordIntegrations}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white shadow-lg rounded-2xl">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Recent Activity</CardTitle>
          <Button
            onClick={fetchSystemStats}
            disabled={loading}
            variant="outline"
            size="sm"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.recentActivity.length === 0 ? (
              <p className="text-gray-400 text-center py-4">No recent activity</p>
            ) : (
              stats.recentActivity.map((activity, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                  <div>
                    <p className="text-white font-medium">{activity.title}</p>
                    <p className="text-gray-300 text-sm">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge className={
                    activity.status === 'completed' ? 'bg-green-500' :
                    activity.status === 'in_progress' ? 'bg-blue-500' :
                    activity.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-500'
                  }>
                    {activity.status}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSystemInfo;
