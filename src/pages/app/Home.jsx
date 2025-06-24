import React from "react";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const handleLogout = () => {
    signOut(auth)
      .then(() => {
          console.log('Sign out successful.');
          navigate('/login');
      })
      .catch((error) => {
        console.error('Error signingout',error);
      });
  };

  return (
    <div>
      <h1>Home</h1>
      <button
        className="border border-gray-500 cursor-pointer"
        onClick={handleLogout}
      >
        Logout
      </button>
    </div>
  );
}
