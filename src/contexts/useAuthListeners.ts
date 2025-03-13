
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';
import { NavigateFunction, Location } from 'react-router-dom';

interface UseAuthListenersProps {
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  navigate: NavigateFunction;
  location: Location;
}

export function useAuthListeners({
  setUser,
  setLoading,
  navigate,
  location
}: UseAuthListenersProps) {
  
  useEffect(() => {
    // Initialize auth state first before any navigation
    const initializeAuth = async () => {
      setLoading(true);
      try {
        console.log('Initializing auth state...');
        
        // Get current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Error getting session:', error);
          setLoading(false);
          return;
        }
        
        // Set initial user state
        setUser(session?.user ?? null);
        
        // Handle initial navigation based on auth state
        if (session?.user) {
          console.log('User is authenticated, current path:', location.pathname);
          
          if (location.pathname === '/auth' || location.pathname === '/') {
            console.log('Redirecting authenticated user to /jobs');
            // Use replace: true to prevent back navigation to login page
            navigate('/jobs', { replace: true });
          }
        } 
      } catch (err) {
        console.error('Error initializing auth:', err);
      } finally {
        setLoading(false);
      }
    };
    
    // Handle OAuth redirect completions
    const handleOAuthResponse = async () => {
      // Check URL hash parameters for OAuth redirect
      const hasAccessToken = location.hash && location.hash.includes('access_token');
      const hasError = location.hash && location.hash.includes('error=');
      
      if (hasAccessToken || hasError) {
        try {
          console.log('Processing OAuth response on path:', location.pathname);
          
          if (hasError) {
            // Extract error message from hash
            const errorMatch = location.hash.match(/error=([^&]*)/);
            const errorDescription = location.hash.match(/error_description=([^&]*)/);
            const errorMsg = errorDescription ? decodeURIComponent(errorDescription[1]) : 'Authentication failed';
            console.error('OAuth error:', errorMsg);
            toast.error(errorMsg);
            
            // Clean up URL without navigation
            window.history.replaceState(null, document.title, location.pathname);
            return;
          }
          
          if (location.pathname === '/auth') {
            // Process successful OAuth login
            const { data, error } = await supabase.auth.getSession();
            
            if (error) {
              console.error('Error processing OAuth response:', error);
              toast.error('Authentication failed. Please try again.');
            } else if (data.session) {
              console.log('Successfully processed OAuth response');
              setUser(data.session.user);
              toast.success('Successfully signed in!');
              
              // First clean up the URL without triggering navigation
              window.history.replaceState(null, document.title, '/auth');
              
              // Then navigate to jobs page with replace to prevent back navigation to login
              navigate('/jobs', { replace: true });
            }
          }
        } catch (err) {
          console.error('Error handling OAuth response:', err);
          toast.error('Authentication failed. Please try again.');
        }
      }
    };

    // Run auth initialization and OAuth response handling
    handleOAuthResponse();
    initializeAuth();

    // Set up auth state change subscription
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state changed:', event, 'Session:', session ? 'exists' : 'null');
      
      setUser(session?.user ?? null);
      
      if (event === 'SIGNED_IN' && session) {
        console.log('SIGNED_IN event received, navigating to /jobs');
        // Use replace: true to prevent back navigation to login page
        navigate('/jobs', { replace: true });
        toast.success('Successfully signed in!');
      } else if (event === 'SIGNED_OUT') {
        console.log('SIGNED_OUT event received, navigating to /auth');
        navigate('/auth', { replace: true });
        toast.success('Successfully signed out!');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location, setUser, setLoading]);
}
