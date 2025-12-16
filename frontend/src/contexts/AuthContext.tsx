import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { mockData } from '../lib/config';
import { apiClient } from '../lib/apiClient';
import { createPermissionChecker, PermissionChecker } from '../lib/permissions';
import type { User, UserRole } from '../types/api';

interface AuthContextType {
  user: User | null;
  userRoles: UserRole[];
  permissions: PermissionChecker | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signOut: () => Promise<void>;
  demoLogin: () => void;
  refreshRoles: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const DEMO_USER_KEY = 'legalai_demo_user';
const USER_ROLES_KEY = 'legalai_user_roles';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userRoles, setUserRoles] = useState<UserRole[]>([]);
  const [permissions, setPermissions] = useState<PermissionChecker | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserRoles = async (userId: string) => {
    try {
      const response = await apiClient.userRoles.getActiveByUserId(userId);
      if (response.success && response.data) {
        const roles = Array.isArray(response.data) ? response.data : [response.data];
        setUserRoles(roles);
        setPermissions(createPermissionChecker(roles));
        localStorage.setItem(USER_ROLES_KEY, JSON.stringify(roles));
        return roles;
      } else {
        console.error('Failed to fetch user roles:', response.error);
        setUserRoles([]);
        setPermissions(null);
        return [];
      }
    } catch (error) {
      console.error('Error fetching user roles:', error);
      setUserRoles([]);
      setPermissions(null);
      return [];
    }
  };

  const refreshRoles = async () => {
    if (user) {
      await fetchUserRoles(user.id);
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      const demoUser = localStorage.getItem(DEMO_USER_KEY);
      const storedRoles = localStorage.getItem(USER_ROLES_KEY);

      if (demoUser) {
        try {
          const parsedUser = JSON.parse(demoUser);
          setUser(parsedUser);

          if (storedRoles) {
            try {
              const roles = JSON.parse(storedRoles);
              setUserRoles(roles);
              setPermissions(createPermissionChecker(roles));
            } catch (e) {
              console.error('Failed to parse stored roles', e);
              await fetchUserRoles(parsedUser.id);
            }
          } else {
            await fetchUserRoles(parsedUser.id);
          }
        } catch (e) {
          console.error('Failed to parse demo user', e);
          localStorage.removeItem(DEMO_USER_KEY);
          localStorage.removeItem(USER_ROLES_KEY);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const signIn = async (email: string, password: string) => {
    throw new Error('Backend authentication not yet implemented');
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    throw new Error('Backend authentication not yet implemented');
  };

  const signOut = async () => {
    localStorage.removeItem(DEMO_USER_KEY);
    localStorage.removeItem(USER_ROLES_KEY);
    setUser(null);
    setUserRoles([]);
    setPermissions(null);
  };

  const demoLogin = async () => {
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
    await fetchUserRoles(mockUser.id);
  };

  return (
    <AuthContext.Provider value={{ user, userRoles, permissions, loading, signIn, signUp, signOut, demoLogin, refreshRoles }}>
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
