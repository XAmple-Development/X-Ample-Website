
import { useState, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

interface DiscordGuild {
  id: string;
  name: string;
  icon: string;
  member_count: number;
}

interface DiscordUser {
  id: string;
  username: string;
  avatar: string;
  discriminator: string;
}

export const useDiscordAPI = () => {
  const [loading, setLoading] = useState(false);
  const [guilds, setGuilds] = useState<DiscordGuild[]>([]);
  const [user, setUser] = useState<DiscordUser | null>(null);
  const { toast } = useToast();

  const fetchGuildInfo = useCallback(async (guildId: string) => {
    setLoading(true);
    try {
      // This would typically use a backend API to fetch Discord data
      // For demo purposes, we'll simulate the API call
      const mockGuild: DiscordGuild = {
        id: guildId,
        name: "X-Ample Development",
        icon: "guild_icon_hash",
        member_count: 150
      };
      
      setGuilds(prev => [...prev, mockGuild]);
      
      toast({
        title: "Success",
        description: `Fetched guild information for ${mockGuild.name}`,
      });
      
      return mockGuild;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Discord guild information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const fetchUserInfo = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      // This would typically use a backend API to fetch Discord data
      const mockUser: DiscordUser = {
        id: userId,
        username: "ExampleUser",
        avatar: "user_avatar_hash",
        discriminator: "1234"
      };
      
      setUser(mockUser);
      
      toast({
        title: "Success",
        description: `Fetched user information for ${mockUser.username}`,
      });
      
      return mockUser;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch Discord user information",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const sendWebhook = useCallback(async (webhookUrl: string, message: string) => {
    setLoading(true);
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          content: message,
          username: 'X-Ample Development',
          avatar_url: 'https://i.imgur.com/4bSGPHi.png'
        }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "Message sent to Discord successfully",
        });
      } else {
        throw new Error('Failed to send webhook');
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send Discord webhook",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    guilds,
    user,
    fetchGuildInfo,
    fetchUserInfo,
    sendWebhook
  };
};
