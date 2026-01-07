import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: number;
  username: string;
  role: string;
  tenant_id: number;
}

interface AuthContextType {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  login: (accessToken: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load auth state from sessionStorage on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('access_token');
    const storedUser = sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setAccessToken(storedToken);
        setUser(JSON.parse(storedUser));
        // Also set in localStorage for API client
        localStorage.setItem('access_token', storedToken);
      } catch (error) {
        console.error('Error loading auth state:', error);
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('access_token');
      }
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, userData: User) => {
    setAccessToken(token);
    setUser(userData);
    // Store in sessionStorage for session persistence
    sessionStorage.setItem('access_token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    // Also store in localStorage for API client interceptors
    localStorage.setItem('access_token', token);
  };

  const logout = () => {
    setAccessToken(null);
    setUser(null);
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('access_token');
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated: !!user && !!accessToken,
    login,
    logout,
  };

  // Don't render children until we've checked sessionStorage
  if (isLoading) {
    return null; // or a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

