import type { ReactNode } from "react";
import useAuthContext from "../hooks/useAuth";
import Loading from "../components/ui/Loading";
import { Navigate } from "react-router-dom";
import NotFound from "../pages/NotFound";

interface RequireAuthProps {
  children: ReactNode;
  roles?: string[];
}

const RequireAuth = ({ children, roles }: RequireAuthProps) => {
  const { user, isLoading, activeRole } = useAuthContext();

  if (isLoading) {
    return <Loading />;
  }

  if (!user) {
    return <Navigate to="/" replace />;
  }

  if (roles && !roles.includes(activeRole)) {
    return <NotFound />;
  }

  return <>{children}</>;
};


export default RequireAuth;