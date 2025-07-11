import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import defaultImg from "../../../assets/default_img.jpg"

export default function LeftSideBar() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [role,setRole] = useState("");

  useEffect(() => {
  const fetchUserDetails = async () => {
    if (!user) return;

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));

      if (userDoc.exists()) {
        const data = userDoc.data();
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

  fetchUserDetails();
}, [user]);

  return (
    <div className="h-full hidden xl:flex xl:justify-center ">
      <div>
        <div className="text-sm border border-gray-200 shadow-sm p-7 rounded-sm space-y-2 text-center bg-[#fafafa]">
          <h1 className="font-semibold text-[rgb(40,112,56)] text-lg">{role || 'Loading...'}</h1>
          <div className="flex justify-center"><img src={defaultImg} alt="temporary picture" className="w-30 rounded-full"/></div>{/*temporary picture*/}
          <h2 className="font-semibold">{username || 'Loading...'}</h2>
          <p className="text-gray-400 italic">Add a description...</p>
        </div>
      </div>
    </div>
  );
}
