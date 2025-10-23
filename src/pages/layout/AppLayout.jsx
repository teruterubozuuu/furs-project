import React, { useEffect, useState } from "react";
import Header from "../app/components/Header";
import RightSidebar from "../app/components/RightSideBar";
import LeftSideBar from "../app/components/LeftSideBar";
import BottomNavbar from "../app/components/BottomNavbar";
import { useLocation } from "react-router-dom";
import appBg from "../../assets/app_bg.png"

export default function AppLayout({ children }) {
  const location = useLocation();
  const [loading,setLoading] = useState(true);

 useEffect(() => {
    const timeout = setTimeout(()=>setLoading(false),900)
    return ()=> clearTimeout(timeout);

  },[]);

    if (loading) return null;

  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden justify-center  pt-3 gap-4 bg-[#f5f5f5] bg-cover bg-no-repeat bg-center bg-fixed">

        <aside className="xl:w-[300px] flex-shrink-0 ">
          <LeftSideBar/>
        </aside>
      
        <div className="flex flex-col overflow-y-auto custom-scrollbar ">
          <main className="flex-1 justify-center overflow-y-auto no-scrollbar h-screen font-[Inter] pb-[70px] xl:pb-0 w-[700px]">
            {children}
          </main>
          <BottomNavbar />
        </div>

        <aside className="xl:w-[300px] flex-shrink-0 ">
          <RightSidebar />
        </aside>
   
      </div>
    </div>
  );
}
