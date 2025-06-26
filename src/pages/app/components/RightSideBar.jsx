import React from 'react'

export default function LeftSideBar() {
  return (
    <div className="h-auto border-l-1 border-gray-300 flex-none w-70 hidden xl:flex p-4">
          <div className="text-sm">
            <h1>Animal Welfare Organizations</h1>
            <ul>
              <li>Philippine Animal Welfare Society</li>
              <li>Strays Worth Saving</li>
            </ul>
          </div>
    </div>
  )
}
