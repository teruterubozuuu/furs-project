import React from "react";
import { NavLink } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";
import logo from "../../../assets/logo_icon.png";

export default function Header() {

  return (
    <>
      <header className="bg-[#2e7d32] shadow-md xl:sticky top-0 p-2">
        <div className="flex justify-between xl:justify-center items-center gap-10 text-[#f5f5f5]">
          <img
            src={logo}
            alt="Furs Logo"
            className="w-10 h-auto object-contain"
          />

          <TopNavbar />

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
        </div>
      </header>
    </>
  );
}
