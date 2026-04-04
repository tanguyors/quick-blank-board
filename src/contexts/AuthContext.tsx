import { createContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import type { Tables } from '@/integrations/supabase/types';

type Profile = Tables<'profiles'>;

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  roles: string[];
  activeRole: string;
  setActiveRole: (role: string) => void;
  loading: boolean;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  addRole: (role: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ACTIVE_ROLE_KEY = 'somagate_active_role';

function resolveActiveRole(roles: string[], stored: string | null): string {
  if (stored && roles.includes(stored)) return stored;
  if (roles.includes('admin')) return 'admin';
  if (roles.includes('notaire')) return 'notaire';
  if (roles.includes('owner')) return 'owner';
  return 'user';
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [roles, setRoles] = useState<string[]>([]);
  const [activeRole, setActiveRoleState] = useState<string>('user');
  const [loading, setLoading] = useState(true);

  const setActiveRole = (role: string) => {
    setActiveRoleState(role);
    localStorage.setItem(ACTIVE_ROLE_KEY, role);
  };

  const fetchProfile = async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    setProfile(data);
  };

  const fetchRoles = async (userId: string) => {
    const { data } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);
    const fetched = data?.map(r => r.role) || [];
    setRoles(fetched);
    const stored = localStorage.getItem(ACTIVE_ROLE_KEY);
    setActiveRoleState(resolveActiveRole(fetched, stored));
  };

  const addRole = async (role: string) => {
    if (!user || roles.includes(role)) return;
    await supabase.from('user_roles').insert({ user_id: user.id, role });
    await fetchRoles(user.id);
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.id);
  };

  useEffect(() => {
    let isMounted = true;

    // Listener for ONGOING auth changes (does NOT control loading)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (!isMounted) return;
        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Fire and forget — don't await, don't set loading
          fetchProfile(session.user.id);
          fetchRoles(session.user.id);
        } else {
          setProfile(null);
          setRoles([]);
        }
      }
    );

    // INITIAL load — await roles before setting loading to false
    const initializeAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!isMounted) return;

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Await both before setting loading false
          await Promise.all([
            fetchProfile(session.user.id),
            fetchRoles(session.user.id),
          ]);
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initializeAuth();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRoles([]);
    setActiveRoleState('user');
    localStorage.removeItem(ACTIVE_ROLE_KEY);
  };

  return (
    <AuthContext.Provider value={{ user, session, profile, roles, activeRole, setActiveRole, loading, signOut, refreshProfile, addRole }}>
      {children}
    </AuthContext.Provider>
  );
}