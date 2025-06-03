
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
        // Create new user using edge function
        if (!password) {
          toast({
            title: "Error",
            description: "Password is required for new users",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          toast({
            title: "Error",
            description: "You must be logged in to create users",
            variant: "destructive"
          });
          setLoading(false);
          return;
        }

        const response = await fetch('https://dzcezcoivezflchsewhq.supabase.co/functions/v1/create-user', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email,
            password,
            fullName,
            role
          }),
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to create user');
        }

        toast({
          title: "Success",
          description: "User created successfully!"
        });
      }

      // Always call onUserCreated to refresh the data
      if (onUserCreated) {
        onUserCreated();
      }
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
