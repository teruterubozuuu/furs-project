import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut,
} from "firebase/auth";
// CRITICAL FIX: Reverting to explicit .js extension to satisfy module resolution
import { auth, db } from "../firebase/config.js"; 
import { doc, setDoc } from "firebase/firestore";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [failedRegister, setFailedRegister] = useState(false);
  const [passwordValidate, setPasswordValidate] = useState(false);
  const [passwordErrorText, setPasswordErrorText] = useState("");
  const [success, setSuccess] = useState(false);
    const [loading, setLoading] = useState(false);

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
    setLoading(true);

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


      const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
      const userDocRef = doc(db, 'artifacts', appId, 'users', user.uid, 'user_data', 'profile');

      await setDoc(userDocRef, {
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
      
      setSuccess(true);
      
    } catch (error) {
      console.error("Error creating user:", error);

      setFailedRegister(true);
    } finally{
          setLoading(false);
    }
  };

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);

    if (newPassword.length > 0 && !validatePassword(newPassword)) {
        setPasswordValidate(true);
        setPasswordErrorText(PASSWORD_REMINDER);
    } else {
        setPasswordValidate(false);
        setPasswordErrorText("");
    }
  };


  if (success) {
    return (
      <main className="h-screen bg-[url(/src/assets/app_bg2.png)] bg-cover bg-center flex xl:pt-20 pt-10 justify-center">
        <section>
          <div className="md:w-[450px] border relative z-80 px-8 py-16 rounded-lg bg-[#ffffff]/90 border-gray-200 shadow-lg text-center">
            <h1 className="block font-bold text-3xl mb-4 text-green-600">
              Registration Successful!
            </h1>
            <p className="text-lg text-gray-700 mb-6">
              <b>Please check your email</b> for a verification link to activate your account.
            </p>
            <p className="text-sm text-gray-500 border border-gray-300 bg-gray-100 p-3 rounded-md">
              <b>Didn't receive it?</b> Please check your spam/junk folder. Once verified, you can log in below.
            </p>
            <button
              onClick={() => navigate("/login")}
              className="mt-6 p-3 rounded-[10px] cursor-pointer text-white font-semibold bg-[#2e7d32] hover:bg-[#1e5720] transition-all ease-in"
            >
              Go to Login Page
            </button>
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
              Create an account
            </h1>

            <form className="space-y-5 text-gray-700" onSubmit={handleSubmit}>
              {failedRegister ? (
                <p className="text-sm w-full rounded-sm text-red-700 border border-red-300 bg-red-100 p-2">
                  Email is already in use or registration failed.
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
                  className="border border-gray-200 rounded-sm w-full p-1 focus:outline-none focus:border-[#2e7d32]"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

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
                />
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
                  onChange={handlePasswordChange}
                  required
                />
              </div>

              <button
                className="text-white bg-[#2e7d32] font-medium w-full p-2 rounded-sm cursor-pointer hover:bg-[#1e5720] transition-all ease-in"
                type="submit"
                disabled={loading}
              >
               {loading ? 'Signing up...' : 'Sign up'}
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