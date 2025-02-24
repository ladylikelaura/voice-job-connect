
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuth } from '@/contexts/AuthContext';
import { Card } from '@/components/ui/card';

const Auth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isSignUp) {
        await signUp(email, password);
      } else {
        await signIn(email, password);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      role="main"
      aria-label={isSignUp ? "Sign up page" : "Sign in page"}
    >
      <Card className="w-full max-w-md p-6 space-y-6">
        <h1 
          className="text-2xl font-semibold text-center"
          tabIndex={0}
          aria-level={1}
        >
          {isSignUp ? 'Create an Account' : 'Welcome Back'}
        </h1>
        
        <form 
          onSubmit={handleSubmit} 
          className="space-y-4"
          aria-label={isSignUp ? "Sign up form" : "Sign in form"}
        >
          <div className="space-y-2">
            <label 
              htmlFor="email" 
              className="text-sm font-medium"
              id="email-label"
            >
              Email
            </label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-labelledby="email-label"
              aria-required="true"
              autoComplete="email"
            />
          </div>
          
          <div className="space-y-2">
            <label 
              htmlFor="password" 
              className="text-sm font-medium"
              id="password-label"
            >
              Password
            </label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              aria-labelledby="password-label"
              aria-required="true"
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full"
            aria-label={isSignUp ? "Create account" : "Sign in"}
          >
            {isSignUp ? 'Sign Up' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center">
          <Button
            variant="link"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm"
            aria-label={isSignUp ? "Switch to sign in" : "Switch to sign up"}
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
