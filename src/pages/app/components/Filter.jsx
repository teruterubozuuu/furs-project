import React from "react";

export default function ({ isOpen, onClose }) {
  if (!isOpen) return null;
  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/30 flex justify-center h-full text-[#212121] text-start">
        <div className="bg-[#fefefe] p-6 rounded-md shadow-lg w-full max-h-[70vh] xl:max-h-[50vh] max-w-md relative m-4 overflow-y-auto">
          <div className="flex items-center justify-between pb-5">
            <h1 className="font-semibold text-xl text-[#2e7d32]">Filter</h1>
            <button
              className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          <div className="space-y-4">
            <section>
              <p className="font-medium">Report Status</p>
              <div>
                <div>
                  <label className="flex gap-1" htmlFor="stray">
                    <input type="radio" id="stray" value="stray"/>
                    <span>Stray</span>
                  </label>
                </div>
                <div>
                  <label className="flex gap-1" htmlFor="lostPet">
                    <input type="radio" id="lostPet" value="lostPet"/>
                    <span>Lost Pet</span>
                  </label>
                </div>
              </div>
            </section>

            <section>
              <p className="font-medium">Coat/Color</p>
              {[
                "White",
                "Black",
                "Brown",
                "Gray/Silver",
                "Yellow/Golden",
                "Bicolor Mixed",
                "Tricolor Mixed",
              ].map((color,index)=>(
                <label className="flex gap-1">
                  <input type="checkbox" key={index} className="flex items-center gap-1"/>
                  <span>{color}</span>
                </label>
              ))}
              
            </section>
            <button className="w-full bg-[#2e7d32] text-white rounded-sm py-2 cursor-pointer ">Apply</button>
          </div>
        </div>
      </div>
    </>
  );
}
