import React from "react";
import { NavLink } from "react-router-dom";

export default function BottomNavbar() {
  return (
    <>
      <nav className="fixed flex-1 bottom-0 left-0 right-0 bg-white shadow-sm border-t-2 xl:hidden border-gray-200 xl:top-0 flex px-3 py-4 justify-around gap-4">
        <div>
          <NavLink
            to="/home"
            className="text-center text-gray-600 hover:bg-gray-100"
          >
            <i className="bi bi-house text-gray-500 block text-center text-lg"></i>
          </NavLink>
        </div>

        <div>
          <NavLink
            to="/heatmap"
            className="text-center text-gray-600 hover:bg-gray-100"
          >
            <i class="bi bi-radar text-gray-500 block text-center text-lg"></i>
          </NavLink>
        </div>

        <div>
          <NavLink
            to="/post"
            className="text-center  text-gray-600 hover:bg-gray-100"
          >
            <i class="bi bi-plus-square text-gray-500 block text-center text-lg"></i>
          </NavLink>
        </div>

        <div>
          <NavLink
            to="/adoption"
            className="text-center text-gray-600 hover:bg-gray-100"
          >
            <i class="bi bi-search-heart text-gray-500 block text-center text-lg"></i>
          </NavLink>
        </div>

        <div>
          <NavLink
            to="/organizations"
            className="text-center text-gray-600 hover:bg-gray-100"
          >
            <i class="bi bi-people  text-gray-500 block text-center text-lg"></i>
          </NavLink>
        </div>

        <div className="xl:hidden">
          <i class="bi bi-list text-gray-500 block text-center text-lg"></i>
        </div>
      </nav>
    </>
  );
}
