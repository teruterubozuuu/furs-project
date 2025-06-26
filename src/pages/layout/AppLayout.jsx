import React from "react";
import Header from "../app/components/Header";
import RightSidebar from "../app/components/RightSidebar";
import LeftSideBar from "../app/components/LeftSideBar";
import BottomNavbar from "../app/components/BottomNavbar";

export default function AppLayout({ children }) {
  return (
    <div className="h-screen flex flex-col">
      <Header />
      <div className="flex flex-1">
        <RightSidebar />
        <div className="flex-1 flex flex-col">
          <main>{children}</main> {/*App Page: Home, Heatmap, Post, Adoption*/}
          <BottomNavbar/>
        </div>
        <LeftSideBar />
      </div>
    </div>
  );
}
