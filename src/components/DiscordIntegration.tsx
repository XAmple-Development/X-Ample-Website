
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDiscordAPI } from '@/hooks/useDiscordAPI';
import { useDiscordOAuth } from '@/hooks/useDiscordOAuth';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Link, Unlink } from 'lucide-react';

interface DiscordIntegration {
  id: string;
  discord_user_id: string;
  discord_username: string;
  created_at: string;
}

const DiscordIntegration = () => {
  const [integration, setIntegration] = useState<DiscordIntegration | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { sendWebhook, loading: apiLoading } = useDiscordAPI();
  const { initiateOAuth, disconnect, loading: oauthLoading } = useDiscordOAuth();
  const { toast } = useToast();

  useEffect(() => {
    fetchIntegration();
  }, [user]);

  const fetchIntegration = async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('discord_integrations')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      setIntegration(data);
    } catch (error) {
      console.error('Error fetching Discord integration:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = () => {
    initiateOAuth();
  };

  const handleDisconnect = async () => {
    try {
      await disconnect();
      setIntegration(null);
    } catch (error) {
      // Error is already handled in the hook
    }
  };

  const testWebhook = async () => {
    const webhookUrl = prompt('Enter Discord webhook URL:');
    if (!webhookUrl) return;
    
    await sendWebhook(webhookUrl, 'Test message from X-Ample Development!');
  };

  if (loading) {
    return (
      <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white shadow-lg rounded-2xl">
        <CardContent className="p-6">
          <div className="text-center">Loading Discord integration...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Discord Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!integration ? (
          <div className="text-center">
            <p className="text-gray-300 mb-4">Connect your Discord account to access additional features</p>
            <Button
              onClick={handleConnect}
              disabled={oauthLoading}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
            >
              <Link className="w-4 h-4 mr-2" />
              {oauthLoading ? 'Connecting...' : 'Connect Discord'}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <div>
                <p className="text-white font-medium">{integration.discord_username}</p>
                <p className="text-gray-300 text-sm">Connected on {new Date(integration.created_at).toLocaleDateString()}</p>
              </div>
              <Button
                onClick={handleDisconnect}
                variant="outline"
                size="sm"
                disabled={oauthLoading}
                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                <Unlink className="w-4 h-4 mr-2" />
                {oauthLoading ? 'Disconnecting...' : 'Disconnect'}
              </Button>
            </div>
            
            <Button
              onClick={testWebhook}
              variant="outline"
              disabled={apiLoading}
              className="w-full border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
            >
              Test Webhook
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DiscordIntegration;
