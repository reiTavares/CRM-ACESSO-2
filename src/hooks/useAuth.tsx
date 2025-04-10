import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Corrected import
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';

interface UseAuthReturn {
  user: User | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  refreshSession: () => Promise<void>;
}

// Helper function to manage session state (optional, but good practice)
const setSession = (session: Session | null) => {
  if (session) {
    // You might store the session in localStorage or context if needed elsewhere
    // localStorage.setItem('supabase.auth.token', JSON.stringify(session));
  } else {
    // localStorage.removeItem('supabase.auth.token');
  }
};


export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate(); // Now correctly imported

  // Function to refresh the session
  const refreshSession = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      }
    } catch (error) {
      console.error('Error refreshing session:', error);
    }
  };

  useEffect(() => {
    // First set up the auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // Then check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      navigate('/dashboard');
    } catch (error: any) {
      console.error('Error logging in:', error.message);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      setUser(null);
      navigate('/login'); // Use navigate after successful sign out
    } catch (error: any) {
      console.error('Error signing out:', error.message);
    }
  };

  return {
    user,
    signIn,
    signOut,
    loading,
    refreshSession
  };
};
