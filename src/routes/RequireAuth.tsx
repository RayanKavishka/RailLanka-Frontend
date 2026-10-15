import type { ReactNode } from "react";
import useAuthContext from "../hooks/useAuth";
import Loading from "../components/ui/Loading";
import { Navigate } from "react-router-dom";
import AccessDenied from "../components/ui/AccessDenied";

interface RequireAuthProps {
  children: ReactNode;
  roles?: string[];
}

const RequireAuth = ({ children, roles }: RequireAuthProps) => {
  const { user, isLoading, activeRole } = useAuthContext();

  console.log({ user, isLoading, activeRole });

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (roles && !roles.includes(activeRole)) {
    return <AccessDenied />;
  }

  return <>{children}</>;
};


export default RequireAuth;