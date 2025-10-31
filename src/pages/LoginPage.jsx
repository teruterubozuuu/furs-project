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

                <NavLink to="/forgotpassword" className="cursor-pointer text-gray-400 hover:text-gray-600 transition-all ease-in">
                  Forgot password?
                </NavLink>
              </div>

              <button
                className="w-full p-2 rounded-[10px] cursor-pointer text-white font-semibold bg-[#2e7d32] hover:bg-[#1e5720] transition-all ease-in"
                type="submit"
              >
                Log In
              </button>
              
              {/*} TANGGALIN Q MUNA TO KSI ANG SAKIT SA ULO AYUSIN-
              <div className="flex text-gray-300 gap-5 items-center justify-center">
                <hr className="flex-grow"></hr>
                <p className="text-gray-400 text-sm">OR</p>
                <hr className="flex-grow"></hr>
              </div>

              <div className="flex justify-center items-center">
                <button
                  className="rounded-sm font-medium p-2 gap-3 w-full cursor-pointer border border-gray-200 flex items-center justify-center"
                  type="button"
                  onClick={handleLoginWithGoogle}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="#2e7d32"
                    className="bi bi-google"
                    viewBox="0 0 16 16"
                  >
                    <path d="M15.545 6.558a9.4 9.4 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.7 7.7 0 0 1 5.352 2.082l-2.284 2.284A4.35 4.35 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.8 4.8 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.7 3.7 0 0 0 1.599-2.431H8v-3.08z" />
                  </svg>
                  Continue with Google
                </button>
              </div>
              */}

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
