import React from "react";
import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { useNavigate } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import logo from "../../../assets/logo.png";

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
      <header className="bg-[#2e7d32] shadow-md xl:sticky top-0 p-2">
        <div className="flex justify-between xl:justify-center items-center gap-10 text-[#f5f5f5]">
          <img
            src={logo}
            alt="Furs Logo"
            className="w-16 h-auto object-contain"
          />

          <TopNavbar />

          <nav className="flex gap-5 h-auto justify-around items-center text-center text-[#f5f5f5]">
            {/* Logout */}
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={handleLogout}
                aria-label="Logout"
                className="text-xl text-[#fbc02d] px-3 py-2 hover:bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in cursor-pointer"
              >
                <i className="bi bi-box-arrow-right"></i>
              </button>
              <span className="hidden xl:block text-xs mt-1">Logout</span>
            </div>

            {/* Profile */}
            <div className="flex flex-col items-center">
              <NavLink
                to="/profile"
                aria-label="Profile"
                className={({ isActive }) =>
                  isActive
                    ? "text-xl text-[#fbc02d] px-3 py-2 bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
                    : "text-xl text-[#fbc02d] px-3 py-2 hover:bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
                }
              >
                <i className="bi bi-person-circle"></i>
              </NavLink>
              <span className="hidden xl:block text-xs mt-1">Profile</span>
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
