import { ReactNode, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

interface ProtectedRouteProps {
  children: ReactNode;
  allowedRoles?: string[];
  requiredPermissions?: string[];
}

const ProtectedRoute = ({
  children,
  allowedRoles,
  requiredPermissions,
}: ProtectedRouteProps) => {
  const { isLoggedIn, hasRole, hasPermission, setLastPath } = useAuth();
  const location = useLocation();

  useEffect(() => {
    // Store the current path when it changes
    if (isLoggedIn) {
      setLastPath(location.pathname);
    }
  }, [location.pathname, isLoggedIn, setLastPath]);

  if (!isLoggedIn) {
    // Store the attempted path before redirecting to login
    setLastPath(location.pathname);
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // If roles are specified, check if user has required role
  if (allowedRoles && !hasRole(allowedRoles)) {
    // Redirect to dashboard if user doesn't have required role
    return <Navigate to="/" replace />;
  }

  // If permissions are specified, check if user has all required permissions
  if (requiredPermissions && !requiredPermissions.every(hasPermission)) {
    // Redirect to dashboard if user doesn't have required permissions
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
