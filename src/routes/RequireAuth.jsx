export default function RequireAuth({ children }) {
  const { user, loading } = useAuth(); // include loading
  const location = useLocation();
  const [userRole, setUserRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRoleLoading(false);
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
        setRoleLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  // 🔁 Wait for both auth and role loading
  if (loading || roleLoading) return null;

  // 🔒 Not logged in
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 🛑 Access rules
  if (location.pathname.startsWith("/admin") && userRole !== "Admin") {
    return <Navigate to="/home" replace />;
  }

  if (!location.pathname.startsWith("/admin") && userRole === "Admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  return children;
}
