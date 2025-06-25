import { useState } from 'react'
import { NavLink } from 'react-router-dom'

export default function LPNavbar() {
    const [isOpen, setIsOpen] = useState(false);

  return (
      <div>
      <div className="flex justify-between p-5">
        <h1>F.U.R.S.</h1>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-5">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact Us</NavLink>
          <NavLink to="/login" className='border border-gray-500 px-10'>Login</NavLink>
        </nav>

        {/* Hamburger Menu Icon */}
        <i class="bi bi-list text-gray-700 text-center text-base flex md:hidden w-5 cursor-pointer"   onClick={() => setIsOpen(true)}></i>
      </div>

      {/* OffCanvas Menu*/}
      <div
        className={`fixed top-0 right-0 w-2/3 h-full bg-gray-200 p-5 flex flex-col text-center gap-4 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button onClick={() => setIsOpen(false)} className="self-end mb-4">✖</button>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact Us</NavLink>
         <NavLink to="/login" className='border border-gray-500'>Login</NavLink>
      </div>
    </div>
  )
}
