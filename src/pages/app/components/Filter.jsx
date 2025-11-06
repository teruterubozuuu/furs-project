// src/pages/app/components/Filter.jsx
import React, { useState } from "react";

export default function Filter({ isOpen, onClose, onApply }) {
  const [reportType, setReportType] = useState("");
  const [selectedColors, setSelectedColors] = useState([]);

  if (!isOpen) return null;

  const handleColorChange = (color) => {
    setSelectedColors((prev) =>
      prev.includes(color)
        ? prev.filter((c) => c !== color)
        : [...prev, color]
    );
  };

  const handleApply = () => {
    onApply({ reportType, selectedColors });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex justify-center h-full text-[#212121] text-start">
      <div className="bg-[#fefefe] p-6 rounded-md shadow-lg w-full max-h-[520px] max-w-md relative m-4 overflow-y-auto">
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
          {/* Report Type */}
          <section>
            <p className="font-medium">Report Status</p>
            <div className="flex flex-col gap-2 mt-2">
              {["Stray Animal", "Lost Pet", "Unknown", "All"].map((status) => (
                <label key={status} className="flex gap-1 cursor-pointer">
                  <input
                    type="radio"
                    name="reportType"
                    value={status}
                    checked={reportType === status}
                    onChange={(e) => setReportType(e.target.value)}
                  />
                  <span>{status}</span>
                </label>
              ))}
            </div>
          </section>

          {/* Coat / Color */}
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
            ].map((color) => (
              <label key={color} className="flex gap-1 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color)}
                  onChange={() => handleColorChange(color)}
                  className="cursor-pointer"
                />
                <span>{color}</span>
              </label>
            ))}
          </section>

          <button
            onClick={handleApply}
            className="w-full bg-[#2e7d32] text-white rounded-sm py-2 cursor-pointer"
          >
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
