import React, { useEffect } from 'react'
import { getDoc, doc } from 'firebase/firestore';

export default function User() {
  useEffect(() => {
   const fetchUsers = async () => {
    if (!user?.uid) return;
    // Fetch user data logic here
    const userDoc = await getDoc(doc("users", user.uid));
    if (userDoc.exists()) {
      const data = userDoc.data();
      console.log("User data:", data);
    }
   }
  }, []);
  return (
    
    <div>
        <h1 className='text-xl font-semibold text-[#115315]'>User Management</h1>
        <p className='text-sm font-light'>1 user/s found</p>
        <div className='flex justify-between items-center py-3 flex-wrap gap-3 flex-1'>
          <button className='bg-[#115315] text-white px-3 py-1 rounded-md'>Add user</button>
          <input type="text" placeholder='Search user...' className='border border-gray-300 rounded-md p-1 focus:outline'/>
        </div>

        <div className='flex bg-[#115315] py-2 justify-around text-white rounded-md'>
          <span>Email</span>
          <span>Username</span>
          <span>Role</span>
        </div>

        <div className='flex bg-[#D3ECD4] py-2 justify-around text-white rounded-md mt-3'>

        </div>
    </div>
  )
}
