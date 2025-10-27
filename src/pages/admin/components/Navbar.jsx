import React from "react";
import logo from "../../../assets/logo_furs.png";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";

export default function Navbar() {
  const navigate = useNavigate();

  const logOut = () => {
    confirmAlert({
      title: "Confirm Logout",
      message: "Are you sure you want to logout?",
      buttons: [
        {
          label: "Yes",

          onClick: async () => {
            try {
              await signOut(auth);
              navigate("/login");
            } catch (error) {
              console.log(error);
            }
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
    <div className="text-white">
      <div className="flex lg:justify-start justify-center w-full mb-5">
        <img src={logo} alt="FURS Logo" className="lg:w-80 h-auto w-50 px-8" />
      </div>
      <div className=" flex lg:flex-col lg:items-start lg:space-y-6 lg:justify-center justify-between w-full ">
        <NavLink to="/admin/dashboard" className={({isActive}) => `${isActive ? "flex items-center justify-center lg:justify-start gap-3 cursor-pointer px-8 w-full lg:border-l-4  border-amber-400" : "flex items-center justify-center lg:justify-start gap-3 lg:border-l-4 border-transparent cursor-pointer  px-8 w-full"}`}>
          {({isActive}) => (
            <>
              <i className={`${isActive ? "bi bi-columns-gap lg:text-lg text-2xl text-[#fbc02d]" : "bi bi-columns-gap lg:text-lg text-2xl"}`}></i>
              <label className=" cursor-pointer hidden lg:flex">Dashboard</label>
            </>
          )}
        </NavLink>

        <NavLink to="/admin/users" className={({isActive}) => `${isActive ? "flex items-center justify-center lg:justify-start gap-3 cursor-pointer  px-8 w-full lg:border-l-4 border-amber-400" : "flex items-center justify-center lg:justify-start gap-3 lg:border-l-4 border-transparent cursor-pointer  px-8 w-full"}`}>
        {({isActive}) => (
          <>
            <i className={`${isActive ? "bi bi-person lg:text-lg text-2xl text-[#fbc02d]":"bi bi-person lg:text-lg text-2xl"}`}></i>
            <label className="cursor-pointer hidden lg:flex">Users</label>
          </>
        )}
        </NavLink>

        <button onClick={logOut} className="items-center justify-center lg:justify-start flex gap-3 cursor-pointer  px-8 w-full hover:text-[#fbc02d] transition-all ease-in">
          <i className="bi bi-box-arrow-left lg:text-lg text-2xl"></i>
          <label className="cursor-pointer hidden lg:flex">Logout</label>
        </button>
      </div>
    </div>
  );
}
