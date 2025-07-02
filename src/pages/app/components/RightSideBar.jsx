import React from 'react'

export default function LeftSideBar() {
  return (
    <div className="h-full hidden xl:flex p-4 border border-gray-300">
          <div className="text-sm">
            <h1 className='text-lg font-semibold'>Animal Welfare Organizations</h1>
            <ul>
              <li>Philippine Animal Welfare Society</li>
              <li>Strays Worth Saving</li>
            </ul>
          </div>
    </div>
  )
}
