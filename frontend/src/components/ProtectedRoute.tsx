import React from 'react';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  feature?: 'quests' | 'ranking';
  onBlockedAccess?: () => void;
}

/**
 * Guard component that protects routes based on authentication status
 * - If requireAuth=true, redirects to login if not authenticated or is guest
 * - If feature is specified, shows a modal for guests trying to access protected features
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = false,
  feature,
  onBlockedAccess,
}) => {
  const { isAuthenticated, isGuest, isProtectedFeature } = useAuthStore();

  // If route requires auth and user is not authenticated
  if (requireAuth && !isAuthenticated && !isGuest) {
    return null; // Let parent handle redirect to landing
  }

  // If accessing a protected feature as guest
  if (isGuest && feature && isProtectedFeature(feature)) {
    onBlockedAccess?.();
    return null; // Modal will be shown by parent
  }

  return <>{children}</>;
};
