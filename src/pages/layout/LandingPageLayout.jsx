import React from 'react'
import LPNavbar from '../landingpage/components/LPNavbar'
import backgroundImg from "../../assets/bg_img.jpg";

export default function LandingPageLayout({children}) {
  return (
    <div className='h-screen bg-[#fafafa]'> 
      <div >
        <LPNavbar />
        <main>{children}</main>
      </div>
    </div>
  )
}
