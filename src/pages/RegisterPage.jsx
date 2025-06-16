import { NavLink } from "react-router-dom";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/config";

export default function RegisterPage() {
  const navigate = useNavigate();

  const [username,setUsername] = useState('');
  const [email,setEmail] = useState('');
  const [password,setPassword] = useState('');

  const handleSubmit = async (e) =>{
    e.preventDefault();
    try{
      const userCredential = await createUserWithEmailAndPassword(auth,email,password);
      console.log("Signed up successfully", userCredential.user);
      navigate('/login')
    } catch (error){
      console.error("Error creating user:", error);
    }
  };


  return (
   <div className="h-full">
      <div className="flex justify-center items-center my-10">
        <div className="md:w-[400px] border px-8 py-16 rounded-lg border-gray-400">
          <span className="block text-center font-semibold text-xl mb-5">Create an account</span>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <label htmlFor="username">Username</label><br/>
            <input type="text" name="username" id="username" className="border border-gray-500 w-full p-1 focus:outline-none rounded-sm"  value={username} onChange={(e) => setUsername(e.target.value)} required></input> <br/>
            <label htmlFor="email">Email</label><br/>
            <input type="text" name="email" id="email" className="border border-gray-500 w-full p-1 focus:outline-none rounded-sm" value={email} onChange={(e) => setEmail(e.target.value)} required></input> <br/>
            <label htmlFor="password" id="password">Password</label><br/>
            <input type="password" name="password" className="border border-gray-500 w-full p-1" value={password} onChange={(e) => setPassword(e.target.value)} required></input><br/>
            <button className="border border-gray-500 w-full p-2 rounded-sm pointer">Sign up</button>
            <NavLink to="/login" className="text-sm block text-center">Already have an account? Login here</NavLink>
          </form>

        </div>
      </div>
    </div>
  )
}

