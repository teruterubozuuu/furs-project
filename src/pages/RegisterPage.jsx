import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";
import { db } from "../firebase/config";
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
      });

      console.log("Signed up successfully", userCredential.user);
      navigate("/login");
    } catch (error) {
      console.error("Error creating user:", error);
    }
  };

  return (
    <main className="h-full">
      <section className="flex justify-center items-center my-10">
        <div className="md:w-[400px] border px-8 py-16 rounded-lg border-gray-400">
          <h1 className="block text-center font-semibold text-xl mb-5">
            Create an account
          </h1>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="username">Username</label>
              <br />
              <input
                type="text"
                name="username"
                id="username"
                className="border border-gray-500 w-full p-1 focus:outline-none rounded-sm"
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
                className="border border-gray-500 w-full p-1 focus:outline-none rounded-sm"
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
                className="border border-gray-500 w-full p-1 rounded-sm focus:outline-none"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              ></input>
            </div>

            <button className="border border-gray-500 w-full p-2 rounded-sm cursor-pointer">
              Sign up
            </button>

            <NavLink to="/login" className="text-sm block text-center cursor-pointer">
              Already have an account? Login here
            </NavLink>
          </form>
        </div>
      </section>
    </main>
  );
}
