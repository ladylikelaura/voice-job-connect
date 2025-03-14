
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
  // No-op implementation - authentication is disabled
  // This ensures the app doesn't try to actually authenticate
  return;
}
