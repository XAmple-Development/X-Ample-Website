
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDiscordAPI } from '@/hooks/useDiscordAPI';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { MessageSquare, Link, Unlink } from 'lucide-react';

const DiscordIntegration = () => {
  const [isConnected, setIsConnected] = useState(false);
  const [discordData, setDiscordData] = useState(null);
  const { user } = useAuth();
  const { fetchUserInfo, sendWebhook, loading } = useDiscordAPI();
  const { toast } = useToast();

  const handleDiscordConnect = async () => {
    if (!user) return;
    
    try {
      // Simulate Discord OAuth flow
      const mockDiscordUser = {
        id: '123456789',
        username: 'ExampleUser',
        discriminator: '1234',
        avatar: 'avatar_hash'
      };
      
      // Store Discord integration in database
      const { error } = await supabase
        .from('discord_integrations')
        .upsert({
          user_id: user.id,
          discord_user_id: mockDiscordUser.id,
          discord_username: `${mockDiscordUser.username}#${mockDiscordUser.discriminator}`,
          access_token: 'mock_access_token',
          refresh_token: 'mock_refresh_token',
          expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        });

      if (error) throw error;

      setDiscordData(mockDiscordUser);
      setIsConnected(true);
      
      toast({
        title: "Success",
        description: "Discord account connected successfully!"
      });
    } catch (error) {
      console.error('Discord connection error:', error);
      toast({
        title: "Error",
        description: "Failed to connect Discord account",
        variant: "destructive"
      });
    }
  };

  const handleDiscordDisconnect = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('discord_integrations')
        .delete()
        .eq('user_id', user.id);

      if (error) throw error;

      setDiscordData(null);
      setIsConnected(false);
      
      toast({
        title: "Success",
        description: "Discord account disconnected"
      });
    } catch (error) {
      console.error('Discord disconnect error:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect Discord account",
        variant: "destructive"
      });
    }
  };

  const testWebhook = async () => {
    const webhookUrl = prompt('Enter Discord webhook URL:');
    if (!webhookUrl) return;
    
    await sendWebhook(webhookUrl, 'Test message from X-Ample Development!');
  };

  return (
    <Card className="bg-white/5 border border-white/10 backdrop-blur-md text-white shadow-lg rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center">
          <MessageSquare className="w-5 h-5 mr-2" />
          Discord Integration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isConnected ? (
          <div className="text-center">
            <p className="text-gray-300 mb-4">Connect your Discord account to access additional features</p>
            <Button
              onClick={handleDiscordConnect}
              disabled={loading}
              className="bg-[#5865F2] hover:bg-[#4752C4] text-white"
            >
              <Link className="w-4 h-4 mr-2" />
              Connect Discord
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-white/10 rounded-lg">
              <div>
                <p className="text-white font-medium">{discordData?.username}#{discordData?.discriminator}</p>
                <p className="text-gray-300 text-sm">Connected</p>
              </div>
              <Button
                onClick={handleDiscordDisconnect}
                variant="outline"
                size="sm"
                className="border-red-500/20 text-red-400 hover:bg-red-500/10"
              >
                <Unlink className="w-4 h-4 mr-2" />
                Disconnect
              </Button>
            </div>
            
            <Button
              onClick={testWebhook}
              variant="outline"
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
