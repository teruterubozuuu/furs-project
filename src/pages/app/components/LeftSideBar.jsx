import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import defaultImg from "../../../assets/default_img.jpg";
import { NavLink } from "react-router-dom";
import AddPost from "./AddPost";
import logo from "../../../assets/logo_furs.png";

export default function LeftSideBar() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  const [currentUserProfile, setCurrentUserProfile] = useState({
    photoURL: defaultImg,
    username: user?.displayName,
    role: user?.userType
  });

  // 1. FETCH CURRENT USER PROFILE DATA

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCurrentUserProfile({
            photoURL: data.profilePhoto || defaultImg,
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
              src={currentUserProfile.photoURL}
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
            <nav className="space-y-10">
              <NavLink to="/home" className={ ({isActive}) => `flex items-center gap-7 px-7 ${isActive ? " border-l-4 border-[#fbc02d]" :"border-l-4 border-transparent"}`}>
                {({isActive}) => (
                  <>
                    <i
                      className={ `text-2xl transition-colors duration-200 ${
                      isActive ? "text-[#fbc02d] bi bi-house-door" : "bi bi-house-door"
                      }`}
                    ></i>
                    <span
                      className={isActive ? "font-semibold text-gray-900" : "font-light"}
                    >
                      Home
                    </span>
                  </>
                )}
              </NavLink>

              <NavLink to="/notifications" className={ ({isActive}) => `flex items-center gap-7 px-7 ${isActive ? " border-l-4 border-[#fbc02d]" :"border-l-4 border-transparent"}`}>
                  {({isActive}) => (
                  <>
                    <i
                      className={ `text-2xl transition-colors duration-200 ${
                      isActive ? "text-[#fbc02d] bi bi-bell" : "bi bi-bell"
                      }`}
                    ></i>
                    <span
                      className={isActive ? "font-semibold text-gray-900" : "border-l-4 border-transparent  font-light"}
                    >
                      Notifications
                    </span>
                  </>
                )}
              </NavLink>

              <NavLink to="/heatmap" className={ ({isActive}) => `flex items-center gap-7 px-7 ${isActive ? " border-l-4 border-[#fbc02d]" :"border-l-4 border-transparent"}`}>
                {({isActive}) => (
                  <>
                    <i
                      className={ `text-2xl transition-colors duration-200 ${
                      isActive ? "text-[#fbc02d] bi bi-radar" : "bi bi-radar"
                      }`}
                    ></i>
                    <span
                      className={isActive ? "font-semibold text-gray-900" : " border-l-4 border-transparent  font-light"}
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
                      className={ `text-2xl transition-colors duration-200 ${
                      isActive ? "text-[#fbc02d] bi bi-people" : "bi bi-people"
                      }`}
                    ></i>
                    <span
                      className={isActive ? "font-semibold text-gray-900" : "border-l-4 border-transparent font-light"}
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
                      className={ `text-2xl transition-colors duration-200 ${
                      isActive ? "text-[#fbc02d] bi bi-person" : "bi bi-person"
                      }`}
                    ></i>
                    <span
                      className={isActive ? "font-semibold text-gray-900" : "border-l-4 border-transparent font-light"}
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
