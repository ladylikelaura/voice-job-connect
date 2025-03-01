
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { ArrowRight, Mail } from "lucide-react";
import { toast } from "sonner";

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { signInWithGoogle, signIn, signUp } = useAuth();

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }
    
    setLoading(true);
    
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      console.error(error);
      // Error is already displayed via toast in the AuthContext
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-[#1A1F2C] to-[#2D3748]"
      role="main"
      aria-label={isSignUp ? "Sign up page" : "Sign in page"}
    >
      <Card className="w-full max-w-md p-6 space-y-8 border-none bg-white/95 backdrop-blur-sm shadow-xl">
        <CardHeader className="p-0 space-y-2">
          <h1 
            className="text-3xl font-bold text-center text-[#6E59A5]"
            tabIndex={0}
            aria-level={1}
          >
            {isSignUp ? 'Create Account' : 'Welcome Back'}
          </h1>
          <p className="text-center text-gray-600">
            {isSignUp 
              ? 'Sign up to start your job search journey' 
              : 'Sign in to continue your job search'}
          </p>
        </CardHeader>
        
        <CardContent className="p-0 space-y-6">
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <Input
                type="email" 
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full py-6"
                required
                aria-label="Email"
              />
            </div>
            <div>
              <Input
                type="password" 
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-6"
                required
                aria-label="Password"
              />
            </div>
            <Button 
              type="submit"
              variant="default" 
              className="w-full flex items-center justify-center gap-3 py-6 text-base font-medium bg-[#9b87f5] hover:bg-[#7E69AB] transition-all"
              disabled={loading}
              aria-label={isSignUp ? "Sign up with email" : "Sign in with email"}
            >
              {loading ? 'Processing...' : 'Continue'} 
              <ArrowRight className="w-5 h-5" />
            </Button>
          </form>
          
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative bg-white px-4 text-sm text-gray-500">
              or continue with
            </div>
          </div>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center gap-3 py-6 text-base font-medium border-[#D6BCFA] text-gray-700 hover:bg-[#D6BCFA]/10"
            onClick={signInWithGoogle}
            type="button"
            aria-label="Sign in with Google"
          >
            <svg role="img" aria-hidden="true" viewBox="0 0 24 24" width="24" height="24">
              <path
                fill="#4285F4"
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
            Google
          </Button>
        </CardContent>
        
        <CardFooter className="p-0 flex justify-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm font-medium text-[#6E59A5]"
            type="button"
            aria-label={isSignUp ? "Switch to sign in" : "Switch to sign up"}
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
