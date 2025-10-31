import React, { useEffect, useState } from "react";
import Header from "../app/components/Header";
import RightSidebar from "../app/components/RightSideBar";
import LeftSideBar from "../app/components/LeftSideBar";
import BottomNavbar from "../app/components/BottomNavbar";
import { useLocation } from "react-router-dom";

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
      <div className="flex flex-1 overflow-hidden justify-center  py-3 gap-3 bg-[url('/app_bg.png')] bg-cover bg-no-repeat bg-center bg-fixed">

        <aside className="xl:w-[300px] flex-shrink-0 ">
          <LeftSideBar/>
        </aside>
      
        <div className="flex flex-col overflow-y-auto custom-scrollbar ">
          <main className="flex-1 justify-center overflow-y-auto no-scrollbar h-screen font-[Inter] pb-[60px] xl:pb-0 max-w-[650px]">
            {children}
          </main>
          
        </div>
        <BottomNavbar className="fixed bottom-0 left-0 w-full" />

        <aside className="xl:w-[300px] flex-shrink-0 ">
          <RightSidebar />
        </aside>
   
      </div>
    </div>
  );
}
