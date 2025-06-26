import React from "react";
import { NavLink } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { useNavigate } from "react-router-dom";
import TopNavbar from "../components/TopNavbar";

export default function Header() {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
        console.log("Sign out successful.");
        navigate("/login");
      })
      .catch((error) => {
        console.error("Error signingout", error);
      });
  };
  return (
    <>
      <header className="xl:sticky bg-white top-0 border-b-1 border-gray-200 p-4 flex justify-between">
        <h1 className="w-60">F.U.R.S.</h1>
        <TopNavbar/>
        <div className="flex gap-5 w-60  justify-end">
        <button
          className="border border-gray-500 cursor-pointer"
          onClick={handleLogout}
        >
          Logout
        </button>
          <NavLink
            to="/profile"
            className="text-center text-gray-600 hover:bg-gray-100"
          >
            <i class="bi bi-person-circle text-gray-500 block text-center text-xl cursor-pointer"></i>
          </NavLink>
        </div>
      </header>
    </>
  );
}
