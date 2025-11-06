import React from 'react'
import postImg from "../../../assets/post.svg";
import newsFeedImg from "../../../assets/newsfeed.svg";
import heatmapImg from "../../../assets/heatmap.svg";

export default function LPFeatures() {
  return (
   <div className="min-h-screen p-10 flex flex-col items-center justify-center bg-[#2e7d32]">
    <h2 className="text-4xl font-extrabold text-white text-center mb-8">
      App Features
    </h2>
    <div className="flex flex-wrap gap-10 justify-center items-center">
        <div className='bg-white p-8 rounded-lg shadow-lg flex flex-col items-center text-center max-w-md'>
            <img src={postImg} alt="Post Feature" className="w-80 h-80 mb-6"/>
            <h3 className='font-bold text-[#2e7d32] text-md mb-2'>Report Stray Animal Sightings</h3>
            <p className="text-gray-600 text-sm">
              Share details and locations of stray animals you encounter to help raise community awareness.
            </p>
        </div>
        <div className='bg-white p-8 rounded-lg shadow-lg flex flex-col items-center text-center max-w-md'>
            <img src={newsFeedImg} alt="News Feed Feature" className="w-80 h-80 mb-6"/>
            <h3 className='font-bold text-[#2e7d32] text-md mb-2'>Browse Community Posts</h3>
            <p className="text-gray-600 text-sm">
              Stay updated with reports from other users and engage with posts about stray animal sightings nearby.
            </p>
        </div>
        <div className='bg-white p-8 rounded-lg shadow-lg flex flex-col items-center text-center max-w-md'>
            <img src={heatmapImg} alt="Heatmap Feature" className="w-80 h-80 mb-6"/>
            <h3 className='font-bold text-[#2e7d32] text-md mb-2'>Interactive Heatmap</h3>
            <p className="text-gray-600 text-sm">
              Visualize areas with frequent stray animal reports to identify hotspots and guide rescue efforts.
            </p>
        </div>
    </div>
  </div>
  )
}
