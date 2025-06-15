import React from "react";
import { NavLink } from "react-router-dom";
import "../pages/style.css"

export default function Login() {
  return (
    <>
      <div className="p-5">
        <NavLink to="/">Logo</NavLink>
      </div>

      <div className="flex justify-center m-10">
        <div className="md:max-w-[80%] border p-8 rounded-lg border-gray-400">
          <span className="block text-center font-semibold text-xl mb-5">Log in to your account</span>
          <form>
            <label htmlFor="email">Email</label><br/>
            <input type="text" name="email"></input> <br/>
            <label htmlFor="password">Password</label><br/>
            <input type="password" name="password"></input><br/>
            <div className="flex gap-5">
              <div>
                <input type="checkbox"></input>
                <label>Remember me</label>
              </div>
              <NavLink to="/">Forgot password?</NavLink>
            </div>
            <button className="border border-gray-500 w-full mt-3 p-2 rounded-[10px] ">Login</button>
            <button className="border border-gray-500 w-full mt-3 p-2 rounded-[10px] ">Login with Google</button>
            <NavLink to="/signup" className="text-sm block text-center mt-3">Don't have an account yet? Sign up here</NavLink>
          </form>
        </div>
      </div>
    </>
  );
}
