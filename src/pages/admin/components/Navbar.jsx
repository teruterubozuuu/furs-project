import React from "react";
import logo from "../../../assets/logo_furs.png";
import { signOut } from "firebase/auth";
import { auth } from "../../../firebase/config";
import { useNavigate } from "react-router-dom";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();

  const logOut = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.log(error);
    }
  };
  return (
    <div className="text-white">
      <div className="flex lg:justify-start justify-center w-full mb-5">
        <img src={logo} alt="FURS Logo" className="lg:w-80 h-auto w-50" />
      </div>
      <div className=" flex lg:flex-col lg:items-start lg:space-y-6 lg:justify-center justify-between">
        <NavLink to="/admin/dashboard" className="flex gap-3">
          <i className="bi bi-columns-gap lg:text-lg text-2xl"></i>
          <label className="hidden lg:flex">Dashboard</label>
        </NavLink>

        <NavLink to="/admin/users" className="flex gap-3">
          <i className="bi bi-person lg:text-lg text-2xl"></i>
          <label className="hidden lg:flex">Users</label>
        </NavLink>

        <button onClick={logOut} className="flex gap-3 text-white">
          <i className="bi bi-box-arrow-left lg:text-lg text-2xl"></i>
            <label className="hidden lg:flex ">Logout</label>
          </button>
      </div>
    </div>
  );
}
