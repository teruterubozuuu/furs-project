import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import AddPost from "./AddPost";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";

export default function TopNavbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userType, setUserType] = useState("");
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
      const fetchUserData = async () => {
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserType(data.userType);
      }
    } catch (error) {
      console.error("Error fetching user data: ", error);
    } finally {
      setLoading(false);
    }
  };
      fetchUserData();
  },[]);

    if (loading) return null;
  

  return (
    <nav className="hidden xl:flex h-auto w-[800px] px-20 justify-around items-center text-center">
      <div className="flex flex-col items-center">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive
              ? "text-xl text-[#fbc02d] px-3 py-2 bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
              : "text-xl text-[#fbc02d] px-3 py-2 hover:bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
          }
        >
          <i className="bi bi-house"></i>
        </NavLink>
        <span className="text-xs text-[#f5f5f5] mt-1">Home</span>
      </div>

      <div className={userType == "Rescuer" ? "flex flex-col items-center" : "hidden"}>
        <NavLink
          to="/heatmap"
          className={({ isActive }) =>
            isActive
              ? "text-xl text-[#fbc02d] px-3 py-2 bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
              : "text-xl text-[#fbc02d] px-3 py-2 hover:bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
          }
        >
          <i className="bi bi-radar"></i>
        </NavLink>
        <span className="text-xs text-[#f5f5f5] mt-1">Heatmap</span>
      </div>

      <div className={userType === "Rescuer" || userType === "Adoption Coordinator" ? "hidden" : "flex flex-col items-center"}>
        <button
          type="button"
          aria-label="Post"
          className="text-xl text-[#fbc02d] px-3 py-2 hover:bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <i className="bi bi-plus-square"></i>
        </button>
        <span className="text-xs text-[#f5f5f5] mt-1">Post</span>
      </div>

       <AddPost isOpen = {isOpen} onClose={()=>setIsOpen(false)} />

      <div className="flex flex-col items-center">
        <NavLink
          to="/organizations"
          className={({ isActive }) =>
            isActive
              ? "text-xl text-[#fbc02d] px-3 py-2 bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
              : "text-xl text-[#fbc02d] px-3 py-2 hover:bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
          }
        >
          <i className="bi bi-people"></i>
        </NavLink>
        <span className="text-xs text-[#f5f5f5] mt-1">Organizations</span>
      </div>
    </nav>
  );
}
