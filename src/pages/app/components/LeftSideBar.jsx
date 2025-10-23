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
  const [profilePhoto, setProfilePhoto] = useState(defaultImg);

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || user.displayName);
          setRole(data.userType || "");

          setProfilePhoto(data.profilePhoto || defaultImg);
        } else {
          setUsername(user.displayName || "Unnamed");
          setRole("Community Volunteer");

          setProfilePhoto(defaultImg);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUsername(user.displayName || "Unnamed");
        setRole("");
        setProfilePhoto(defaultImg);
      }
    };

    fetchUserDetails();
  }, [user]);

  return (
    <div className="h-full  hidden xl:flex xl:flex-col xl:w-full ">
      <div className="space-y-4">
        <img src={logo} alt="Furs Logo" className="w-35 h-auto" />
        <div className="text-sm border border-gray-200 shadow-sm  rounded-lg bg-[#fafafa]">
          <div className="flex items-center p-7">
            <img
              src={profilePhoto}
              alt="User profile"
              className="w-15 h-15 rounded-full object-cover"
            />
            <div className=" flex flex-col justify-center ml-2">
              <h1 className="font-semibold text-lg">
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
                      isActive ? "text-[#fbc02d] bi bi-house-door-fill" : "bi bi-house-door"
                      }`}
                    ></i>
                    <span
                      className={isActive ? "font-semibold text-gray-900" : ""}
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
                      isActive ? "text-[#fbc02d] bi bi-bell-fill" : "bi bi-bell"
                      }`}
                    ></i>
                    <span
                      className={isActive ? "font-semibold text-gray-900" : ""}
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
                      className={isActive ? "font-semibold text-gray-900" : ""}
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
                      isActive ? "text-[#fbc02d] bi bi-people-fill" : "bi bi-people"
                      }`}
                    ></i>
                    <span
                      className={isActive ? "font-semibold text-gray-900" : "border-l-4 border-transparent"}
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
                      isActive ? "text-[#fbc02d] bi bi-person-fill" : "bi bi-person"
                      }`}
                    ></i>
                    <span
                      className={isActive ? "font-semibold text-gray-900" : "border-l-4 border-transparent"}
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
                className="text-lg bg-[#2e7d32] w-full px-2 py-3 text-white hover:bg-[rgb(40,112,56)] rounded-full duration-200 ease-in cursor-pointer"
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
