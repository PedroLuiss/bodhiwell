import React, { createContext, useContext, useState, useEffect } from 'react';
import { StatusUser } from '../types';
import { refreshTokenService } from '../services/authService';

interface UserProfile {
  uid?: string;
  email?: string;
  username?: string;
  status?: StatusUser;
  first_name?: string;
  last_name?: string;
  main_profession?: string;
  type_account?: string;
  dni?: string;
  is_email_verified?: boolean;
}

interface AuthContextType {
  token: string | null;
  user: UserProfile | null;
  setUser: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  isAuthenticated: boolean;
  login: (token: string, user: UserProfile ) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'));
  const [user, setUser] = useState<UserProfile | null>(() => {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }, [token]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const login = React.useCallback((jwt: string, userData: UserProfile) => {
    setToken(jwt);
    setUser(userData);
  }, []);

  const isAuthenticated = !!token;

  useEffect(() => {
    const handleTokenRefreshed = (e: any) => {
      setToken(e.detail.token);
    };

    const handleLogout = () => {
      setToken(null);
      setUser(null);
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefreshed as any);
    window.addEventListener('auth:logout', handleLogout);

    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed as any);
      window.removeEventListener('auth:logout', handleLogout);
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isAuthenticated) {
      interval = setInterval(async () => {
        try {
          const data = await refreshTokenService();
          if (data.token) {
            setToken(data.token);
          }
        } catch (error) {
          console.error("Fallo el refresco automático de token", error);
        }
      }, 50 * 60 * 1000); 
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isAuthenticated]);

  const logout = React.useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('personal_info_backup');
    localStorage.removeItem('professional_profile_backup');
    localStorage.removeItem('professional_preview_data');
    localStorage.removeItem('professional_profile');
  }, []);
  return (
    <AuthContext.Provider value={{ 
      token,
      user,
      setUser,
      isAuthenticated,
      login,
      logout
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext debe usarse dentro de AuthProvider');
  return context;
};
