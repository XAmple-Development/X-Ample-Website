
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
  const [profileLoading, setProfileLoading] = useState(false);

  useEffect(() => {
    console.log('AuthContext: Initializing auth state');
    
    // Get initial session
    const getInitialSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('AuthContext: Error getting initial session:', error);
          setLoading(false);
          return;
        }

        console.log('AuthContext: Initial session:', session?.user?.email || 'no session');
        
        if (session?.user) {
          setSession(session);
          setUser(session.user);
          // Fetch profile with error handling
          fetchUserProfileSafely(session.user);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('AuthContext: Error in getInitialSession:', error);
        setLoading(false);
      }
    };

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed:', event, session?.user?.email || 'no user');
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          console.log('AuthContext: User signed in, fetching profile');
          fetchUserProfileSafely(session.user);
        } else if (event === 'SIGNED_OUT') {
          console.log('AuthContext: User signed out, clearing profile');
          setProfile(null);
        }
        
        setLoading(false);
      }
    );

    getInitialSession();
    
    return () => {
      console.log('AuthContext: Cleaning up auth listener');
      subscription.unsubscribe();
    };
  }, []);

  const fetchUserProfileSafely = async (user: User) => {
    // Prevent multiple concurrent profile fetches
    if (profileLoading) {
      console.log('AuthContext: Profile fetch already in progress, skipping');
      return;
    }

    setProfileLoading(true);
    
    try {
      console.log('AuthContext: Fetching profile for user:', user.id);
      
      // Try to fetch profile with timeout
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );
      
      const fetchPromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
      
      const { data: profileData, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;
      
      if (error) {
        console.error('AuthContext: Error fetching profile:', error);
        // If profile doesn't exist, create it
        if (error.code === 'PGRST116' || error.message?.includes('No rows found')) {
          console.log('AuthContext: No profile found, creating new one');
          await createUserProfileSafely(user);
        }
        return;
      }
      
      if (profileData) {
        console.log('AuthContext: Profile found:', profileData);
        const typedProfile: Profile = {
          ...profileData,
          role: profileData.role as 'client' | 'admin'
        };
        setProfile(typedProfile);
      } else {
        console.log('AuthContext: No profile found, creating new one');
        await createUserProfileSafely(user);
      }
    } catch (error) {
      console.error('AuthContext: Error in fetchUserProfile:', error);
      // As a fallback, create a basic profile without database call
      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null,
        role: 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const createUserProfileSafely = async (user: User) => {
    try {
      console.log('AuthContext: Creating profile for user:', user.id);
      
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile creation timeout')), 5000)
      );
      
      const createPromise = supabase
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
        .maybeSingle();
      
      const { data: newProfile, error: createError } = await Promise.race([createPromise, timeoutPromise]) as any;
      
      if (createError) {
        console.error('AuthContext: Error creating profile:', createError);
        // Set a basic profile as fallback
        setProfile({
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          role: 'client',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });
        return;
      }
      
      if (newProfile) {
        console.log('AuthContext: Profile created:', newProfile);
        const typedProfile: Profile = {
          ...newProfile,
          role: newProfile.role as 'client' | 'admin'
        };
        setProfile(typedProfile);
      }
    } catch (error) {
      console.error('AuthContext: Error in createUserProfile:', error);
      // Set a basic profile as final fallback
      setProfile({
        id: user.id,
        email: user.email || '',
        full_name: user.user_metadata?.full_name || null,
        role: 'client',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      });
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('AuthContext: Sign up attempt for:', email);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    console.log('AuthContext: Sign up result:', error ? 'Error' : 'Success');
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('AuthContext: Sign in attempt for:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    console.log('AuthContext: Sign in result:', error ? 'Error' : 'Success');
    return { error };
  };

  const signOut = async () => {
    console.log('AuthContext: Sign out');
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
