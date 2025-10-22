import { NavLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase/config";
import {
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut, 
} from "firebase/auth";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState("");
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

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

      if(!user.emailVerified){
        await signOut(auth);
        setError("Please verify your email before logging in.");
        return;
      }
    
      console.log("Logged in successfully", user);
      navigate("/");
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Login failed. Please check your credentials.");
    } finally{
      setLoading(false);
    }
  };

  const handleLoginWithGoogle = async () => {
    try {
      await setPersistence(
        auth,
        isChecked ? browserLocalPersistence : browserSessionPersistence
      );
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Logged in with Google successfully", user);
      navigate("/");
    } catch (error) {
      console.error("Error logging in with Google:", error);
      alert("Google login failed. Please try again.");
    }
  };

  return (
    <>
   <main className="h-screen bg-[url(/src/assets/app_bg2.png)] bg-cover bg-center flex xl:pt-20 pt-10 justify-center">
    <section>
    <div className="md:w-[400px] border relative z-80 px-8 py-16 rounded-lg bg-[#ffffff]/90 border-gray-300 shadow-xl">
          <h1 className="block text-center font-bold text-2xl mb-5 text-[#2e7d32]">
            Log in to your account
          </h1>

          <form className="space-y-5 text-gray-700" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Email</label>
              <br />
              <input
                type="text"
                name="email"
                id="email"
                className="border-b border-gray-400 w-full p-1"
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
                className="border-b border-gray-400 w-full p-1"
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
                ></input>
                <label htmlFor="checkbox"> Remember me</label>
              </div>

              <NavLink to="/" className="cursor-pointer">
                Forgot password?
              </NavLink>
            </div>

            {<p className="text-red-400 italic font-light text-center">{error}</p>}

            <button
              className="w-full p-2 rounded-[10px] cursor-pointer text-[#212121] font-semibold bg-[#fbc02d]"
              type="submit"
            >
              Login
            </button>

            <NavLink
              to="/signup"
              className="text-sm block text-center cursor-pointer font-medium"
            >
              Don't have an account yet? Sign up here
            </NavLink>

            <div className="flex text-gray-400 gap-5 items-center justify-center my-4">
              <hr className="flex-grow"></hr>
              <p className="text-gray-500">or Login with</p>
              <hr className="flex-grow"></hr>
            </div>

            <div className="flex justify-center items-center">
              <button
                className="rounded-[10px] cursor-pointer"
                type="button"
                onClick={handleLoginWithGoogle}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  x="0px"
                  y="0px"
                  width="48"
                  height="48"
                  viewBox="0 0 48 48"
                >
                  <path
                    fill="#FFC107"
                    d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12c0-6.627,5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24c0,11.045,8.955,20,20,20c11.045,0,20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                  <path
                    fill="#FF3D00"
                    d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
                  ></path>
                  <path
                    fill="#4CAF50"
                    d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"
                  ></path>
                  <path
                    fill="#1976D2"
                    d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571c0.001-0.001,0.002-0.001,0.003-0.002l6.19,5.238C36.971,39.205,44,34,44,24C44,22.659,43.862,21.35,43.611,20.083z"
                  ></path>
                </svg>
              </button>
            </div>
          </form>
        </div>
        </section>
    </main>
    </>
  );
}
