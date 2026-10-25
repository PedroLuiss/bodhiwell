import React, { createContext, useState, useContext, useEffect, useCallback, ReactNode, useRef } from 'react';
import { getProfileMe, getProfileDetails } from '../services/profileService';
import { useAuthContext } from './AuthContext';
import { ProfileData } from '../types';
import { isProfessionalProfileComplete, isPersonalInfoComplete as isPersonalInfoCompleteUtils } from '../utils';

interface ProfileCompletionState {
  profileData: ProfileData['profile'] | null;
  isProfileComplete: boolean;
  isPersonalInfoComplete: boolean;
  loading: boolean;
  checkCompletionStatus: () => Promise<void>;
}

const ProfileCompletionContext = createContext<ProfileCompletionState | undefined>(undefined);

export const ProfileCompletionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuthContext();
  const [profileData, setProfileData] = useState<ProfileData['profile'] | null>(null);
  const [isProfileComplete, setIsProfileComplete] = useState(true);
  const [isPersonalInfoComplete, setIsPersonalInfoComplete] = useState(true);
  const [loading, setLoading] = useState(true);

  const isFetching = useRef(false);

  const checkCompletionStatus = useCallback(async () => {
    if (isFetching.current) return;

    if (user?.type_account !== 'professional') {
      setProfileData(null);
      setIsProfileComplete(true);
      setIsPersonalInfoComplete(true);
      setLoading(false);
      return;
    }

    setLoading(true);
    isFetching.current = true;

    try {
      let data: ProfileData['profile'] | null = null;
      data = await getProfileMe();
      setProfileData(data);

      if (data) {
        setIsProfileComplete(isProfessionalProfileComplete(data));
        setIsPersonalInfoComplete(isPersonalInfoCompleteUtils(data));
      }
    } catch (error) {
      console.error("Failed to check profile completion status:", error);
      setProfileData(null);
      setIsProfileComplete(true);
      setIsPersonalInfoComplete(true);
    } finally {
      setLoading(false);
      isFetching.current = false;
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      checkCompletionStatus();
    } else {
      setLoading(false);
      setProfileData(null);
      setIsProfileComplete(true);
      setIsPersonalInfoComplete(true);
    }
  }, [user, checkCompletionStatus]);

  return (
    <ProfileCompletionContext.Provider value={{ profileData, isProfileComplete, isPersonalInfoComplete, loading, checkCompletionStatus }}>
      {children}
    </ProfileCompletionContext.Provider>
  );
};

export const useProfileCompletion = (): ProfileCompletionState => {
  const context = useContext(ProfileCompletionContext);
  if (context === undefined) {
    throw new Error('useProfileCompletion must be used within a ProfileCompletionProvider');
  }
  return context;
};