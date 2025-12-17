import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  requiredRole?: string;
  requiredRoles?: string[]; // allow any-of multiple roles
  requireRoles?: string[];  // backward-compatible alias used in routes
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAdmin = false,
  requiredRole,
  requiredRoles,
  requireRoles,
}) => {
  const { isAuthenticated, isAdmin, hasRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-xl text-gray-600">Access Denied</p>
          <p className="text-gray-500 mt-2">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  const rolesToCheck = requiredRoles || requireRoles;

  // If multiple roles provided, allow access if user has any
  if (rolesToCheck && rolesToCheck.length > 0) {
    const hasAny = rolesToCheck.some(r => hasRole(r));
    if (!hasAny) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
            <p className="text-xl text-gray-600">Access Denied</p>
            <p className="text-gray-500 mt-2">
              You need one of the following roles to access this page: {rolesToCheck.join(', ')}
            </p>
          </div>
        </div>
      );
    }
  } else if (requiredRole && !hasRole(requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">403</h1>
          <p className="text-xl text-gray-600">Access Denied</p>
          <p className="text-gray-500 mt-2">
            You need the {requiredRole} role to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;


