import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
import { auth, db } from "../firebase/config";
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failedRegister, setFailedRegister] = useState(false);
  const [passwordValidate, setPasswordValidate] = useState(false);
  const [passwordErrorText, setPasswordErrorText] = useState("");

  const PASSWORD_REMINDER =
    "Password must be at least 6 characters long and include uppercase, lowercase, number, and special character.";

  const validatePassword = (password) => {
    const minLength = 6;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
const hasSpecialChar = /[!@#$%^&*()_\-+=<>?{}[\]~]/.test(password);

    const isValid =
      password.length >= minLength &&
      hasUppercase &&
      hasLowercase &&
      hasNumber &&
      hasSpecialChar;

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();


    if (!validatePassword(password)) {
      setPasswordValidate(true);
      setPasswordErrorText(PASSWORD_REMINDER);
      return;
    } else {
      setPasswordValidate(false);
      setPasswordErrorText("");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        username: username,
        email: email,
        userType: "Community Volunteer",
        profilePhoto: "",
        description: "Add a description...",
        totalRatingSum: 0,
        totalRatingCount: 0,
      });

      await signOut(auth);
      console.log("User created and email verification sent:", user);
      navigate("/login");
    } catch (error) {
      console.error("Error creating user:", error);
      setFailedRegister(true);
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
  };

  return (
    <>
      <main className="h-screen bg-[url(/src/assets/app_bg2.png)] bg-cover bg-center flex xl:pt-20 pt-10 justify-center">
        <section>
          <div className="md:w-[400px] border relative z-80 px-8 py-16 rounded-lg bg-[#ffffff]/90 border-gray-200 shadow-lg">
            <h1 className="block text-center font-bold text-2xl mb-5 text-[#2e7d32]">
              Create an account
            </h1>

            <form className="space-y-5 text-gray-700" onSubmit={handleSubmit}>
              {failedRegister ? (
                <p className="text-sm w-full rounded-sm text-red-700 border border-red-300 bg-red-100 p-2">
                  Email is already in use.
                </p>
              ) : null}

              {passwordValidate ? (
                <p className="text-sm w-full rounded-sm text-red-700 border border-red-300 bg-red-100 p-2">
                  {passwordErrorText}
                </p>
              ) : null}


              <div>
                <label htmlFor="username">Username</label>
                <br />
                <input
                  type="text"
                  name="username"
                  id="username"
                  className="border border-gray-200 rounded-sm w-full p-1 focus:outline-none"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

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
                />
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
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <button
                className="text-white bg-[#2e7d32] font-medium w-full p-2 rounded-sm cursor-pointer hover:bg-[#1e5720] transition-all ease-in"
                type="submit"
              >
                Sign up
              </button>


              <div className="text-sm block text-center cursor-pointer font-medium">
                <span className="font-normal text-gray-500">
                  Already have an account?{" "}
                </span>
                <span className="font-bold underline">
                  <NavLink
                    to="/login"
                    className="hover:text-[#2e7d32] transition-all ease-in"
                  >
                    Login here
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
