import { createContext, useContext, useEffect, useState } from "react";
import { onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
        }

        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
          console.log("Auth state changed:", currentUser);
          setUser(currentUser);

          if (currentUser) {
            try {
              // fetches user document from Firestore
              const userRef = doc(db, "users", currentUser.uid);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                setUserData(userSnap.data());
              } else {
                console.warn("User document not found in Firestore");
                setUserData(null);
              }
            } catch (error) {
              console.error("Error fetching user data:", error);
              setUserData(null);
            }
          } else {
            setUserData(null);
          }

          setLoading(false);
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error initializing auth:", error);
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
