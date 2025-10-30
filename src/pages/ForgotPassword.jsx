import React, { useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../firebase/config"; // adjust the path as needed

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!email) {
      setError("Please enter your email.");
      return;
    }

    try {
      await sendPasswordResetEmail(auth, email);
      setMessage("✅ Password reset email sent! Please check your inbox.");
      setEmail("");
    } catch (err) {
      console.error(err);
      if (err.code === "auth/user-not-found") {
        setError("No account found with this email.");
      } else if (err.code === "auth/invalid-email") {
        setError("Invalid email address.");
      } else {
        setError("Failed to send reset email. Please try again later.");
      }
    }
  };

  return (
    <div className="flex justify-center mt-20">
      <div className="md:w-[400px] border relative z-80 px-8 py-16 rounded-lg bg-[#ffffff]/90 border-gray-200 shadow-lg">
        <h1 className="text-xl font-semibold text-[#115315] mb-4">
          Reset Password
        </h1>

        <form onSubmit={handleResetPassword} className="flex flex-col space-y-3">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your registered email"
            className="border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#115315]"
          />

          <button
            type="submit"
            className="bg-[#2e7d32] hover:bg-[#1e5720] cursor-pointer transition-all ease-in text-white py-2 rounded-md"
          >
            Send Reset Link
          </button>
        </form>

        {/* Messages */}
        {message && (
          <p className="text-green-600 text-sm mt-3 text-center">{message}</p>
        )}
        {error && (
          <p className="text-red-600 text-sm mt-3 text-center">{error}</p>
        )}
      </div>
    </div>
  );
}
