import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  GoogleAuthProvider, signInWithRedirect, getRedirectResult,
  signOut,
} from "firebase/auth";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const {user} = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verifyError, setVerifyError] = useState(false);
  const [failedLogin, setFailedLogin] = useState(false);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();


  useEffect(() => {
  if (user) {
    
    navigate("/home");
  }
}, [user, navigate]);

useEffect(() => {
  console.log("Auth state changed:", user);
}, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
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
      const user = userCredential.user;

      if (!user.emailVerified) {
        await signOut(auth);
        setVerifyError(true);
        return;
      }

      console.log("Logged in successfully", user);
    } catch (error) {
      console.error("Error logging in:", error);
      setFailedLogin(true);
      console.log("Login failed." , error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    
      <main className="h-screen bg-[url(/src/assets/app_bg2.png)] bg-cover bg-center flex xl:pt-20 pt-10 justify-center">
        <section>
          <div className="md:w-[400px] border relative z-80 px-8 py-16 rounded-lg bg-[#ffffff]/90 border-gray-200 shadow-lg">
            <h1 className="block text-center font-bold text-2xl mb-5 text-[#2e7d32]">
              Log in to your account
            </h1>

            <form className="space-y-5 text-gray-700" onSubmit={handleSubmit}>
              {verifyError ? <p className="text-red-white text-sm w-full rounded-sm text-red-700 border border-red-300 bg-red-100 p-2">Please 
                verify 
                your email before logging in.</p> : null || failedLogin ? <p className="text-red-white text-sm text-red-700 border border-red-300 w-full rounded-sm bg-red-100 p-2">Incorrect email or password.</p> : null}
              
              <div>
                <label htmlFor="email">Email</label>
                <br />
                <input
                  type="text"
                  name="email"
                  id="email"
                  className="border border-gray-200 rounded-sm w-full p-1 focus:outline-none"
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
                  className="border border-gray-200 rounded-sm w-full p-1 focus:outline-none"
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
                    value={isChecked}
                    onChange={(e) => setIsChecked(e.target.checked)}
                    className="cursor-pointer accent-yellow-400 appearance-none border w-3 h-3 rounded-sm border-gray-400 checked:bg-yellow-400 checked:border-yellow-400 transition-all"
                  ></input>
                  <label htmlFor="checkbox" className={isChecked ? "cursor-pointer text-gray-600 transition-all ease-in " : "cursor-pointer text-gray-400 hover:text-gray-600 transition-all ease-in"}>
                    {" "}
                    Remember me
                  </label>
                </div>

                <NavLink to="/" className="cursor-pointer text-gray-400 hover:text-gray-600 transition-all ease-in">
                  Forgot password?
                </NavLink>
              </div>

              <button
                className="w-full p-2 rounded-[10px] cursor-pointer text-white font-semibold bg-[#2e7d32] hover:bg-[#1e5720] transition-all ease-in"
                type="submit"
              >
                Log In
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
