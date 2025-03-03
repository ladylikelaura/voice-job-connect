
import { createContext, useContext, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthListeners } from './useAuthListeners';
import { useAuthMethods } from './useAuthMethods';
import { LoadingSpinner } from '@/components/LoadingSpinner';

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

  // Hook with auth listeners
  useAuthListeners({
    setUser,
    setLoading,
    navigate,
    location
  });

  // Hook with auth methods
  const { signUp, signIn, signInWithGoogle, signOut } = useAuthMethods({ navigate });

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}>
      {loading ? (
        <div 
          className="min-h-screen flex items-center justify-center bg-background" 
          role="status" 
          aria-live="polite"
          aria-busy="true"
        >
          <LoadingSpinner />
          <div className="sr-only">Loading authentication. Please wait.</div>
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
