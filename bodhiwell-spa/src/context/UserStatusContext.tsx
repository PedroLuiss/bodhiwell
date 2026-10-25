import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { userStatusService } from '../services/userStatusService';
import { useAuthContext } from './AuthContext';
import { UserStatusApiResponse } from '../types';

interface UserStatusContextType {
  userStatusData: UserStatusApiResponse | null;
  loading: boolean;
  error: string | null;
  fetchUserStatus: () => Promise<void>;
}

const UserStatusContext = createContext<UserStatusContextType | undefined>(undefined);
export const UserStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const [userStatusData, setUserStatusData] = useState<UserStatusApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserStatus = useCallback(async () => {
    if (user?.type_account !== 'professional') {
      setLoading(false);
      setUserStatusData(null); 
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await userStatusService.getStatus();

      if (response.success && response.data) {
        setUserStatusData(response.data);
      } else {
        setError(response.message || 'Error al cargar el estado del usuario.');
      }
    } catch (err: any) {
      console.error('Error en UserStatusContext:', err);
      setError(err.message || 'No se pudo conectar con el servidor.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchUserStatus();
  }, [fetchUserStatus]);

  const value = {
    userStatusData,
    loading,
    error,
    fetchUserStatus,
  };

  return (
    <UserStatusContext.Provider value={value}>
      {children}
    </UserStatusContext.Provider>
  );
};

export const useUserStatus = () => {
  const context = useContext(UserStatusContext);
  if (context === undefined) {
    throw new Error('useUserStatus debe ser usado dentro de un UserStatusProvider');
  }
  return context;
};