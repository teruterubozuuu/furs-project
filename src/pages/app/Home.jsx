import React from "react";
import bantatayImg from "../../assets/bantatay.jpg";
import dog from "../../assets/dog.jpg";
import yujei from "../../assets/yujei (copy).jpg";
import { useState } from "react";
import AddPost from "./components/AddPost";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="max-w-[600px] h-auto space-y-4">
      <div className="border border-gray-300 flex p-5 gap-2 items-center rounded-sm">
        <img src={yujei} alt="User profile picture" className="w-15 rounded-full"/> 
        <div value={isOpen} onClick={()=>setIsOpen(true)} className="border border-gray-300 flex-1 rounded-4xl cursor-pointer bg-gray-100 hover:bg-gray-200 transition duration-200 ease-in-out">
          <button className="p-2 text-gray-500 font-medium cursor-pointer">Create a post</button>
        </div>
      </div>

      <AddPost isOpen={isOpen} onClose={()=>setIsOpen(false)} />{/*show component when the button for posts is clicked*/}

      {/*Sample content*/}
      <div className="border border-gray-300 p-5 rounded-sm">
        <div className="border-b border-gray-200">
          {/*Post header*/}
          <div className="flex h-full items-center pb-2">
            <img
              src={bantatayImg}
              alt="Bantatay Image"
              className="w-15 h-15 rounded-full"
            />
            <div className=" pl-2 space-y">
              <p className="text-xl"> Bantatay</p>
              <span className="text-xs p-1 border border-gray-400 rounded-sm">
                Stray Animal
              </span>
            </div>
          </div>

          {/*Description*/}

          <p>
            Hello! I've been seeing this dog roaming around our street. He's a
            very good dog. Does it have an owner? I don't see any collar with an
            identity tag.
          </p>
          <div className="flex justify-center p-3">
            <img src={dog} alt="Dog" className="w-100 rounded-sm" />
          </div>

          {/*Location details*/}
          <div className="py-1">
            <span className="italic text-gray-400">
              St. George Street, Sacred Heart Village, Caloocan City
            </span>
          </div>

          {/*Dog characteristics*/}
          <div className="flex py-1 gap-3">
            <span className="text-xs p-1 border-1 border-gray-400 rounded-sm">
              Bicolor Mixed
            </span>

            <span className="text-xs p-1 border-1 border-gray-400 rounded-sm">
              Aspin
            </span>
          </div>
        </div>

        <div className="flex flex-1 justify-between px-2 pt-3">
          <p>Like</p>
          <p>Comment</p>
          <p>Repost</p>
        </div>
      </div>
    </div>
  );
}
