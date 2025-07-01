import React, { useEffect, useState } from "react";
import { db } from "../../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import temporaryPic from "../../../assets/yujei (copy).jpg"

export default function LeftSideBar() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        setUsername(userDoc.data().username);
      } catch (error) {
        console.error("Error fetching username: ", error);
      }
    };
    fetchUsername();
  }, [user]); //a dependency array to prevent this effect to run again ( ex. when typing, scrolling, etc.)

  return (
    <div className="h-full hidden xl:flex xl:justify-center">
      <div>
        <div className="text-sm border border-gray-300 p-5 rounded-sm space-y-2 text-center">
          <div className="flex justify-center"><img src={temporaryPic} alt="temporary picture" className="w-30 rounded-full"/></div>{/*temporary picture*/}
          <h1 className="font-semibold">{username || 'Loading...'}</h1>
          <p className="text-gray-400 italic">Add a description...</p>
        </div>
      </div>
    </div>
  );
}
