
import React from 'react';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';

interface AdminHeaderProps {
  onSignOut: () => void;
}

const AdminHeader = ({ onSignOut }: AdminHeaderProps) => {
  return (
    <div className="flex justify-between items-center mb-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Admin Dashboard
        </h1>
        <p className="text-gray-300">Manage all projects and clients</p>
      </div>
      <Button
        onClick={onSignOut}
        variant="outline"
        className="border-white/20 text-white hover:bg-white/10"
      >
        <LogOut className="w-4 h-4 mr-2" />
        Sign Out
      </Button>
    </div>
  );
};

export default AdminHeader;
