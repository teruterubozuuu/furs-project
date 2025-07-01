import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import logo from '../../../assets/logo.png'

export default function LPNavbar() {
    const [isOpen, setIsOpen] = useState(false);

  return (
      <header className='bg-[#2e7d32]'>
      <div className="flex justify-between h-full px-5 py-2 items-center">
        <img src={logo} alt="F.U.R.S. Logo" className='w-15' />

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-5 items-center text-[#f5f5f5f5]">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/about">About</NavLink>
          <NavLink to="/contact">Contact Us</NavLink>
          <NavLink to="/login" className='bg-[#fbc02d] text-[#212121] py-[4px] px-8 rounded-sm font-semibold'>Login</NavLink>
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
         <NavLink to="/login" className='bg-[#fbc02d] px-10'>Login</NavLink>
      </div>
    </header>
  )
}
