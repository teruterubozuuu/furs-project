import { NavLink, useNavigate } from "react-router-dom";
import { auth } from "../firebase/config.js"; 
import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  signOut, 
  sendEmailVerification 
} from "firebase/auth";
import { useState } from "react";
import { useAuth } from "../context/AuthContext.jsx"; 

export default function LoginPage() {
  const {user} = useAuth(); 
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [failedLogin, setFailedLogin] = useState(false);
  const navigate = useNavigate();

  // 3. Email/Password Submission Handler
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setFailedLogin(false);
    
    try {
      await setPersistence(
        auth,
        isChecked ? browserLocalPersistence : browserSessionPersistence
      );
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      const loggedInUser = userCredential.user;


      if (!loggedInUser.emailVerified) {
        await sendEmailVerification(loggedInUser);
        setEmail("");
        setPassword("");
        return; 
      }


      console.log("Logged in successfully", loggedInUser);
      navigate("/home"); 
      
    } catch (error) {
      console.error("Error logging in:", error);
      setFailedLogin(true);
    } finally {
      setLoading(false);
    }
  };


  if (user && !user.emailVerified) {
      return (
        <main className="h-screen bg-[url(/src/assets/app_bg2.png)] bg-cover bg-center flex xl:pt-20 pt-10 justify-center">
          <section>
            <div className="md:w-[400px] border relative z-80 px-8 py-16 rounded-lg bg-[#ffffff]/90 border-gray-200 shadow-lg text-center">
              <h1 className="block font-bold text-2xl mb-4 text-[#2e7d32]">
                Verification Required
              </h1>
              <p className="text-red-700 border border-red-300 bg-red-100 p-4 rounded-md">
                Your account is currently signed in but requires email verification. 
                A link has been sent to your email. Please click the link to proceed.
              </p>
              <button
                onClick={() => signOut(auth)}
                className="mt-6 p-2 rounded-[10px] cursor-pointer text-white font-semibold bg-gray-500 hover:bg-gray-700 transition-all ease-in"
              >
                Back to Login
              </button>
            </div>
          </section>
        </main>
      );
  }


  if (loading) {
     return (
        <main className="h-screen bg-[url(/src/assets/app_bg2.png)] bg-cover bg-center flex xl:pt-20 pt-10 justify-center">
          <section>
            <div className="md:w-[400px] border relative z-80 px-8 py-16 rounded-lg bg-[#ffffff]/90 border-gray-200 shadow-lg text-center">
              <h1 className="block font-bold text-2xl mb-4 text-[#2e7d32]">
                Processing Login...
              </h1>
              <p className="text-gray-600">
                Please wait while we finalize your sign-in.
              </p>
            </div>
          </section>
        </main>
      );
  }


  return (
    <>
      <main className="h-screen bg-[url(/src/assets/app_bg2.png)] bg-cover bg-center flex xl:pt-20 pt-10 justify-center">
        <section>
          <div className="md:w-[400px] border relative z-80 px-8 py-16 rounded-lg bg-[#ffffff]/90 border-gray-200 shadow-lg">
            <h1 className="block text-center font-bold text-2xl mb-5 text-[#2e7d32]">
              Log in to your account
            </h1>
            
            <form className="space-y-5 text-gray-700" onSubmit={handleSubmit}>
              {failedLogin ? (
                <p className="text-sm text-red-700 border border-red-300 w-full rounded-sm bg-red-100 p-2">
                  Incorrect email or password.
                </p>
              ) : null}
              
              <div>
                <label htmlFor="email">Email</label>
                <br />
                <input
                  type="email"
                  name="email"
                  id="email"
                  className="border border-gray-200 rounded-sm w-full p-1 focus:outline-none focus:border-[#2e7d32]"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                ></input>
              </div>

              <div>
                <label htmlFor="password">Password</label>
                <br />
                <input
                  type="password"
                  name="password"
                  id="password"
                  className="border border-gray-200 rounded-sm w-full p-1 focus:outline-none focus:border-[#2e7d32]"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                ></input>
              </div>

              <div className="flex  justify-between">
                <div>
                  <input
                    type="checkbox"
                    id="checkbox"
                    checked={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="cursor-pointer accent-[#2e7d32] w-3 h-3 rounded-sm border-gray-400 checked:bg-[#2e7d32] checked:border-[#2e7d32] focus:ring-[#2e7d32] transition-all"
                  ></input>
                  <label htmlFor="checkbox" className={isChecked ? "cursor-pointer text-gray-600 transition-all ease-in " : "cursor-pointer text-gray-400 hover:text-gray-600 transition-all ease-in"}>
                    {" "}
                    Remember me
                  </label>
                </div>

                <NavLink to="/forgotpassword" className="cursor-pointer text-gray-400 hover:text-[#2e7d32] transition-all ease-in">
                  Forgot password?
                </NavLink>
              </div>

              <button
                className="w-full p-2 rounded-[10px] cursor-pointer text-white font-semibold bg-[#2e7d32] hover:bg-[#1e5720] transition-all ease-in disabled:opacity-50"
                type="submit"
                disabled={loading}
              >
                {loading ? 'Logging In...' : 'Log In'}
              </button>

              <div className="text-sm block text-center cursor-pointer font-medium">
                <span className="font-normal text-gray-500">
                  Don't have an account yet?
                </span>{" "}
                <span className="font-bold underline">
                  <NavLink
                    to="/signup"
                    className="hover:text-[#2e7d32] transition-all ease-in"
                  >
                    Sign up here
                  </NavLink>
                </span>
              </div>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}