
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { NavigateFunction } from 'react-router-dom';

interface UseAuthMethodsProps {
  navigate: NavigateFunction;
}

export function useAuthMethods({ navigate }: UseAuthMethodsProps) {
  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Check your email for the confirmation link!');
      // Do not navigate here - wait for auth state change
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      
      // Do not navigate here - wait for auth state change to handle it
      console.log('SignIn successful, auth state change will trigger navigation');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      console.log('Starting Google sign in...'); 
      
      // Get the current URL origin for redirect
      const currentOrigin = window.location.origin;
      
      // Set the redirect URL to the auth page explicitly
      const redirectUrl = `${currentOrigin}/auth`;
      console.log('Redirect URL:', redirectUrl);
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: redirectUrl,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });
      
      if (error) {
        console.error('Supabase OAuth error:', error);
        toast.error(`OAuth Error: ${error.message}`);
        throw error;
      }
      
      if (!data.url) {
        console.error('No OAuth URL returned');
        toast.error('Authentication failed: No URL returned from provider');
        throw new Error('No URL returned from OAuth provider');
      }
      
      console.log('Redirecting to OAuth URL:', data.url);
      
      // Redirect to Google auth page
      window.location.href = data.url;
      
    } catch (error: any) {
      console.error('Google Sign In Error:', error);
      toast.error(error.message || 'Failed to sign in with Google');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast.success('Successfully signed out');
      // Do not navigate here - wait for auth state change to handle it
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return { signUp, signIn, signInWithGoogle, signOut };
}
