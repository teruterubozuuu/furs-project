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
} from "firebase/auth";
import { useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const provider = new GoogleAuthProvider();

  const handleSubmit = async (e) => {
    e.preventDefault();
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
      console.log("Logged in successfully", user);
      navigate("/");
    } catch (error) {
      console.error("Error logging in:", error);
      alert("Login failed. Please check your credentials.");
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
    <main className="h-full">
      <section className="flex justify-center items-center my-10">
        <div className="md:w-[400px] border px-8 py-16 rounded-lg border-gray-400">
          <h1 className="block text-center font-semibold text-xl mb-5">
            Log in to your account
          </h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email">Email</label>
              <br />
              <input
                type="text"
                name="email"
                id="email"
                className="border border-gray-500 w-full p-1 rounded-sm"
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
                className="border border-gray-500 w-full p-1 rounded-sm"
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
                <label htmlFor="checkbox">Remember me</label>
              </div>

              <NavLink to="/" className="cursor-pointer">
                Forgot password?
              </NavLink>
            </div>

            <button
              className="border border-gray-500 w-full p-2 rounded-[10px] cursor-pointer"
              type="submit"
            >
              Login
            </button>

            <button
              className="border border-gray-500 w-full p-2 rounded-[10px] cursor-pointer"
              type="button"
              onClick={handleLoginWithGoogle}
            >
              Login with Google
            </button>

            <NavLink
              to="/signup"
              className="text-sm block text-center cursor-pointer"
            >
              Don't have an account yet? Sign up here
            </NavLink>
          </form>
        </div>
      </section>
    </main>
  );
}
