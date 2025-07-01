import React from "react";
import Header from "../app/components/Header";
import RightSidebar from "../app/components/RightSideBar";
import LeftSideBar from "../app/components/LeftSideBar";
import BottomNavbar from "../app/components/BottomNavbar";

export default function AppLayout({ children }) {
  return (
<div className="h-screen flex flex-col  bg-[#f5f5f5]">
      <Header />
      <div className="flex flex-1 overflow-hidden justify-center p-5 gap-4">
        <LeftSideBar />
        <div className="flex flex-col overflow-y-auto">
          <main className="flex-1 justify-center overflow-y-auto h-screen font-[Inter] pb-[70px] xl:pb-0">{children}</main>
          <BottomNavbar />
        </div>
        <RightSidebar />
      </div>
    </div>
  );
}
