import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import AddPost from "./AddPost";

export default function TopNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="hidden xl:flex h-auto w-[800px] px-20 justify-around items-center text-center">
      <div className="flex flex-col items-center">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            isActive
              ? "text-xl text-[#fbc02d] px-3 py-2 bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
              : "text-xl text-[#fbc02d] px-3 py-2 hover:bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
          }
        >
          <i className="bi bi-house"></i>
        </NavLink>
        <span className="text-xs text-[#f5f5f5] mt-1">Home</span>
      </div>

      <div className="flex flex-col items-center">
        <NavLink
          to="/heatmap"
          className={({ isActive }) =>
            isActive
              ? "text-xl text-[#fbc02d] px-3 py-2 bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
              : "text-xl text-[#fbc02d] px-3 py-2 hover:bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
          }
        >
          <i className="bi bi-radar"></i>
        </NavLink>
        <span className="text-xs text-[#f5f5f5] mt-1">Heatmap</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          type="button"
          aria-label="Post"
          className="text-xl text-[#fbc02d] px-3 py-2 hover:bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in cursor-pointer"
          onClick={() => setIsOpen(true)}
        >
          <i className="bi bi-plus-square"></i>
        </button>
        <span className="text-xs text-[#f5f5f5] mt-1">Post</span>
      </div>

       <AddPost isOpen = {isOpen} onClose={()=>setIsOpen(false)} />

      <div className="flex flex-col items-center">
        <NavLink
          to="/adoption"
          className={({ isActive }) =>
            isActive
              ? "text-xl text-[#fbc02d] px-3 py-2 bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
              : "text-xl text-[#fbc02d] px-3 py-2 hover:bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
          }
        >
          <i className="bi bi-search-heart"></i>
        </NavLink>
        <span className="text-xs text-[#f5f5f5] mt-1">Adoption</span>
      </div>

      <div className="flex flex-col items-center">
        <NavLink
          to="/organizations"
          className={({ isActive }) =>
            isActive
              ? "text-xl text-[#fbc02d] px-3 py-2 bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
              : "text-xl text-[#fbc02d] px-3 py-2 hover:bg-[rgb(40,112,56)] rounded-[10px] duration-200 ease-in"
          }
        >
          <i className="bi bi-people"></i>
        </NavLink>
        <span className="text-xs text-[#f5f5f5] mt-1">Organizations</span>
      </div>
    </nav>
  );
}
