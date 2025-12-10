import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { mockData } from '../lib/config';
import type { User } from '../types/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  demoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'legalai_demo_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const demoUser = localStorage.getItem(DEMO_USER_KEY);
    if (demoUser) {
      try {
        const parsedUser = JSON.parse(demoUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse demo user', e);
        localStorage.removeItem(DEMO_USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const signIn = async (email: string, password: string) => {
    throw new Error('Backend authentication not yet implemented');
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    throw new Error('Backend authentication not yet implemented');
  };

  const signOut = async () => {
    localStorage.removeItem(DEMO_USER_KEY);
    setUser(null);
  };

  const demoLogin = () => {
    const mockUser: User = {
      id: '00000000-0000-0000-0000-000000000001',
      email: mockData.demoUser.email,
      first_name: mockData.demoUser.name.split(' ')[0],
      last_name: mockData.demoUser.name.split(' ')[1] || '',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    localStorage.setItem(DEMO_USER_KEY, JSON.stringify(mockUser));
    setUser(mockUser);
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, demoLogin }}>
      {children}
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
