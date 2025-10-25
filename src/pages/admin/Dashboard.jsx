import React from 'react'
import { signOut } from 'firebase/auth'
import { auth} from '../../firebase/config'
import { useNavigate } from 'react-router-dom';

export default function () {

  const navigate = useNavigate();

  const logOut = async() => {
    try{
      await signOut(auth);
      navigate("/login")
    } catch (error){
      console.log(error);
    }
  };

  return (
    <div>
        <h1>Dashboard</h1>
        <button onClick={logOut}>Logout</button>
    </div>
  )
}
