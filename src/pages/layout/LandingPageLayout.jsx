import React from 'react'
import LPNavbar from '../../components/LPNavbar'

export default function LandingPageLayout({children}) {
  return (
    <div>
        <LPNavbar/>
        <main>{children}</main>
    </div>
  )
}
