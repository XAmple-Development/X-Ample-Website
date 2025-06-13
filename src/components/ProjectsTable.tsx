
import React from 'react';
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
import { Plus, Trash2 } from 'lucide-react';

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

interface ProjectsTableProps {
  projects: Project[];
  loading: boolean;
  onCreateProject: () => void;
  onUpdateProjectStatus: (projectId: string, status: string) => void;
  onDeleteProject: (projectId: string) => void;
}

const ProjectsTable = ({ 
  projects, 
  loading, 
  onCreateProject, 
  onUpdateProjectStatus, 
  onDeleteProject 
}: ProjectsTableProps) => {
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
    <Card className="bg-white/10 backdrop-blur-sm border-white/20 mb-8">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">All Projects</h2>
          <Button
            onClick={onCreateProject}
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
                        onChange={(e) => onUpdateProjectStatus(project.id, e.target.value)}
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
                              onClick={() => onDeleteProject(project.id)}
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
  );
};

export default ProjectsTable;
