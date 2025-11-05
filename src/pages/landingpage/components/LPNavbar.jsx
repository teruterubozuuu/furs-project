import { useState } from "react";
import { NavLink } from "react-router-dom";
import logo from "../../../assets/logo_furs.png";
import { Link } from "react-scroll";



export default function LPNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky z-100 top-0 left-0 w-full bg-[#fafafa]">
      <div className="flex justify-between h-full px-5 py-2 items-center ">
        <NavLink to="/" className="cursor-pointer"><img src={logo} alt="F.U.R.S. Logo" className="w-40"/></NavLink>
        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-5 items-center text-[#2e7d32] font-medium cursor-pointer">
          <Link to="features" className="hover:text-[#1e5720] transition-all ease-in ">Features</Link>
          <Link to="about" className="hover:text-[#1e5720] transition-all ease-in ">About</Link>
          <Link to="contact" className="hover:text-[#1e5720] transition-all ease-in ">Contact</Link>
          <NavLink
            to="/login"
            className="bg-[#2e7d32] hover:bg-[#1e5720] transition-all ease-in text-white py-[4px] px-8 rounded-sm font-semibold"
          >
            Login
          </NavLink>
        </nav>

        {/* Hamburger Menu Icon */}
        <div onClick={() => setIsOpen(true)} className="cursor-pointer border-2 md:hidden p-2 rounded-sm border-[#fbc02d] transition-all duration-300 ease-in-out hover:bg-[#ffe9b0] hover:text-white">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className=" w-5 flex md:hidden cursor-pointer text-[#2e7d32]"
            viewBox="0 0 512 512"
          >
            <path
              fill="#2e7d32"
              d="M226.5 92.9c14.3 42.9-.3 86.2-32.6 96.8s-70.1-15.6-84.4-58.5s.3-86.2 32.6-96.8s70.1 15.6 84.4 58.5zM100.4 198.6c18.9 32.4 14.3 70.1-10.2 84.1s-59.7-.9-78.5-33.3S-2.7 179.3 21.8 165.3s59.7 .9 78.5 33.3zM69.2 401.2C121.6 259.9 214.7 224 256 224s134.4 35.9 186.8 177.2c3.6 9.7 5.2 20.1 5.2 30.5l0 1.6c0 25.8-20.9 46.7-46.7 46.7c-11.5 0-22.9-1.4-34-4.2l-88-22c-15.3-3.8-31.3-3.8-46.6 0l-88 22c-11.1 2.8-22.5 4.2-34 4.2C84.9 480 64 459.1 64 433.3l0-1.6c0-10.4 1.6-20.8 5.2-30.5zM421.8 282.7c-24.5-14-29.1-51.7-10.2-84.1s54-47.3 78.5-33.3s29.1 51.7 10.2 84.1s-54 47.3-78.5 33.3zM310.1 189.7c-32.3-10.6-46.9-53.9-32.6-96.8s52.1-69.1 84.4-58.5s46.9 53.9 32.6 96.8s-52.1 69.1-84.4 58.5z"
            />
          </svg>{" "}
        </div>
      </div>

      {/* OffCanvas Menu */}
      <div
        className={`fixed top-0 right-0 w-2/3 h-full bg-[#fafafa] p-5 flex flex-col text-center gap-4 z-50 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button onClick={() => setIsOpen(false)} className="self-end mb-4 cursor-pointer">
          ✖
        </button>
        <NavLink to="/">Features</NavLink>
        <NavLink to="/about">About</NavLink>
        <NavLink to="/contact">Contact Us</NavLink>
        <NavLink to="/login" className="bg-[#fbc02d] px-10 rounded-sm py-2">
          Login
        </NavLink>
      </div>
    </header>
  );
}
