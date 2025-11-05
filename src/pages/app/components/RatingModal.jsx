import React, { useState } from "react";
import { createPortal } from "react-dom";

export default function RatingModal({ isOpen, onClose, onRate }) {
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0); // ✅ new state for hover

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 w-80 text-center shadow-md">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">Share your rating</h2>
        <p className="text-xs text-gray-600 mb-2">
          How accurate and complete do you think this post is? Your feedback helps others.
        </p>

        <div className="flex justify-center gap-2 mb-4">
          {[1, 2, 3, 4, 5].map((star) => (
            <i
              key={star}
              className={`bi ${
                (hoverRating || selectedRating) >= star
                  ? "bi-star-fill text-yellow-500"
                  : "bi-star text-gray-400"
              } text-2xl cursor-pointer transition duration-150`}
              onMouseEnter={() => setHoverRating(star)}   
              onMouseLeave={() => setHoverRating(0)}      
              onClick={() => setSelectedRating(star)}     
            ></i>
          ))}
        </div>

        <div className="flex justify-center gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300 cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              if (selectedRating === 0) return alert("Please select a rating.");
              onRate(selectedRating);
              onClose();
            }}
            className="px-4 py-2 text-sm bg-[rgb(40,112,56)] text-white rounded-md hover:bg-[rgb(43,81,51)] cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}
