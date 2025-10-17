import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        userType: "Community Volunteer",

        // 🚨 NEW FIELDS: PROFILE INITIALIZATION
        profilePhoto: "", // Start with an empty string; the defaultImg will be used by Profile.jsx if this is empty
        description: "Add a description...",

        // 🚨 NEW FIELDS: RATING SYSTEM INITIALIZATION
        totalRatingSum: 0,
        totalRatingCount: 0,
      });

      console.log("Signed up successfully", userCredential.user);
      navigate("/login");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <>
      <main className="h-screen bg-[url(/src/assets/app_bg2.png)] bg-cover bg-center flex xl:pt-20 pt-10 justify-center">
        <section>
          <div className="md:w-[400px] border relative z-80 px-8 py-16 rounded-lg bg-[#ffffff]/90 border-gray-300 shadow-xl">
            <h1 className="block text-center font-bold text-2xl mb-5 text-[#2e7d32]">
              Create an account
            </h1>

            <form className="space-y-5 text-gray-700" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="username">Username</label>
                <br />
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="border-b border-gray-400 w-full p-1 focus:outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                ></input>
              </div>

              <div>
                <label htmlFor="email">Email</label>
                <br />
                <input
                  type="text"
                  name="email"
                  id="email"
                  className="border-b border-gray-400 w-full p-1 focus:outline-none"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                ></input>
              </div>

              <div>
                <label htmlFor="password" id="password">
                  Password
                </label>
                <br />
                <input
                  type="password"
                  name="password"
                  className="border-b border-gray-400 w-full p-1 focus:outline-none"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                ></input>
              </div>

              <button className="text-[#212121]  bg-[#fbc02d] font-medium w-full p-2 rounded-sm cursor-pointer">
                Sign up
              </button>

              <NavLink
                to="/login"
                className="text-sm block text-center cursor-pointer"
              >
                Already have an account? Login here
              </NavLink>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
