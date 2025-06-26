import React from "react";
import Header from "../app/components/Header";
import RightSidebar from "../app/components/RightSideBar";
import LeftSideBar from "../app/components/LeftSideBar";
import BottomNavbar from "../app/components/BottomNavbar";

export default function AppLayout({ children }) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1 bg-[#f5f5f5]">
                          <LeftSideBar />
        <div className="flex-1 flex flex-col">
          <main>{children}</main> {/*App Page: Home, Heatmap, Post, Adoption*/}
          <BottomNavbar/>
        </div>
                <RightSidebar />
      </div>
    </div>
  );
}
