import React from 'react'
import Navbar from "../admin/components/Navbar"

export default function AdminLayout({children}) {
  return (
    <div className='flex lg:flex-row flex-col bg-[#0E1911] lg:h-screen w-full'>
      <aside className='py-5 w-full lg:max-w-[180px] '>
        <Navbar/>
      </aside>
        <main className='bg-[#f4f4f4] w-full rounded-tl-[30px] rounded-tr-[30px] lg:rounded-tr-none lg:rounded-bl-[30px] p-5 lg:px-10'>
            {children}
        </main>
    </div>
  )
}
