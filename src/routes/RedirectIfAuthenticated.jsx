import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function RedirectIfAuthenticated({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUserRole(userDoc.data().userType);
        }
      } catch (err) {
        console.error("Error fetching user role:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  // 🚨 Don't render or redirect until we know the user role
  if (loading) return null;

  // Only redirect when user and userRole are both ready
  if (user && userRole) {
    if (location.pathname === "/login" || location.pathname === "/signup") {
      if (userRole === "Admin") {
        return <Navigate to="/admin/dashboard" replace />;
      } else {
        return <Navigate to="/home" replace />;
      }
    }
  }

  return children;
}
