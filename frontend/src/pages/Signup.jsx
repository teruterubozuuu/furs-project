import React from 'react'
import { NavLink } from 'react-router-dom'
import "./style.css"

export default function Signup() {
  return (
    <>
      <div className="p-5">
        <NavLink to="/">Logo</NavLink>
      </div>

      <div className="flex justify-center m-10">
        <div className=" border p-8 rounded-lg border-gray-400 md:max-w-[80%] ">
          <span className="block text-center font-semibold text-xl mb-5">Create an account</span>
          <form>
             <label htmlFor="username">Username</label><br/>
            <input type="text" name="username"></input> <br/>
            <label htmlFor="email">Email</label><br/>
            <input type="text" name="email"></input> <br/>
            <label htmlFor="password">Password</label><br/>
            <input type="password" name="password"></input><br/>
            <button className="border border-gray-500 w-full mt-3 p-2 rounded-[10px] ">Sign up</button>
            <NavLink to="/login" className="text-sm block text-center mt-3">Already have an account? Login here</NavLink>
          </form>
        </div>
      </div>
    </>
  )
}
