
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDiscordOAuth } from '@/hooks/useDiscordOAuth';
import { Loader2 } from 'lucide-react';

const DiscordCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { handleCallback } = useDiscordOAuth();

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get('code');
      const state = searchParams.get('state');
      const error = searchParams.get('error');

      if (error) {
        console.error('Discord OAuth error:', error);
        navigate('/dashboard?discord_error=access_denied');
        return;
      }

      if (!code || !state) {
        console.error('Missing code or state parameters');
        navigate('/dashboard?discord_error=invalid_request');
        return;
      }

      if (!user) {
        console.error('User not authenticated');
        navigate('/auth');
        return;
      }

      try {
        await handleCallback(code, state);
        navigate('/dashboard?discord_success=true');
      } catch (error) {
        console.error('Callback error:', error);
        navigate('/dashboard?discord_error=callback_failed');
      }
    };

    processCallback();
  }, [searchParams, user, handleCallback, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-white mx-auto mb-4" />
        <p className="text-white text-lg">Connecting your Discord account...</p>
      </div>
    </div>
  );
};

export default DiscordCallback;
