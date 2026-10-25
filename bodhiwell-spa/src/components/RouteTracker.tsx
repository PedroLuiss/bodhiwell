import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { localStorageHelper, REDIRECT_AFTER_LOGIN } from '../utils/localStorageHelper';

const excludedRoutes = ['/login', '/register'];

const RouteTracker = () => {
  const location = useLocation();
  const { user } = useAuthContext();

  useEffect(() => {
    if (!user) {
      return;
    }

    if (excludedRoutes.includes(location.pathname)) {
      return;
    }

    localStorageHelper.setItem(REDIRECT_AFTER_LOGIN, location.pathname);
    
  }, [location, user]);

  return null;
};

export default RouteTracker;