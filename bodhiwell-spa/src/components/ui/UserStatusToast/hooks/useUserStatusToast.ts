import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useUserStatus } from '../../../../context/UserStatusContext';
import { useProfileCompletion } from '../../../../context/ProfileCompletionContext';
import { STATUS_CONFIGS } from '../constants';

export const useUserStatusToast = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userStatusData } = useUserStatus();
  const { isProfileComplete, isPersonalInfoComplete } = useProfileCompletion();
  
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  const userStatus = userStatusData?.status as string | undefined;

  const config = useMemo(() => {
    if (!userStatus || !STATUS_CONFIGS[userStatus]) return null;
    
    let dynamicConfig = { ...STATUS_CONFIGS[userStatus] };

    if (userStatus === 'pending_completion') {
      const { pathname } = location;

      if (pathname.includes('/dashboard')) {
        if (!isProfileComplete && !isPersonalInfoComplete) {
          dynamicConfig.action = { textKey: 'UserStatusToast.pendingCompletion.action', path: '/profile' };
        } else if (!isProfileComplete) {
          dynamicConfig.action = { textKey: 'UserStatusToast.pendingCompletion.action', path: '/profile' };
          dynamicConfig.messageKey = 'UserStatusToast.personalDoneButProfileIncomplete';
        } else if (!isPersonalInfoComplete) {
          dynamicConfig.messageKey = 'UserStatusToast.profileDoneButPersonalIncomplete';
          dynamicConfig.action = { textKey: 'UserStatusToast.completePersonalInfo', path: '/personal-info' };
        }
      } 
      else if (pathname.includes('/profile')) {
        if (!isProfileComplete) {
          delete dynamicConfig.action;
        } else if (isProfileComplete && !isPersonalInfoComplete) {
          dynamicConfig.messageKey = 'UserStatusToast.profileDoneButPersonalIncomplete';
          dynamicConfig.action = { textKey: 'UserStatusToast.completePersonalInfo', path: '/personal-info' };
        } else {
          delete dynamicConfig.action;
        }
      } 
      else if (pathname.includes('/personal-info')) {
        if (!isProfileComplete) {
          if (isPersonalInfoComplete) dynamicConfig.messageKey = 'UserStatusToast.personalDoneButProfileIncomplete';
          dynamicConfig.action = { textKey: 'UserStatusToast.pendingCompletion.action', path: '/profile' };
        } else {
          dynamicConfig.messageKey = 'UserStatusToast.profileDoneButPersonalIncomplete';
          delete dynamicConfig.action;
        }
      }
    }
    return dynamicConfig;
  }, [userStatus, location.pathname, isProfileComplete, isPersonalInfoComplete]);

  useEffect(() => {
    setIsVisible(!!(userStatusData && userStatus && config && !isDismissed));
  }, [userStatusData, userStatus, config, isDismissed]);

  const handleActionClick = () => {
    if (config?.action?.path) navigate(config.action.path);
  };

  const handleClose = () => setIsDismissed(true);

  return { config, isVisible, navigate, handleActionClick, handleClose };
};