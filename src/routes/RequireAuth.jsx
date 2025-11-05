import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDoc, doc } from "firebase/firestore";
import { useState, useEffect } from "react";
import { db } from "../firebase/config";

export default function RequireAuth({ children }) {
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
          const data = userDoc.data();
          setUserRole(data.userType);
        }
      } catch (error) {
        console.error("Error fetching user role", error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (location.pathname.startsWith("/admin") && userRole !== "Admin") {
    return <Navigate to="/home" replace />;
  }

  if (!location.pathname.startsWith("/admin") && userRole === "Admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
