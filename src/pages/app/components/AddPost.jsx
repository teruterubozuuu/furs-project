import { useState, useEffect } from "react";
import StrayReport from "../components/StrayReport";
import LostPetReport from "./LostPetReport";
import UnknownReport from "./UnknownReport";

export default function AddPost({ isOpen, onClose }) {
  const [activeForm, setActiveForm] = useState(null); // null | "stray" | "lost"

  useEffect(() => {
    if (isOpen) {
      setActiveForm(null); // Reset when modal opens
    }
  }, [isOpen]);

  const handleClose = () => {
    setActiveForm(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center h-screen text-[#212121] text-start">
      <div className="bg-[#fefefe] p-6 rounded-md shadow-lg w-full max-w-lg relative m-4 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-end pb-5">
          <button
            className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
            onClick={handleClose}
          >
            ×
          </button>
        </div>

        {/* Main Menu */}
        {activeForm === null && (
          <div className="flex flex-col flex-1 flex-wrap justify-center text-center gap-1">
            <h1 className="font-semibold text-xl mb-4 text-[#2e7d32]">
              {" "}
              Report Status{" "}
            </h1>
            <button
              className="font-bold mb-4 text-center border bg-red-100 text-red-700 border-red-300 hover:bg-red-200 cursor-pointer rounded-md py-2 px-4 transition-colors duration-200"
              onClick={() => setActiveForm("stray")}
            >
              Report a Stray Animal Sighting
            </button>
            <button
              className="font-bold mb-4 text-center border bg-yellow-100 text-yellow-700 border-yellow-300 hover:bg-yellow-200 cursor-pointer rounded-md py-2 px-4 transition-colors duration-200"
              onClick={() => setActiveForm("lost")}
            >
              Report a Lost Pet
            </button>

            <button
              className="font-bold mb-4 text-center border bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200 cursor-pointer rounded-md py-2 px-4 transition-colors duration-200"
              onClick={() => setActiveForm("unknown")}
            >
              Can't Identify
            </button>
          </div>
        )}

        {/* Stray Report */}
        {activeForm === "stray" && (
          <StrayReport
            onClose={handleClose}
            goBack={() => setActiveForm(null)}
          />
        )}

        {/* Lost Pet Report */}
        {activeForm === "lost" && (
          <LostPetReport
            onClose={handleClose}
            goBack={() => setActiveForm(null)}
          />
        )}

        {/*Unknown Animal Status Report */}

        {activeForm === "unknown" && (
          <UnknownReport
            onClose={handleClose}
            goBack={() => setActiveForm(null)}
          />
        )}
      </div>
    </div>
  );
}
