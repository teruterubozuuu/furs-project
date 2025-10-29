import React from 'react'

export default function User() {
  return (
    <div>
        <h1 className='text-xl font-semibold text-[#115315]'>User Management</h1>
        <p className='text-sm font-light'>1 user/s found</p>
        <div className='flex justify-between items-center py-3 flex-wrap gap-3'>
          <button className='bg-[#115315] text-white px-3 py-1 rounded-md'>Add user</button>
          <input type="text" placeholder='Search user...' className='border border-gray-300 rounded-md p-1 focus:outline'/>
        </div>

        <div className='flex bg-[#115315] py-2 justify-around text-white rounded-md'>
          <span>User UID</span>
          <span>Email</span>
          <span>Username</span>
          <span>Role</span>
        </div>
    </div>
  )
}
