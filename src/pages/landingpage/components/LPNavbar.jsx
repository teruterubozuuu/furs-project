import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../../assets/logo_furs.png";
import { Link } from "react-scroll";



export default function LPNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky z-100 top-0 left-0 w-full bg-[#fafafa] border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center h-full  py-2 px-5">
        
        <NavLink to="/" className="cursor-pointer">
            <img src={logo} alt="F.U.R.S. Logo" className="w-40"/>
        </NavLink>
        
        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-5 items-center text-[#2e7d32] font-medium cursor-pointer">
          <Link to="features" smooth={true} duration={500} className="hover:text-[#1e5720] transition-all ease-in ">Features</Link>
          <Link to="about" smooth={true} duration={500} className="hover:text-[#1e5720] transition-all ease-in ">About</Link>
          <Link to="contact" smooth={true} duration={500} className="hover:text-[#1e5720] transition-all ease-in ">Contact</Link>
          <NavLink
            to="/login"
            className="bg-[#2e7d32] hover:bg-[#1e5720] transition-all ease-in text-white py-[4px] px-8 rounded-sm font-semibold"
          >
            Login
          </NavLink>
        </nav>

        {/* Hamburger Menu Icon */}
        <div onClick={() => setIsOpen(true)} className="cursor-pointer md:hidden">
          <i className="bi bi-list text-2xl text-[#2e7d32]"></i>
        </div>
      </div>


{isOpen && (
    <div
      className="fixed top-0 left-0 w-full h-full bg-black opacity-50 z-40"
      onClick={() => setIsOpen(false)}
    ></div>
  )}


  <div
    className={`fixed top-0 right-0 w-2/3 text-[#2e7d32] h-full bg-[#fafafa] p-5 flex flex-col text-center gap-4 z-50 transform transition-transform duration-300 ease-in-out ${
      isOpen ? "translate-x-0" : "translate-x-full"
    }`}
  >
    <button onClick={() => setIsOpen(false)} className="self-end mb-4 cursor-pointer text-xl">
      &times; 
    </button>
    <NavLink to="/">Home</NavLink>
    <Link to="features" smooth={true} duration={500} onClick={() => setIsOpen(false)}>Features</Link>
    <Link to="about" smooth={true} duration={500} onClick={() => setIsOpen(false)}>About</Link>
    <Link to="contact" smooth={true} duration={500} onClick={() => setIsOpen(false)}>Contact Us</Link>
    <NavLink to="/login" className="bg-[#2e7d32] text-white px-10 rounded-sm py-2">
      Login
    </NavLink>
  </div>
    </header>
  );
}