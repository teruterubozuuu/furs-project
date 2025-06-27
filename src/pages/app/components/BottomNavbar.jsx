import React from "react";
import { NavLink } from "react-router-dom";

export default function BottomNavbar() {
  return (
    <>
      <nav className="fixed flex-1 bottom-0 left-0 right-0 bg-[#2e7d32]  xl:hidden xl:top-0 flex px-3 py-4 justify-around gap-4">
        <div>
          <NavLink
            to="/home"
          >
            <i className="bi bi-house text-[#fbc02d]  block text-center text-lg"></i>
          </NavLink>
        </div>

        <div>
          <NavLink
            to="/heatmap"
          >
            <i class="bi bi-radar text-[#fbc02d] block text-center text-lg"></i>
          </NavLink>
        </div>

        <div>
          <NavLink
            to="/post"
          >
            <i class="bi bi-plus-square text-[#fbc02d] block text-center text-lg"></i>
          </NavLink>
        </div>

        <div>
          <NavLink
            to="/adoption"
          >
            <i class="bi bi-search-heart text-[#fbc02d]  block text-center text-lg"></i>
          </NavLink>
        </div>

        <div>
          <NavLink
            to="/organizations"
          >
            <i class="bi bi-people  text-[#fbc02d]  block text-center text-lg"></i>
          </NavLink>
        </div>

        <div className="xl:hidden">
          <i class="bi bi-list text-[#fbc02d]  block text-center text-lg"></i>
        </div>
      </nav>
    </>
  );
}
