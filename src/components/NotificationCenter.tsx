
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Bell, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: Date;
  read: boolean;
}

const NotificationCenter = () => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: 'Welcome to Admin Dashboard',
      message: 'You have successfully logged in as an administrator.',
      type: 'success',
      timestamp: new Date(),
      read: false,
    },
    {
      id: '2',
      title: 'System Update',
      message: 'New features have been added to the dashboard.',
      type: 'info',
      timestamp: new Date(Date.now() - 1000 * 60 * 30),
      read: false,
    },
  ]);

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let channel: any = null;

    const setupRealtimeSubscription = () => {
      const channelName = `notifications_${Date.now()}_${Math.random()}`;
      
      channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'projects'
          },
          (payload) => {
            console.log('Project change detected:', payload);
            
            if (payload.eventType === 'INSERT') {
              const newNotification: Notification = {
                id: Date.now().toString(),
                title: 'New Project Created',
                message: `Project "${payload.new.title}" has been created.`,
                type: 'info',
                timestamp: new Date(),
                read: false,
              };
              setNotifications(prev => [newNotification, ...prev]);
            } else if (payload.eventType === 'UPDATE') {
              const newNotification: Notification = {
                id: Date.now().toString(),
                title: 'Project Updated',
                message: `Project "${payload.new.title}" has been updated.`,
                type: 'info',
                timestamp: new Date(),
                read: false,
              };
              setNotifications(prev => [newNotification, ...prev]);
            }
          }
        );

      channel.subscribe((status: string) => {
        if (status === 'SUBSCRIBED') {
          console.log('Notification subscription active');
        }
      });
    };

    setupRealtimeSubscription();

    return () => {
      if (channel) {
        console.log('Cleaning up notification channel');
        supabase.removeChannel(channel);
      }
    };
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const getTypeColor = (type: Notification['type']) => {
    switch (type) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="relative border-white/20 text-white hover:bg-white/10"
        >
          <Bell className="w-4 h-4" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-2 -right-2 px-1 py-0 text-xs min-w-[1.2rem] h-5"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 bg-white border-gray-200" align="end">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={markAllAsRead}
                className="text-blue-600 hover:text-blue-700"
              >
                Mark all read
              </Button>
            )}
          </div>
          
          <div className="max-h-96 overflow-y-auto space-y-2">
            {notifications.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No notifications</p>
            ) : (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg border transition-colors ${
                    notification.read
                      ? 'bg-gray-50 border-gray-200'
                      : 'bg-blue-50 border-blue-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium text-sm ${getTypeColor(notification.type)}`}>
                          {notification.title}
                        </h4>
                        {!notification.read && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-600 text-xs mt-1">
                        {notification.message}
                      </p>
                      <p className="text-gray-400 text-xs mt-1">
                        {notification.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                        >
                          •
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeNotification(notification.id)}
                        className="h-6 w-6 p-0 text-gray-400 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationCenter;
