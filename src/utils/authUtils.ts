
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/types/auth';

export const createBasicProfile = (user: User): Profile => ({
  id: user.id,
  email: user.email || '',
  full_name: user.user_metadata?.full_name || null,
  role: 'client',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});

export const fetchUserProfile = async (user: User): Promise<Profile> => {
  try {
    console.log('AuthUtils: Fetching profile for user:', user.id);
    
    // Try to get the profile with a simple query
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    console.log('AuthUtils: Profile query result:', { profileData, error });
    
    if (error) {
      console.error('AuthUtils: Error fetching profile:', error);
      // If profile doesn't exist, create one
      if (error.code === 'PGRST116') {
        console.log('AuthUtils: No profile found, creating one');
        const newProfile = {
          id: user.id,
          email: user.email || '',
          full_name: user.user_metadata?.full_name || null,
          role: 'client' as const
        };
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([newProfile]);
          
        if (insertError) {
          console.error('AuthUtils: Error creating profile:', insertError);
        }
        
        return createBasicProfile(user);
      }
      return createBasicProfile(user);
    }
    
    if (profileData) {
      console.log('AuthUtils: Profile found:', profileData);
      console.log('AuthUtils: Profile role:', profileData.role);
      return {
        ...profileData,
        role: profileData.role as 'client' | 'admin'
      };
    }
    
    return createBasicProfile(user);
  } catch (error) {
    console.error('AuthUtils: Error in fetchUserProfile:', error);
    return createBasicProfile(user);
  }
};
