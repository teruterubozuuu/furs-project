import { useState } from "react";
import { NavLink } from "react-router-dom";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between p-5">
        <h1>Logo</h1>

        {/*Deskptop Menu*/}
        <nav className="hidden md:flex gap-5">
          <NavLink to="/">Home</NavLink>
          <NavLink to="/">About</NavLink>
          <NavLink to="/">Contact Us</NavLink>
          <NavLink to="/login" >Login</NavLink>
        </nav>

        {/*Hamburger Menu for screens with width >=768px */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 448 512"
          onClick={() => setIsOpen(!isOpen)}
          className="flex md:hidden w-5"
        >
          <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z" />
        </svg>
      </div>

      {/*OffCanvas Menu*/}
      <div
        className={` w-2/3 h-full text-center flex flex-col fixed right-0 top-0 bg-gray-200 p-5 gap-5 z-50 md:hidden  transform transition-transform duration-300 ease-in-out  ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button className="border" onClick={() => setIsOpen(false)}>
          Close
        </button>
        <NavLink to="/">Home</NavLink>
        <NavLink to="/">About</NavLink>
        <NavLink to="/">Contact Us</NavLink>
        <NavLink to="/login" className="border">Login</NavLink>
      </div>
    </div>
  );
}
