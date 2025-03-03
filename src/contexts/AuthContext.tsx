import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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
              
              // Clean up the URL without triggering navigation
              window.history.replaceState(null, document.title, '/auth');
              
              // Then navigate to jobs page
              setTimeout(() => navigate('/jobs', { replace: true }), 500);
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
        navigate('/jobs', { replace: true });
        toast.success('Successfully signed in!');
      } else if (event === 'SIGNED_OUT') {
        console.log('SIGNED_OUT event received, navigating to /auth');
        navigate('/auth', { replace: true });
        toast.success('Successfully signed out!');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate, location]);

  const signUp = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) throw error;
      toast.success('Check your email for the confirmation link!');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
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
      
      // Set the redirect URL to the auth page
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
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {loading ? (
        <div className="min-h-screen flex items-center justify-center bg-background" role="status" aria-live="polite">
          <div className="animate-pulse text-lg font-medium text-primary">Loading authentication...</div>
        </div>
      ) : (
        children
      )}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
