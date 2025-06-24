import React from 'react'
import AppNavbar from '../../components/AppNavbar'

export default function AppLayout({children}) {
  return (
    <div>
        <AppNavbar/>
        <main>{children}</main>
    </div>
  )
}
