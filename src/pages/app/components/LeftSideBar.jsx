import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import defaultImg from "../../../assets/default_img.jpg";

export default function LeftSideBar() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  // 🚨 NEW STATES: For photo and description
  const [profilePhoto, setProfilePhoto] = useState(defaultImg);
  const [description, setDescription] = useState("Add a description...");

  useEffect(() => {
    const fetchUserDetails = async () => {
      if (!user) return;

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));

        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username || user.displayName);
          setRole(data.userType || "");
          // 🚨 SET NEW FIELDS: Photo URL and Description
          setProfilePhoto(data.profilePhoto || defaultImg);
          setDescription(data.description || "Add a description...");
        } else {
          setUsername(user.displayName || "Unnamed");
          setRole("Community Volunteer");
          // Ensure photo and description fall back if doc is missing
          setProfilePhoto(defaultImg);
          setDescription("Add a description...");
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setUsername(user.displayName || "Unnamed");
        setRole("");
        setProfilePhoto(defaultImg);
        setDescription("Add a description...");
      }
    };

    fetchUserDetails();
    // 🚨 NOTE: Dependency on `user` will cause refresh when auth status changes.
  }, [user]);

  return (
    <div className="h-full hidden xl:flex xl:justify-center ">
      <div>
        <div className="text-sm border border-gray-200 shadow-sm p-7 rounded-sm space-y-2 text-center bg-[#fafafa]">
          <h1 className="font-semibold text-[rgb(40,112,56)] text-lg">
            {role || "Loading..."}
          </h1>

          {/* 🚨 UPDATED: Use the fetched profile photo */}
          <div className="flex justify-center">
            <img
              src={profilePhoto}
              alt="User profile"
              className="w-20 h-20 rounded-full object-cover"
            />
          </div>

          <h2 className="font-semibold">{username || "Loading..."}</h2>
          {/* 🚨 UPDATED: Use the fetched description */}
          <p className="text-gray-400 italic">{description}</p>
        </div>
      </div>
    </div>
  );
}
