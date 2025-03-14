
import { toast } from 'sonner';
import { NavigateFunction } from 'react-router-dom';

interface UseAuthMethodsProps {
  navigate: NavigateFunction;
}

export function useAuthMethods({ navigate }: UseAuthMethodsProps) {
  // Mock authentication methods
  const signUp = async (email: string, password: string) => {
    console.log('Mock sign up with:', email, password);
    toast.success('Sign up successful (mock)');
    return Promise.resolve();
  };

  const signIn = async (email: string, password: string) => {
    console.log('Mock sign in with:', email, password);
    toast.success('Sign in successful (mock)');
    navigate('/jobs');
    return Promise.resolve();
  };

  const signInWithGoogle = async () => {
    console.log('Mock Google sign in');
    toast.success('Google sign in successful (mock)');
    navigate('/jobs');
    return Promise.resolve();
  };

  const signOut = async () => {
    console.log('Mock sign out');
    toast.success('Sign out successful (mock)');
    return Promise.resolve();
  };

  return { signUp, signIn, signInWithGoogle, signOut };
}
