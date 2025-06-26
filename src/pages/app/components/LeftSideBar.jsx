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
    <div className="h-auto border-r border-gray-300 flex-none w-70 hidden xl:flex xl:justify-center p-4">
      <div className="p-4 fixed">
        <div className="text-sm border border-gray-300 p-10 rounded-sm space-y-2 text-center">
          <img src={temporaryPic} alt="temporary picture" className="w-50 rounded-full"/>  {/*temporary picture*/}
          <h1 className="font-semibold">{username || 'Loading...'}</h1>
          <p className="text-gray-400 italic">Add a description...</p>
        </div>
      </div>
    </div>
  );
}
