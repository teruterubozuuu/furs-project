import React from "react";
import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { useNavigate } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import { confirmAlert } from "react-confirm-alert";
import 'react-confirm-alert/src/react-confirm-alert.css';


export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    confirmAlert({
      title: "Confirm Logout",
      message: "Are you sure you want to logout?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            signOut(auth)
              .then(() => {
                console.log("Sign out successful.");
                navigate("/login");
              })
              .catch((error) => {
                console.error("Error signing out", error);
                alert("Logout failed. Please try again.");
              });
          },
        },
        {
          label: "No",
          onClick: () => console.log("Logout cancelled."),
        },
      ],
    });
  };
  
  return (
    <>
      <header className="xl:sticky top-0 p-4 flex justify-between bg-[#2e7d32]">
        <h1 className="w-60 text-xl font-bold text-amber-50">F.U.R.S.</h1>
        <TopNavbar/>
        <div className="flex gap-5 w-60  justify-end">
        <button
          onClick={handleLogout}
        >
         <i className="bi bi-box-arrow-right text-xl text-[#fbc02d] cursor-pointer"></i>
        </button>
          <NavLink
            to="/profile"
          >
            <i className="bi bi-person-circle text-[#fbc02d] text-xl cursor-pointer"></i>
          </NavLink>
        </div>
      </header>
    </>
  );
}
