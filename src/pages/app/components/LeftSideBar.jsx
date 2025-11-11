import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../context/AuthContext";
import defaultImg from "../../../assets/default_img.jpg";
import { NavLink } from "react-router-dom";
import AddPost from "./AddPost";
import logo from "../../../assets/logo_furs.png";
import { collection, query, orderBy, onSnapshot, doc, getDoc, where } from "firebase/firestore"; 

export default function LeftSideBar() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(false);

const [currentUserProfile, setCurrentUserProfile] = useState({
  // Start with the photo URL from the live Auth user object
  photoURL: user?.photoURL || defaultImg, 
  username: user?.displayName,
  role: user?.userType
});

  const [unreadCount, setUnreadCount] = useState(0); // NEW STATE for the badge count

  // ... existing useEffect blocks ...

  // 2. NEW: Listen for Unread Notifications Count
  useEffect(() => {
    if (!user) {
      setUnreadCount(0); // Reset if user logs out
      return;
    }

    const notifRef = collection(db, "users", user.uid, "notifications");
    // Query for all notifications where 'read' is false
    const q = query(notifRef, where("read", "==", false)); 

    // Use onSnapshot to get real-time updates on unread count
    const unsubscribe = onSnapshot(q, (snapshot) => {
      // The snapshot.size property gives the total number of documents matching the query
      setUnreadCount(snapshot.size); 
    }, (error) => {
      console.error("Error fetching unread notifications:", error);
      setUnreadCount(0);
    });

    return () => unsubscribe(); // Clean up the listener on unmount
  }, [user]);

  // 1. FETCH CURRENT USER PROFILE DATA

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
setCurrentUserProfile({
            photoURL: data.profilePhoto || user?.photoURL || defaultImg,
          });
          setUsername(data.username || user.displayName);
          setRole(data.userType || "");
        } else {
           setUsername(user.displayName || "Unnamed");
          setRole("Community Volunteer");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUsername(user.displayName || "Unnamed");
        setRole("");
      }
    };

    fetchUserProfile();
  }, [user]); 

  return (
    <div className="h-full  hidden xl:flex xl:flex-col xl:w-full ">
      <div className="space-y-2">
        <div className="text-sm border border-gray-200 shadow-sm  rounded-lg bg-[#fafafa]">
          <div className="px-5 pt-5"> <img src={logo} alt="Furs Logo" className="w-50 h-auto" /></div>
          <div className="flex items-center py-7 px-5">
<img
  src={user?.photoURL || currentUserProfile.photoURL} 
  alt="User profile"
  className="w-12 h-12 rounded-full object-cover"
/>
            <div className=" flex flex-col justify-center ml-3">
              <h1 className="font-semibold text-lg text-black/80">
                {username || "Loading..."}
              </h1>
              <h2 className="text-sm text-[rgb(40,112,56)] font-medium">
                {role || "Loading..."}
              </h2>
            </div>
          </div>
          <div className="text-xl space-y-2 mt-3">
            <nav className="space-y-10 text-gray-900">
              <NavLink to="/home" className={ ({isActive}) => `flex items-center gap-7 px-7 ${isActive ? " border-l-4 border-[#fbc02d]" :"border-l-4 border-transparent"}`}>
                {({isActive}) => (
                  <>
                    <i
                      className={ `text-2xl ${
                      isActive ? "text-[#fbc02d] bi bi-house-door-fill" : "bi bi-house-door"
                      }`}
                    ></i>
                    <span
                      className={isActive ? "font-medium" : "font-light"}
                    >
                      Home
                    </span>
                  </>
                )}
              </NavLink>

<NavLink to="/notifications" className={ ({isActive}) => `flex items-center gap-7 px-7 ${isActive ? " border-l-4 border-[#fbc02d]" :"border-l-4 border-transparent"}`}>
                  {({isActive}) => (
                  <div className="flex items-center justify-between w-full"> 
                    <div className="flex items-center gap-7">
                      <i
                        className={ `text-2xl ${
                        isActive ? "text-[#fbc02d] bi bi-bell-fill" : "bi bi-bell" 
                        }`}
                      ></i>
                      <span
                        className={isActive ? "font-medium" : "border-l-4 border-transparent  font-light"}
                      >
                        Notifications
                      </span>
                    </div>

                    {unreadCount > 0 && (
                      <span className="inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-[#2e7d32] rounded-full">
                        {unreadCount > 99 ? "99+" : unreadCount}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>

              <NavLink to="/heatmap" className={ ({isActive}) => `flex items-center gap-7 px-7 ${isActive ? " border-l-4 border-[#fbc02d]" :"border-l-4 border-transparent"}`}>
                {({isActive}) => (
                  <>
                    <i
                      className={ `text-2xl ${
                      isActive ? "text-[#fbc02d] bi bi-radar" : "bi bi-radar"
                      }`}
                    ></i>
                    <span
                      className={isActive ? "font-medium" : " border-l-4 border-transparent  font-light"}
                    >
                      Heatmap
                    </span>
                  </>
                )}
              </NavLink>

              <NavLink to="/organizations" className={ ({isActive}) => `flex items-center gap-7 px-7 ${isActive ? " border-l-4 border-[#fbc02d]" :"border-l-4 border-transparent"}`}>

                                {({isActive}) => (
                  <>
                    <i
                      className={ `text-2xl ${
                      isActive ? "text-[#fbc02d] bi bi-people-fill" : "bi bi-people"
                      }`}
                    ></i>
                    <span
                      className={isActive ? "font-medium" : "border-l-4 border-transparent font-light"}
                    >
                      Organizations
                    </span>
                  </>
                )}
              </NavLink>

              <NavLink to="/profile" className={ ({isActive}) => `flex items-center gap-7 px-7 ${isActive ? " border-l-4 border-[#fbc02d]" :"border-l-4 border-transparent"}`}>

                                {({isActive}) => (
                  <>
                    <i
                      className={ `text-2xl ${
                      isActive ? "text-[#fbc02d] bi bi-person-fill" : "bi bi-person"
                      }`}
                    ></i>
                    <span
                      className={isActive ? "font-medium" : "border-l-4 border-transparent font-light"}
                    >
                      Profile
                    </span>
                  </>
                )}
              </NavLink>
            </nav>
            <div
              className={`p-5 ${
                role === "Rescuer" ? "hidden" : "flex flex-col items-center"
              }`}
            >
              <button
                type="button"
                aria-label="Post"
                className="text-lg bg-[#2e7d32]  w-full px-2 py-3 text-white hover:bg-[rgb(28,79,39)] rounded-full duration-200 ease-in cursor-pointer"
                onClick={() => setIsOpen(true)}
              >
                Post
              </button>
            </div>

            <AddPost isOpen={isOpen} onClose={() => setIsOpen(false)} />
          </div>
        </div>
      </div>
    </div>
  );
}
