import React from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  return (
    <>
      <header className="border-b-2 border-gray-200 shadow-sm p-4 flex justify-between items-center">
        <h1>F.U.R.S.</h1>
        <i class="bi bi-gear text-gray-500 text-base xl:hidden "></i>
      </header>

      <nav className="fixed text-[12px] bottom-0 left-0 right-0 bg-white border-t-2 border-gray-200 shadow-md xl:hidden flex px-3 py-4 justify-around gap-4">
        <div>
          <i className="bi bi-house text-gray-500 block text-center text-base"></i>
          <NavLink
          to="/home"
          className="text-center text-gray-600 hover:bg-gray-100"
        >
          Home
        </NavLink>
        </div>
        
        <div>
          <i class="bi bi-radar text-gray-500 block text-center text-base"></i>
          <NavLink
            to="/heatmap"
            className="text-center text-gray-600 hover:bg-gray-100"
          >
          Heatmap
        </NavLink>
        </div>

        <div>
          <i class="bi bi-plus-square text-gray-500 block text-center text-base"></i>
          <NavLink
            to="/post"
            className="text-center  text-gray-600 hover:bg-gray-100"
          >
            Post
          </NavLink>
        </div>

        <div>
          <i class="bi bi-search-heart text-gray-500 block text-center text-base"></i>
          <NavLink
            to="/adoption"
            className="text-center text-gray-600 hover:bg-gray-100"
          >
            Adoption
          </NavLink>
        </div>
        
        <div>
          <i class="bi bi-person-circle text-gray-500 block text-center text-base"></i>
          <NavLink
            to="/profile"
            className="text-center text-gray-600 hover:bg-gray-100"
          >
            Profile
          </NavLink>
        </div>

      </nav>
    </>
  );
}
