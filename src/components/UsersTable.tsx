
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
import { UserPlus, Edit, Shield, ShieldOff, Trash2 } from 'lucide-react';

interface Profile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

interface UsersTableProps {
  profiles: Profile[];
  currentUserId?: string;
  onCreateUser: () => void;
  onEditUser: (user: Profile) => void;
  onToggleUserRole: (userId: string, currentRole: string) => void;
  onDeleteUser: (userId: string) => void;
}

const UsersTable = ({ 
  profiles, 
  currentUserId, 
  onCreateUser, 
  onEditUser, 
  onToggleUserRole, 
  onDeleteUser 
}: UsersTableProps) => {
  return (
    <Card className="bg-white/10 backdrop-blur-sm border-white/20">
      <div className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">All Users</h2>
          <Button
            onClick={onCreateUser}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Create User
          </Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="border-white/20">
              <TableHead className="text-gray-300">Name</TableHead>
              <TableHead className="text-gray-300">Email</TableHead>
              <TableHead className="text-gray-300">Role</TableHead>
              <TableHead className="text-gray-300">Joined</TableHead>
              <TableHead className="text-gray-300">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {profiles.map((user) => (
              <TableRow key={user.id} className="border-white/20">
                <TableCell className="text-white">{user.full_name || 'Unknown'}</TableCell>
                <TableCell className="text-white">{user.email}</TableCell>
                <TableCell>
                  <Badge 
                    className={user.role === 'admin' ? 'bg-purple-500' : 'bg-blue-500'}
                  >
                    {user.role}
                  </Badge>
                </TableCell>
                <TableCell className="text-gray-300">
                  {new Date(user.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditUser(user)}
                      className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onToggleUserRole(user.id, user.role)}
                      className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
                      title={user.role === 'admin' ? 'Demote to Client' : 'Promote to Admin'}
                    >
                      {user.role === 'admin' ? <ShieldOff className="w-4 h-4" /> : <Shield className="w-4 h-4" />}
                    </Button>
                    {user.id !== currentUserId && (
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
                            <AlertDialogTitle className="text-white">Delete User</AlertDialogTitle>
                            <AlertDialogDescription className="text-gray-300">
                              Are you sure you want to delete user "{user.full_name || user.email}"? This action cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
                              Cancel
                            </AlertDialogCancel>
                            <AlertDialogAction 
                              onClick={() => onDeleteUser(user.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
};

export default UsersTable;
