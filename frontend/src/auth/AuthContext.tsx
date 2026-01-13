import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setAuth, clearAuth, RootState } from '../store';

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
  const dispatch = useDispatch();
  const { user, accessToken, isAuthenticated, isLoading } = useSelector(
    (state: RootState) => state.auth
  );

  // Load auth state from sessionStorage on mount
  useEffect(() => {
    const storedToken = sessionStorage.getItem('access_token');
    const storedUser = sessionStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        dispatch(setAuth({ user: userData, accessToken: storedToken }));
        // Also set in localStorage for API client
        localStorage.setItem('access_token', storedToken);
      } catch (error) {
        console.error('Error loading auth state:', error);
        sessionStorage.removeItem('access_token');
        sessionStorage.removeItem('user');
        localStorage.removeItem('access_token');
        dispatch(clearAuth());
      }
    } else {
      dispatch(clearAuth());
    }
  }, [dispatch]);

  const login = (token: string, userData: User) => {
    dispatch(setAuth({ user: userData, accessToken: token }));
    // Store in sessionStorage for session persistence
    sessionStorage.setItem('access_token', token);
    sessionStorage.setItem('user', JSON.stringify(userData));
    // Also store in localStorage for API client interceptors
    localStorage.setItem('access_token', token);
  };

  const logout = () => {
    dispatch(clearAuth());
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('user');
    localStorage.removeItem('access_token');
  };

  const value: AuthContextType = {
    user,
    accessToken,
    isAuthenticated,
    login,
    logout,
  };

  // Don't render children until we've checked sessionStorage
  if (isLoading) {
    return null; // or a loading spinner
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
