import React, { useEffect, useState } from "react";
import Header from "../app/components/Header";
import RightSidebar from "../app/components/RightSideBar";
import LeftSideBar from "../app/components/LeftSideBar";
import BottomNavbar from "../app/components/BottomNavbar";
import { useLocation } from "react-router-dom";

export default function AppLayout({ children }) {
  const location = useLocation();
  const hideSidebars = location.pathname === "/profile";
  const [loading,setLoading] = useState(true);

 useEffect(() => {
    const timeout = setTimeout(()=>setLoading(false),900)
    return ()=> clearTimeout(timeout);

  },[]);

    if (loading) return null;

  return (
    <div className="h-screen flex flex-col  bg-[#f5f5f5]">
      <Header />
      <div className="flex flex-1 overflow-hidden justify-center p-5 gap-4">
              {!hideSidebars && (
        <aside >
          <LeftSideBar />
        </aside>
      )}
        <div className="flex flex-col overflow-y-auto">
          <main className="flex-1 justify-center overflow-y-auto h-screen font-[Inter] pb-[70px] xl:pb-0">
            {children}
          </main>
          <BottomNavbar />
        </div>
        {!hideSidebars && (
        <aside>
          <RightSidebar />
        </aside>
      )}
      </div>
    </div>
  );
}
