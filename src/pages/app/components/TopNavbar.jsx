import React from 'react'
import { NavLink } from 'react-router-dom'

export default function TopNavbar() {
  return (
    <nav className="hidden xl:flex flex-1 justify-around">
        <div>
          <NavLink
            to="/home"
          >
            <i className="bi bi-house block text-center text-lg text-[#fbc02d]"></i>
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
            <i class="bi bi-search-heart text-[#fbc02d] block text-center text-lg"></i>
          </NavLink>
        </div>

        <div>
          <NavLink
            to="/organizations"
          >
            <i class="bi bi-people  text-[#fbc02d] block text-center text-lg"></i>
          </NavLink>
        </div>

        <div className="xl:hidden">
          <i class="bi bi-list text-[#fbc02d] block text-center text-lg"></i>
        </div>
      </nav>
  )
}
