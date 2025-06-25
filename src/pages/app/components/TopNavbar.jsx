import React from 'react'
import { NavLink } from 'react-router-dom'

export default function TopNavbar() {
  return (
    <nav className="hidden xl:flex flex-1 justify-around">
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
  )
}
