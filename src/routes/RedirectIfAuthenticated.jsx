import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config.js";

export default function RedirectIfAuthenticated({ children }) {
  const { user, loading: authLoading } = useAuth(); 
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      if (!user.emailVerified) {
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

  if (authLoading || loading) return null;

  if (user && user.emailVerified && userRole) {
    if (
      ["/", "/login", "/signup"].includes(location.pathname)
    ) {
      return (
        <Navigate
          to={userRole === "Admin" ? "/admin/dashboard" : "/home"}
          replace
        />
      );
    }
  }

  return children;
}