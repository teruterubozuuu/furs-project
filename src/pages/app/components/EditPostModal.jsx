// ./components/EditPostModal.jsx
import React, { useState, useEffect } from "react";

// NOTE: You will need to import 'updateDoc' and 'doc' from Firebase in Home.jsx

export default function EditPostModal({ isOpen, onClose, post, onUpdate }) {
  // Only render if the modal is open and we have a post to edit
  if (!isOpen || !post) return null;

  // Use local state to manage form inputs, initialized with current post data
  const [description, setDescription] = useState(post.description || "");
  const [color, setColor] = useState(post.color || "");
  const [breed, setBreed] = useState(post.breed || "");

  // Reset local state whenever the post changes (i.e., when modal opens for a new post)
  useEffect(() => {
    setDescription(post.description || "");
    setColor(post.color || "");
    setBreed(post.breed || "");
  }, [post]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Prepare the updated data object
    const updatedData = {
      description: description,
      color: color,
      breed: breed,
      // Optionally update a 'lastUpdated' timestamp
      lastUpdated: new Date(),
    };

    // Call the prop function provided by Home.jsx to handle Firestore update
    onUpdate(post.id, post.type, updatedData);
    onClose(); // Close the modal after submission
  };

  return (
    // Basic Modal Structure (Tailwind/Vite styling based on your structure)
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-2xl max-w-md w-full">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2">
          Edit Your Post ({post.type})
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              rows="3"
              required
            />
          </div>

          {/* Color Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Color
            </label>
            <input
              type="text"
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
              required
            />
          </div>

          {/* Breed Field */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Breed
            </label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
