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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          onClick={() => setIsOpen(true)}
          className="flex md:hidden w-5 cursor-pointer"
        >
          <path d="M0 96C0 78.3 14.3 64 32 64h384c17.7 0 32 14.3 32 32s-14.3 32-32 32H32C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32h384c17.7 0 32 14.3 32 32s-14.3 32-32 32H32c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32H32c-17.7 0-32-14.3-32-32s14.3-32 32-32h384c17.7 0 32 14.3 32 32z" />
        </svg>
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
