
import { supabase } from '@/integrations/supabase/client';

export const useAuthOperations = () => {
  const signUp = async (email: string, password: string, fullName: string) => {
    console.log('AuthOperations: Sign up attempt for:', email);
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName
        }
      }
    });
    
    console.log('AuthOperations: Sign up result:', error ? 'Error' : 'Success');
    return { error };
  };

  const signIn = async (email: string, password: string) => {
    console.log('AuthOperations: Sign in attempt for:', email);
    
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    console.log('AuthOperations: Sign in result:', error ? 'Error' : 'Success');
    return { error };
  };

  const signOut = async () => {
    console.log('AuthOperations: Sign out');
    await supabase.auth.signOut();
  };

  return { signUp, signIn, signOut };
};
