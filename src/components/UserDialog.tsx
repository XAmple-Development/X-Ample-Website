
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

interface UserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUserCreated?: () => void;
  user?: {
    id: string;
    email: string;
    full_name: string;
    role: string;
  } | null;
}

const UserDialog = ({ open, onOpenChange, onUserCreated, user }: UserDialogProps) => {
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('client');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const isEditing = !!user;

  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFullName(user.full_name || '');
      setRole(user.role);
      setPassword(''); // Don't pre-fill password for editing
    } else {
      setEmail('');
      setFullName('');
      setRole('client');
      setPassword('');
    }
  }, [user, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isEditing) {
        // Update existing user profile
        const { error } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            role: role,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (error) throw error;

        toast({
          title: "Success",
          description: "User updated successfully!"
        });
      } else {
        // Create new user
        if (!password) {
          toast({
            title: "Error",
            description: "Password is required for new users",
            variant: "destructive"
          });
          return;
        }

        const { error } = await supabase.auth.admin.createUser({
          email,
          password,
          user_metadata: {
            full_name: fullName
          }
        });

        if (error) throw error;

        // Note: The profile will be created automatically by the trigger
        toast({
          title: "Success",
          description: "User created successfully!"
        });
      }

      onUserCreated?.();
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving user:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to save user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-slate-900 border-white/20 text-white">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Create New User'}</DialogTitle>
          <DialogDescription className="text-gray-300">
            {isEditing 
              ? 'Update user information and role.' 
              : 'Create a new user account with email and password.'
            }
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="email" className="text-gray-300">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
              required
              disabled={isEditing} // Can't change email for existing users
            />
          </div>
          <div>
            <Label htmlFor="fullName" className="text-gray-300">Full Name</Label>
            <Input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
              required
            />
          </div>
          {!isEditing && (
            <div>
              <Label htmlFor="password" className="text-gray-300">Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-white/10 border-white/20 text-white"
                required
                minLength={6}
              />
            </div>
          )}
          <div>
            <Label htmlFor="role" className="text-gray-300">Role</Label>
            <Select value={role} onValueChange={setRole}>
              <SelectTrigger className="bg-white/10 border-white/20 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-slate-800 border-white/20">
                <SelectItem value="client">Client</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700"
            >
              {loading ? 'Saving...' : (isEditing ? 'Update User' : 'Create User')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserDialog;
