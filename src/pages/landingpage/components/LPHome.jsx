import React from "react";
import { NavLink } from "react-router-dom";
import landingPageImage from "../../../assets/landing2.png";

export default function LPHome() {
  return (
    <main className="h-full flex flex-col justify-center items-center xl:flex-row bg-[#FFF6DF] overflow-hidden py-10">
      
      {/* Text Section */}
      <div className="flex flex-col justify-center items-center md:items-start text-center md:text-start space-y-6 px-10 xl:px-20 xl:w-[40%] p-10">
        <h1 className="xl:text-7xl text-4xl font-bold text-[#2e7d32]">
          Find, Unite, and Rescue Strays
        </h1>
        <p className="xl:text-xl text-[#656565]">
          F.U.R.S. is a community-driven platform to report stray and lost animal sightings, and to help rescuers identify areas with significant stray animal density.
        </p>
        <p className="xl:text-xl text-[#656565]">Join our community now!</p>
        <NavLink
          to="/signup"
          className="bg-[#2e7d32] text-white py-2 px-6 rounded-sm font-semibold"
        >
          Sign up
        </NavLink>
      </div>

      {/* Image Section */}
      <div className="xl:w-[60%] w-full flex items-center">
        <img
          src={landingPageImage}
          alt="F.U.R.S. Logo"
          className="object-cover w-full"
        />
      </div>
    </main>
  );
}
