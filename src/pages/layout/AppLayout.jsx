import React from 'react'
import Header from '../../components/Header'
import AppNavbar from '../../components/AppNavbar'

export default function AppLayout({children}) {
  return (
    <div>
        <AppNavbar/>
        <Header/>
        <main>{children}</main>
    </div>
  )
}
