import { NavLink } from "react-router-dom";

export default function LoginPage() {
  return (
    <div className="h-full">
      <div className="flex justify-center items-center my-10">
        <div className="md:w-[400px] border px-8 py-16 rounded-lg border-gray-400">
          <span className="block text-center font-semibold text-xl mb-5">Log in to your account</span>
          <form className="space-y-4">
            <label htmlFor="email">Email</label><br/>
            <input type="text" name="email" className="border border-gray-500 w-full p-1 rounded-sm"></input> <br/>
            <label htmlFor="password">Password</label><br/>
            <input type="password" name="password" className="border border-gray-500 w-full p-1 rounded-sm"></input><br/>
            <div className="flex  justify-between">
              <div>
                <input type="checkbox"></input>
                <label>Remember me</label>
              </div>
              <NavLink to="/">Forgot password?</NavLink>
            </div>
            <button className="border border-gray-500 w-full p-2 rounded-[10px] ">Login</button>
            <button className="border border-gray-500 w-full p-2 rounded-[10px] ">Login with Google</button>
            <NavLink to="/signup" className="text-sm block text-center">Don't have an account yet? Sign up here</NavLink>
          </form>
        </div>
      </div>
    </div>
  );
}
