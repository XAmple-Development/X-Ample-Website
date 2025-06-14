
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile, AuthContextType } from '@/types/auth';
import { fetchUserProfile } from '@/utils/authUtils';
import { useAuthOperations } from '@/hooks/useAuthOperations';

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  session: null,
  loading: true,
  signUp: async () => ({ error: null }),
  signIn: async () => ({ error: null }),
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const { signUp, signIn, signOut: authSignOut } = useAuthOperations();

  useEffect(() => {
    console.log('AuthContext: Initializing auth state');
    
    let mounted = true;
    
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting initial session:', error);
          if (mounted) setLoading(false);
          return;
        }

        console.log('AuthContext: Initial session:', session?.user?.email || 'no session');
        
        if (session?.user && mounted) {
          setSession(session);
          setUser(session.user);
          
          // Fetch profile with a small delay to ensure database is ready
          setTimeout(async () => {
            if (mounted) {
              const userProfile = await fetchUserProfile(session.user);
              console.log('AuthContext: Setting profile:', userProfile);
              setProfile(userProfile);
            }
          }, 100);
        }
        
        if (mounted) setLoading(false);
      } catch (error) {
        console.error('AuthContext: Error in getInitialSession:', error);
        if (mounted) setLoading(false);
      }
    };

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, session?.user?.email || 'no user');
        
        if (!mounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          console.log('AuthContext: User signed in, fetching profile');
          // Clear any existing profile first
          setProfile(null);
          
          setTimeout(async () => {
            if (mounted) {
              const userProfile = await fetchUserProfile(session.user);
              console.log('AuthContext: Setting profile after auth change:', userProfile);
              setProfile(userProfile);
            }
          }, 100);
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthContext: User signed out, clearing profile');
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    getInitialSession();
    
    return () => {
      mounted = false;
      console.log('AuthContext: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    console.log('AuthContext: Signing out and clearing all auth state');
    
    // Clear all auth-related storage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
    
    await authSignOut();
    setUser(null);
    setProfile(null);
    setSession(null);
    
    // Force page reload to ensure clean state
    window.location.href = '/auth';
  };

  const value = {
    user,
    profile,
    session,
    loading,
    signUp,
    signIn,
    signOut
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  return context;
}
