import React from "react";
import bantatayImg from "../../assets/bantatay.jpg";
import dog from "../../assets/dog.jpg";

export default function Home() {
  return (
    <div className="p-8 space-y-4 h-screen">
      {/*Insert content/components here*/}

      {/*Sample content*/}
      <div className="border-1 border-gray-200 p-5 rounded-sm">
        <div className="border-b-1 border-gray-200">
          {/*Post header*/}
          <div className="flex h-full items-center pb-2">
            <img
              src={bantatayImg}
              alt="Bantatay Image"
              className="w-15 h-15 rounded-full"
            />
            <div className=" pl-2 space-y-1">
              <p className="text-xl"> Bantatay</p>
              <span className="text-xs p-1 border-1 border-gray-400 rounded-sm">
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
 <span className="italic text-gray-400">St. George Street, Sacred Heart Village, Caloocan City</span>
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
