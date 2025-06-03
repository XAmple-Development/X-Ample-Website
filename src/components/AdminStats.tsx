
import React from 'react';
import { Card } from '@/components/ui/card';
import { Folder, Users, Clock, CheckCircle } from 'lucide-react';

interface AdminStatsProps {
  totalProjects: number;
  totalClients: number;
  activeProjects: number;
  completedProjects: number;
}

const AdminStats = ({ 
  totalProjects, 
  totalClients, 
  activeProjects, 
  completedProjects 
}: AdminStatsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
        <div className="flex items-center">
          <Folder className="w-8 h-8 text-purple-400 mr-3" />
          <div>
            <p className="text-gray-300">Total Projects</p>
            <p className="text-2xl font-bold text-white">{totalProjects}</p>
          </div>
        </div>
      </Card>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
        <div className="flex items-center">
          <Users className="w-8 h-8 text-cyan-400 mr-3" />
          <div>
            <p className="text-gray-300">Total Clients</p>
            <p className="text-2xl font-bold text-white">{totalClients}</p>
          </div>
        </div>
      </Card>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
        <div className="flex items-center">
          <Clock className="w-8 h-8 text-blue-400 mr-3" />
          <div>
            <p className="text-gray-300">Active Projects</p>
            <p className="text-2xl font-bold text-white">{activeProjects}</p>
          </div>
        </div>
      </Card>
      <Card className="bg-white/10 backdrop-blur-sm border-white/20 p-6">
        <div className="flex items-center">
          <CheckCircle className="w-8 h-8 text-green-400 mr-3" />
          <div>
            <p className="text-gray-300">Completed</p>
            <p className="text-2xl font-bold text-white">{completedProjects}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AdminStats;
