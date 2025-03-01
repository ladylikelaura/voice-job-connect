
import { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
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

  useEffect(() => {
    // Handle hash fragments from OAuth redirects
    const handleHashFragment = async () => {
      try {
        // Check if URL contains access_token
        if (window.location.hash && window.location.hash.includes('access_token')) {
          console.log('Found access token in URL fragment, processing OAuth response');
          
          // Let Supabase handle the hash fragment to complete auth
          const { data, error } = await supabase.auth.getSession();
          
          if (error) {
            console.error('Error processing OAuth response:', error);
            toast.error('Authentication failed. Please try again.');
          } else if (data.session) {
            console.log('Successfully processed OAuth response');
            toast.success('Successfully signed in!');
            
            // Clear the hash fragment without triggering a reload
            window.history.replaceState(null, document.title, window.location.pathname);
            
            // Use timeout to ensure state is updated before navigation
            setTimeout(() => {
              navigate('/jobs');
            }, 100);
          }
        }
      } catch (err) {
        console.error('Error handling hash fragment:', err);
        toast.error('Authentication failed. Please try again.');
      }
    };

    // Call the handler when component mounts
    handleHashFragment();

    // Check active sessions and subscribe to auth changes
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUser(session?.user ?? null);
        setLoading(false);
        
        if (session?.user) {
          // Don't use window.location for page navigation, use React Router instead
          if (window.location.pathname === '/auth') {
            navigate('/jobs');
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
        setLoading(false);
      }
    };
    
    checkSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('Auth state changed:', _event, session); // Debug log
      setUser(session?.user ?? null);
      
      if (_event === 'SIGNED_IN' && session) {
        // Ensure we navigate to the jobs page on sign in
        navigate('/jobs');
        toast.success('Successfully signed in!');
      } else if (_event === 'SIGNED_OUT') {
        // Ensure we navigate to the auth page on sign out
        navigate('/auth');
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

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
      console.log('Starting Google sign in...'); // Debug log
      
      // Get the current URL origin
      const currentOrigin = window.location.origin;
      
      // Use the current origin as the redirect URL
      const redirectUrl = `${currentOrigin}`;
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
      
      // Standard redirect
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
      navigate('/auth');
      toast.success('Successfully signed out');
    } catch (error: any) {
      toast.error(error.message);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {!loading && children}
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
