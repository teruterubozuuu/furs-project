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
    const fetchUsername = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setUsername(userDoc.data().username);
      } catch (error) {
        console.error("Error fetching username: ", error);
      }
    };

    const fetchRole = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setRole(userDoc.data().userType);
      } catch (error) {
        console.error("Error fetching user role: ", error);
      }
    };
    fetchUsername();
    fetchRole();
  }, [user]); 

  return (
    <div className="h-full hidden xl:flex xl:justify-center ">
      <div>
        <div className="text-sm border border-gray-200 shadow-sm p-5 rounded-sm space-y-2 text-center bg-[#fafafa]">
          <div className="flex justify-center"><img src={defaultImg} alt="temporary picture" className="w-30 rounded-full"/></div>{/*temporary picture*/}
          <h1 className="font-semibold">{username || 'Loading...'}</h1>
          <h2 className="font-medium text-gray-500">{role || 'Loading...'}</h2>
          <p className="text-gray-400 italic">Add a description...</p>
        </div>
      </div>
    </div>
  );
}
