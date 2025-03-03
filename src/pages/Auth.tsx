
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';
import { Mail } from "lucide-react";
import { Navigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [isProcessingOAuth, setIsProcessingOAuth] = useState(false);
  const { signInWithGoogle, user } = useAuth();
  const location = useLocation();

  // Check if redirected from OAuth
  useEffect(() => {
    const checkOAuthRedirect = async () => {
      // If there's a hash in the URL, we're likely being redirected back from OAuth
      if (location.hash && location.hash.includes('access_token')) {
        console.log('Detected OAuth redirect with access token');
        setIsProcessingOAuth(true);
        toast.loading('Completing authentication...');
      } else if (location.hash && location.hash.includes('error=')) {
        console.error('OAuth error detected in URL hash:', location.hash);
        const errorMessage = decodeURIComponent(location.hash.split('error_description=')[1]?.split('&')[0] || 'Authentication failed');
        toast.error(`Authentication error: ${errorMessage}`);
        
        // Clean up the URL hash on error
        window.history.replaceState(null, document.title, window.location.pathname);
      }
    };

    checkOAuthRedirect();
  }, [location.hash]);

  // If user is already authenticated, redirect to jobs
  if (user) {
    console.log('User authenticated in Auth component, redirecting to /jobs');
    return <Navigate to="/jobs" replace />;
  }

  const handleEmailAuth = async () => {
    // This will redirect to the Supabase email auth page
    window.location.href = `${window.location.origin}/auth/email`;
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      role="main"
      aria-label={isSignUp ? "Sign up page" : "Sign in page"}
    >
      <Card className="w-full max-w-md p-6 space-y-8">
        <h1 
          className="text-2xl font-semibold text-center"
          tabIndex={0}
          aria-level={1}
          aria-live="polite"
        >
          {isProcessingOAuth 
            ? 'Completing Authentication...' 
            : isSignUp 
              ? 'Create an Account' 
              : 'Welcome Back'}
        </h1>
        
        {!isProcessingOAuth && (
          <div className="space-y-5">
            <Button 
              variant="default" 
              className="w-full flex items-center justify-center gap-3 py-6 text-base font-medium bg-primary hover:bg-primary/90"
              onClick={signInWithGoogle}
              aria-label="Sign in with Google"
            >
              <svg role="img" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>

            <Button 
              variant="secondary" 
              className="w-full flex items-center justify-center gap-3 py-6 text-base font-medium bg-secondary hover:bg-secondary/80 text-secondary-foreground"
              onClick={handleEmailAuth}
              aria-label="Sign in with Email"
            >
              <Mail className="w-6 h-6" />
              Continue with Email
            </Button>
          </div>
        )}

        {!isProcessingOAuth && (
          <div className="text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm font-medium"
              aria-label={isSignUp ? "Switch to sign in" : "Switch to sign up"}
            >
              {isSignUp
                ? 'Already have an account? Sign in'
                : "Don't have an account? Sign up"}
            </Button>
          </div>
        )}
        
        {/* Screen reader announcement for authentication status */}
        <div 
          className="sr-only" 
          role="status" 
          aria-live="polite"
          aria-atomic="true"
        >
          {isProcessingOAuth 
            ? "Authentication is in progress, please wait." 
            : isSignUp 
              ? "Sign up page. Use the form to create a new account." 
              : "Sign in page. Use the form to access your account."
          }
        </div>
      </Card>
    </div>
  );
};

export default Auth;
