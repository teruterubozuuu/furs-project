import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";

export default function RedirectIfAuthenticated({children}){
    const {user} = useAuth();
    return user ? <Navigate to="/home" replace></Navigate> : children;
}