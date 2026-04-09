import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

export default function PublicOnlyRoute({
  children,
}: {
  children: JSX.Element;
}) {
  const { isAuthenticated } = useAuth();

  if (isAuthenticated) {
    return <Navigate to="/weekly-menu" replace />;
  }

  return children;
}