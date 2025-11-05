import React, { useState, useEffect } from "react";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

export default function EditPostModal({ isOpen, onClose, post, onUpdate }) {
  if (!isOpen || !post) return null;


  const [description, setDescription] = useState(post.description || "");
  const [breed, setBreed] = useState(post.breed || "");
  const [selectedCoatColor, setSelectedCoatColor] = useState(post.coatColor || "Coat/Color");

  const coatColors = [
    "White",
    "Black",
    "Brown",
    "Gray/Silver",
    "Yellow/Golden",
    "Bicolor Mixed",
    "Tricolor Mixed",
  ];

  useEffect(() => {
    setDescription(post.description || "");
    setBreed(post.breed || "");
    setSelectedCoatColor(post.coatColor || "Coat/Color");
  }, [post]);

  const handleSubmit = (e) => {
    e.preventDefault();

    const updatedData = {
      description: description.trim(),
      coatColor: selectedCoatColor,
      breed: breed.trim(),
      lastUpdated: new Date(), 
    };

    onUpdate(post.id, post.type, updatedData);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white p-6 rounded-xl shadow-2xl max-w-md w-full border border-gray-200">
        <h2 className="text-xl font-semibold mb-4 border-b pb-2 text-gray-800">
          Edit Post
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-400 focus:border-amber-400"
              rows="3"
              placeholder="Enter description..."
              required
            />
          </div>

          {/* Coat Color */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Coat Color
            </label>
            <Menu as="div" className="relative w-full">
              <MenuButton className="inline-flex justify-between items-center w-full border border-gray-300 rounded-md px-3 py-2 text-sm font-medium text-gray-700 hover:bg-amber-50 focus:ring-2 focus:ring-amber-400">
                {selectedCoatColor}
                <ChevronDownIcon className="w-5 h-5 text-amber-500" />
              </MenuButton>
              <MenuItems className="absolute left-0 z-10 mt-2 w-full max-h-40 overflow-y-auto rounded-md bg-white border border-gray-200 shadow-lg">
                <div className="py-1">
                  {coatColors.map((color) => (
                    <MenuItem key={color}>
                      <button
                        type="button"
                        onClick={() => setSelectedCoatColor(color)}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-amber-50 ${
                          selectedCoatColor === color ? "bg-amber-100 font-semibold" : ""
                        }`}
                      >
                        {color}
                      </button>
                    </MenuItem>
                  ))}
                </div>
              </MenuItems>
            </Menu>
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Breed
            </label>
            <input
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              placeholder="Enter breed..."
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-amber-400 focus:border-amber-400"
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
              className="px-4 py-2 text-sm font-medium text-white bg-amber-500 rounded-md hover:bg-amber-600 transition"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
