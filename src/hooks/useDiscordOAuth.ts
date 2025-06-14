
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface DiscordUser {
  id: string;
  username: string;
  discriminator: string;
  avatar: string | null;
}

export const useDiscordOAuth = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const initiateOAuth = useCallback(() => {
    const clientId = '1234567890123456789'; // Replace with your Discord App Client ID
    const redirectUri = encodeURIComponent(`${window.location.origin}/discord-callback`);
    const scope = encodeURIComponent('identify email');
    const state = Math.random().toString(36).substring(7);
    
    // Store state for validation
    localStorage.setItem('discord_oauth_state', state);
    
    const discordOAuthUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&state=${state}`;
    
    window.location.href = discordOAuthUrl;
  }, []);

  const handleCallback = useCallback(async (code: string, state: string) => {
    setLoading(true);
    try {
      // Validate state
      const storedState = localStorage.getItem('discord_oauth_state');
      if (!storedState || storedState !== state) {
        throw new Error('Invalid OAuth state');
      }
      
      // Clear stored state
      localStorage.removeItem('discord_oauth_state');

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Use the hardcoded Supabase URL instead of accessing protected property
      const supabaseUrl = 'https://dzcezcoivezflchsewhq.supabase.co';
      
      const response = await fetch(`${supabaseUrl}/functions/v1/discord-oauth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          code,
          redirect_uri: `${window.location.origin}/discord-callback`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to connect Discord account');
      }

      const data = await response.json();
      
      toast({
        title: "Success",
        description: "Discord account connected successfully!"
      });

      return data.discord_user as DiscordUser;
    } catch (error) {
      console.error('Discord OAuth error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to connect Discord account",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  const disconnect = useCallback(async () => {
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('Not authenticated');
      }

      // Use the hardcoded Supabase URL instead of accessing protected property
      const supabaseUrl = 'https://dzcezcoivezflchsewhq.supabase.co';

      const response = await fetch(`${supabaseUrl}/functions/v1/discord-oauth`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to disconnect Discord account');
      }

      toast({
        title: "Success",
        description: "Discord account disconnected"
      });
    } catch (error) {
      console.error('Discord disconnect error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to disconnect Discord account",
        variant: "destructive"
      });
      throw error;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  return {
    loading,
    initiateOAuth,
    handleCallback,
    disconnect,
  };
};
