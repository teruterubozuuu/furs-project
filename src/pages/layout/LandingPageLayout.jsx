import React from 'react'
import LPNavbar from '../landingpage/components/LPNavbar'

export default function LandingPageLayout({children}) {
  return (
    <div className='h-screen bg-[#f5f5f5]'>
        <LPNavbar/>
        <div >
          <main>{children}</main>
        </div>
    </div>
  )
}
