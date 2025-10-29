import React from "react";

export default function Dashboard() {
  return (
    <div>
      <h1 className="text-xl font-semibold text-[#115315]">Dashboard</h1>
      <main className="space-y-5">
        <div className="flex flex-wrap gap-5">
          <div className="flex md:flex-wrap items-center justify-between flex-1 bg-white p-5 rounded-lg shadow-md mt-5 gap-3">
            <div>
              <h2 className="text-2xl font-medium">1,430</h2>
              <p className=" text-gray-700">Total Users</p>
            </div>
            <i className="bi bi-people text-4xl p-3 text-green-400 bg-green-100 rounded-lg"></i>
          </div>
          <div className="flex md:flex-wrap items-center justify-between flex-1 bg-white p-5 rounded-lg shadow-md mt-5">
            <div>
              <h2 className="text-2xl font-medium">987</h2>
              <p className=" text-gray-700">Total reports</p>
            </div>
            <i className="bi bi-clipboard-data text-4xl p-3  text-red-400 bg-red-100 rounded-lg"></i>
          </div>
          <div className="flex  md:flex-wrap items-center justify-between flex-1 bg-white p-5 rounded-lg shadow-md mt-5">
            <div>
              <h2 className="text-2xl font-medium">128</h2>
              <p className=" text-gray-700">Total reports this month</p>
            </div>
            <i className="bi bi-clipboard-plus text-4xl p-3 text-yellow-400 bg-yellow-100 rounded-lg"></i>
          </div>
          <div className="flex md:flex-wrap items-center justify-between flex-1 bg-white p-5 rounded-lg shadow-md mt-5">
            <div>
              <h2 className="text-2xl font-medium">25%</h2>
              <p className=" text-gray-700">Reports growth rate</p>
            </div>
            <i className="bi bi-clipboard-pulse text-4xl p-3 text-purple-400 bg-purple-100 rounded-lg"></i>
          </div>
        </div>

        <div className="flex flex-wrap gap-5">
          <div className="flex md:flex-wrap items-center justify-between flex-1 bg-white p-5 rounded-lg shadow-md mt-5 gap-3">
            <h2 className="font-medium">Top 5 Barangays by Report Count</h2>
          </div>

          <div className="flex md:flex-wrap items-center justify-between flex-1/2 bg-white p-5 rounded-lg shadow-md mt-5 gap-3">
            <h2 className="font-medium">Reports Over Time</h2>
          </div>
        </div>

        <div className="flex flex-wrap gap-5">
          <div className="flex md:flex-wrap items-center justify-between flex-1 bg-white p-5 rounded-lg shadow-md mt-5 gap-3">
            <h2 className="font-medium">Report Type Breakdown</h2>
          </div>

          <div className="flex md:flex-wrap items-center justify-between flex-1 bg-white p-5 rounded-lg shadow-md mt-5 gap-3">
            <h2 className="font-medium">Animal Type Breakdown</h2>
          </div>


          <div className="flex md:flex-wrap items-center justify-between flex-1 bg-white p-5 rounded-lg shadow-md mt-5 gap-3">
            <h2 className="font-medium">Coat/Color Breakdown</h2>
          </div>
        </div>
      </main>
    </div>
  );
}
