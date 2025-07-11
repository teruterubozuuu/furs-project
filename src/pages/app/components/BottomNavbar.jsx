import { NavLink } from "react-router-dom";
import { db } from "../../../firebase/config";
import { useAuth } from "../../../context/AuthContext";
import { doc, getDoc } from "firebase/firestore";
import { useEffect, useState } from "react";
import AddPost from "./AddPost"

export default function BottomNavbar() {
    const [userType, setUserType] = useState("");
    const [isOpen, setIsOpen] = useState(false);
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
          }
        };
        fetchUserData();
    },[]);
    

  return (
    < >
      <nav className="fixed flex-1 m-0 bottom-0 left-0 right-0 bg-[#2e7d32]  xl:hidden xl:top-0 flex px-3 py-4 justify-around gap-4">
        <div>
          <NavLink
            to="/home"
          >
            <i className="bi bi-house text-[#fbc02d]  block text-center text-lg"></i>
          </NavLink>
        </div>

        <div className={userType === "Rescuer" ? "flex" : "hidden"}>
          <NavLink
            to="/heatmap"
          >
            <i className="bi bi-radar text-[#fbc02d] block text-center text-lg"></i>
          </NavLink>
        </div>

        <div className={userType === "Rescuer" || userType === "Adoption Coordinator" ? "hidden" : "flex"}>
          <button
            onClick={() => setIsOpen(true)}
          >
            <i className="bi bi-plus-square text-[#fbc02d] block text-center text-lg"></i>
          </button>
        </div>

        <AddPost isOpen = {isOpen} onClose={()=>setIsOpen(false)} />

        <div className={userType === "Rescuer" ? "hidden" : "flex"}>
          <NavLink
            to="/adoption"
          >
            <i className="bi bi-search-heart text-[#fbc02d]  block text-center text-lg"></i>
          </NavLink>
        </div>

        <div>
          <NavLink
            to="/organizations"
          >
            <i className="bi bi-people  text-[#fbc02d]  block text-center text-lg"></i>
          </NavLink>
        </div>

        <div className="xl:hidden">
          <i className="bi bi-list text-[#fbc02d]  block text-center text-lg"></i>
        </div>
      </nav>
    </>
  );
}
