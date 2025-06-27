import React from "react";
import Header from "../app/components/Header";
import RightSidebar from "../app/components/RightSideBar";
import LeftSideBar from "../app/components/LeftSideBar";
import BottomNavbar from "../app/components/BottomNavbar";

export default function AppLayout({ children }) {
  return (
<div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 overflow-hidden bg-[#f5f5f5]">
        <LeftSideBar />
        <div className="flex-1 flex flex-col overflow-y-auto">
          <main className="flex-1 overflow-y-auto">{children}</main>
          <BottomNavbar />
        </div>
        <RightSidebar />
      </div>
    </div>
  );
}
