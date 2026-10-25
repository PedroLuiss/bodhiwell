import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';
import { BLOCKED_STATUSES } from '../config/navs/mainMenuItems';
import { useUserStatus } from '../context/UserStatusContext';

interface ProtectedRouteProps {
  children?: React.ReactNode;
}

export const PATHS_TO_BLOCK_ROUTES = [
  '/reservations',
  '/my-consultation',
  '/payment-list',
  '/wallet',
  '/availability',
  '/blog',
  '/blog/create',
];

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isAuthenticated } = useAuthContext();
  const { userStatusData } = useUserStatus();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isBlocked = 
    user?.type_account === 'professional' && 
    userStatusData?.status && 
    BLOCKED_STATUSES.includes(userStatusData.status);

  const isProtectedRoute = PATHS_TO_BLOCK_ROUTES.some(path => location.pathname.startsWith(path));

  if (isBlocked && isProtectedRoute) {
    return <Navigate to="/access-denied" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default ProtectedRoute;