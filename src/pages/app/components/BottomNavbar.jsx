import { NavLink } from "react-router-dom";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../context/AuthContext";
import { 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore"; 
import { useEffect, useState } from "react";
import AddPost from "./AddPost";

export default function BottomNavbar() {
  const [userType, setUserType] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0); 

  // 1. Fetch User Type (Corrected dependency to [user])
  useEffect(() => {
    if (!user) return;

    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserType(data.userType);
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };
    fetchUserData();
  }, [user]); // Dependency corrected

  // 2. NEW: Real-time listener for unread notification count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    const notifRef = collection(db, "users", user.uid, "notifications");
    // Query for notifications where 'read' is explicitly false
    const q = query(notifRef, where("read", "==", false)); 

    const unsubscribe = onSnapshot(q, (snapshot) => {
      // snapshot.size is the number of documents matching the query (i.e., unread)
      setUnreadCount(snapshot.size); 
    }, (error) => {
      console.error("Error fetching unread notifications:", error);
      setUnreadCount(0);
    });

    // Cleanup the listener when the component unmounts
    return () => unsubscribe(); 
  }, [user]);


  return (
    <>
      <nav className="fixed flex-1 m-0 bottom-0 left-0 right-0 bg-[#2e7d32]  xl:hidden xl:top-0 flex px-3 py-4 justify-around gap-4">

        {/*HOME*/}
        <div>
          <NavLink to="/home">
            <i className="bi bi-house text-[#fbc02d]  block text-center text-lg"></i>
          </NavLink>
        </div>

        {/*Notifications (MODIFIED FOR BADGE) */}
        <div className="relative"> {/* Use relative positioning for the container */}
          <NavLink to="/notifications">
            <i className="bi bi-bell text-[#fbc02d] block text-center text-lg"></i>
            
            {/* ⬅️ Notification Badge: Render only if count > 0 */}
            {unreadCount > 0 && (
              <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 inline-flex items-center justify-center h-4 w-4 text-[10px] font-bold leading-none text-white bg-red-600 rounded-full ring-2 ring-[#2e7d32]">
                {/* Display the count, or '9+' if it exceeds a single digit */}
                {unreadCount > 9 ? "9+" : unreadCount} 
              </span>
            )}
            {/* ---------------------------------------------------- */}
          </NavLink>
        </div>

        {/*Post*/}
        <div
          className={
            userType === "Rescuer"
              ? "hidden"
              : "flex"
          }
        >
          <button onClick={() => setIsOpen(true)}>
            <i className="bi bi-plus-square text-[#fbc02d] block text-center text-lg"></i>
          </button>
        </div>

        <AddPost isOpen={isOpen} onClose={() => setIsOpen(false)} />
        
        {/*Heatmap*/}
        <div>
          <NavLink to="/heatmap">
            <i className="bi bi-radar text-[#fbc02d] block text-center text-lg"></i>
          </NavLink>
        </div>
        
        {/*Organizations*/}
        <div>
          <NavLink to="/organizations">
            <i className="bi bi-people  text-[#fbc02d]  block text-center text-lg"></i>
          </NavLink>
        </div>

      </nav>
    </>
  );
}