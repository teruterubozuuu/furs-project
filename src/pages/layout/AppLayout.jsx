import React from "react";
import Header from "../app/components/Header";
import RightSidebar from "../app/components/RightSidebar";
import LeftSideBar from "../app/components/LeftSideBar";
import BottomNavbar from "../app/components/BottomNavbar";

export default function AppLayout({ children }) {
  return (
    <div>
      <Header />
      <div className="flex justify-between">
        <RightSidebar />
        <div className="flex-1">
          <main>{children}</main> {/*App Page: Home, Heatmap, Post, Adoption*/}
          <BottomNavbar/>
        </div>
        <LeftSideBar />
      </div>
    </div>
  );
}
