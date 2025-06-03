
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  role: 'client' | 'admin';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

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

  useEffect(() => {
    console.log('Setting up auth state listener');
    
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Initial session:', session?.user?.email || 'none');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchOrCreateUserProfile(session.user);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        // Always set loading to false, regardless of success or error
        setLoading(false);
      }
    };

    getInitialSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.email || 'none');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && event === 'SIGNED_IN') {
          await fetchOrCreateUserProfile(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('User signed out, clearing profile');
          setProfile(null);
        }
        
        // Ensure loading is set to false after auth state changes
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const fetchOrCreateUserProfile = async (user: User) => {
    try {
      console.log('Fetching user profile for:', user.id);
      
      // First try to fetch existing profile
      const { data: profileData, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (fetchError && fetchError.code !== 'PGRST116') {
        // PGRST116 means no rows returned, which is fine for new users
        console.error('Error fetching profile:', fetchError);
        return;
      }
      
      if (profileData) {
        console.log('Profile loaded:', profileData);
        const typedProfile: Profile = {
          ...profileData,
          role: profileData.role as 'client' | 'admin'
        };
        setProfile(typedProfile);
      } else {
        // Profile doesn't exist, create it
        console.log('Creating new profile for user:', user.id);
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email || '',
              full_name: user.user_metadata?.full_name || null,
              role: 'client'
            }
          ])
          .select()
          .single();
        
        if (createError) {
          console.error('Error creating profile:', createError);
          return;
        }
        
        if (newProfile) {
          console.log('Profile created:', newProfile);
          const typedProfile: Profile = {
            ...newProfile,
            role: newProfile.role as 'client' | 'admin'
          };
          setProfile(typedProfile);
        }
      }
    } catch (error) {
      console.error('Error in fetchOrCreateUserProfile:', error);
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName
        }
      }
    });
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext signIn called');
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    console.log('SignIn result:', error ? 'Error' : 'Success');
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setProfile(null);
    setSession(null);
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
