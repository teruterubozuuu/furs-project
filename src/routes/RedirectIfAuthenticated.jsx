import { useAuth } from "../context/AuthContext";
import { Navigate, useLocation } from "react-router-dom";

export default function RedirectIfAuthenticated({ children }) {
  const { user } = useAuth();
  const location = useLocation();

  if (user && (location.pathname === "/login" || location.pathname === "/register")) {
    return <Navigate to="/home" replace />;
  }
  return children;
}