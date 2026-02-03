import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/supabase';
import { useToast } from './use-toast';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  signUp: (email: string, password: string) => Promise<Session | null>;
  signIn: (email: string, password: string) => Promise<Session | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        console.debug('[useAuth] initial session', session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Error getting session:', error);
      } finally {
        setIsLoading(false);
      }
    };

    getSession();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.debug('[useAuth] auth event', event, session);
        // show toast for major auth events to help debugging multi-device issues
        if (event === 'SIGNED_IN') {
          toast({ title: 'Signed in', description: 'Signed in on this device' });
        } else if (event === 'SIGNED_OUT') {
          toast({ title: 'Signed out', description: 'Signed out on this device', variant: 'destructive' });
        } else if (event === 'TOKEN_REFRESHED') {
          toast({ title: 'Session refreshed' });
        }
        setUser(session?.user ?? null);
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    // Try signup
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined },
    });

    // Allow user_already_exists (retry case)
    if (signUpError && signUpError.code !== 'user_already_exists') {
      toast({ title: 'Sign up failed', description: signUpError.message, variant: 'destructive' });
      throw signUpError;
    }

    // Wait for email auto-confirmation (if enabled in Supabase)
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Attempt sign in
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      if (signInError.code === 'email_not_confirmed') {
        toast({
          title: 'Email confirmation required',
          description: 'Check Supabase Dashboard → Authentication → Settings and toggle OFF "Require email confirmation"',
          variant: 'destructive',
        });
      } else {
        toast({ title: 'Sign in failed', description: signInError.message, variant: 'destructive' });
      }
      throw signInError;
    }

    const session = signInData?.session ?? signUpData?.session;
    console.debug('[useAuth] signUp session', session);
    toast({ title: 'Signed up', description: 'Account created and signed in' });
    setUser(session?.user ?? null);
    return session ?? null;
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({ title: 'Sign in failed', description: error.message, variant: 'destructive' });
      throw error;
    }

    console.debug('[useAuth] signIn data', data);
    toast({ title: 'Signed in', description: 'Welcome back' });
    setUser(data?.session?.user ?? null);
    return data?.session ?? null;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast({ title: 'Signed out', description: 'You have been signed out', variant: 'destructive' });
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, signUp, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
