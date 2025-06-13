
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, FolderOpen, Clock } from 'lucide-react';

interface AnalyticsData {
  totalProjects: number;
  totalUsers: number;
  projectsByStatus: Array<{ name: string; value: number; color: string }>;
  projectsByMonth: Array<{ month: string; count: number }>;
  recentActivity: Array<{ type: string; description: string; timestamp: string }>;
}

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      // Fetch projects
      const { data: projects } = await supabase
        .from('projects')
        .select('*, profiles!projects_client_id_fkey(full_name, email)');

      // Fetch users
      const { data: users } = await supabase
        .from('profiles')
        .select('*');

      if (projects && users) {
        // Process status data
        const statusCounts = projects.reduce((acc, project) => {
          acc[project.status] = (acc[project.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const projectsByStatus = [
          { name: 'Pending', value: statusCounts.pending || 0, color: '#fbbf24' },
          { name: 'In Progress', value: statusCounts.in_progress || 0, color: '#3b82f6' },
          { name: 'Completed', value: statusCounts.completed || 0, color: '#10b981' },
          { name: 'On Hold', value: statusCounts.on_hold || 0, color: '#ef4444' }
        ];

        // Process monthly data
        const monthlyData = projects.reduce((acc, project) => {
          const month = new Date(project.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {} as Record<string, number>);

        const projectsByMonth = Object.entries(monthlyData)
          .map(([month, count]) => ({ month, count }))
          .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
          .slice(-6);

        // Recent activity
        const recentActivity = projects
          .slice(0, 5)
          .map(project => ({
            type: 'project',
            description: `Project "${project.title}" created`,
            timestamp: project.created_at
          }));

        setAnalytics({
          totalProjects: projects.length,
          totalUsers: users.length,
          projectsByStatus,
          projectsByMonth,
          recentActivity
        });
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="bg-white/10 backdrop-blur-sm border-white/20">
            <CardContent className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-white/20 rounded mb-2"></div>
                <div className="h-8 bg-white/20 rounded"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!analytics) return null;

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Projects</p>
                <p className="text-2xl font-bold text-white">{analytics.totalProjects}</p>
              </div>
              <FolderOpen className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Total Users</p>
                <p className="text-2xl font-bold text-white">{analytics.totalUsers}</p>
              </div>
              <Users className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Active Projects</p>
                <p className="text-2xl font-bold text-white">
                  {analytics.projectsByStatus.find(s => s.name === 'In Progress')?.value || 0}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">Completed</p>
                <p className="text-2xl font-bold text-white">
                  {analytics.projectsByStatus.find(s => s.name === 'Completed')?.value || 0}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Projects by Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.projectsByStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {analytics.projectsByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-4 mt-4">
              {analytics.projectsByStatus.map((item, index) => (
                <div key={index} className="flex items-center">
                  <div 
                    className="w-3 h-3 rounded-full mr-2" 
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-gray-300">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardHeader>
            <CardTitle className="text-white">Projects Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analytics.projectsByMonth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis dataKey="month" stroke="#9CA3AF" />
                <YAxis stroke="#9CA3AF" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1F2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#F9FAFB'
                  }}
                />
                <Bar dataKey="count" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/10 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="text-white">Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {analytics.recentActivity.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                <div>
                  <p className="text-white text-sm">{activity.description}</p>
                  <p className="text-gray-400 text-xs">
                    {new Date(activity.timestamp).toLocaleDateString()}
                  </p>
                </div>
                <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsDashboard;
