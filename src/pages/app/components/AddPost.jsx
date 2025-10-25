import SelectLocation from "./SelectLocation";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import defaultImg from "../../../assets/default_img.jpg";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { getDoc, addDoc, doc, collection, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../../firebase/config";

export default function AddPost({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [breed, setBreed] = useState("");
  const [selectedReport, setSelectedReport] = useState("Report Type");
  const [selectedCoatColor, setSelectedCoatColor] = useState("Coat/Color");
  const [location, setLocation] = useState(null);
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // ✅ for visual feedback

  const coatColor = [
    "White",
    "Black",
    "Brown",
    "Gray/Silver",
    "Yellow/Golden",
    "Bicolor Mixed",
    "Tricolor Mixed",
  ];
  const reportType = ["Stray Animal", "Lost Pet", "Unknown"];

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    if (isSubmitting) return; // prevent closing while submitting
    onClose();
    setPhotoPreview(null);
    setPhoto(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in");
      setIsSubmitting(false);
      return;
    }

    if (!photo) {
      alert("Please upload a photo.");
      setIsSubmitting(false);
      return;
    }

    let username = user.displayName || "Anonymous";

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().username) {
        username = userDoc.data().username;
      }
    } catch (error) {
      console.error("Error fetching username:", error);
    }

    let photoURL = "";
    try {
      const storageRef = ref(storage, `posts/${user.uid}/${Date.now()}_${photo.name}`);
      const snapshot = await uploadBytes(storageRef, photo);
      photoURL = await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo.");
      setIsSubmitting(false);
      return;
    }

    const plainLocation =
      location && location.lat && location.lng
        ? { lat: location.lat, lng: location.lng }
        : null;

    const reportData = {
      userId: user.uid,
      username,
      photoURL,
      breed,
      coatColor: selectedCoatColor,
      description,
      status: selectedReport,
      location: plainLocation,
      createdAt: Timestamp.now(),
    };

    try {
      await addDoc(collection(db, "posts"), reportData);
      alert("Report submitted successfully.");
      onClose();
      navigate("/home");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report.");
    } finally {
      setIsSubmitting(false);
      setPhoto(null);
      setPhotoPreview(null);
      setBreed("");
      setSelectedCoatColor("Coat/Color");
      setSelectedReport("Report Type");
      setDescription("");
      setLocation(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20 h-screen">
      <div className="flex justify-center text-[#212121] p-3 text-start">
        <div className="bg-[#fefefe] px-6 py-3 rounded-md flex justify-center w-full shadow-lg max-w-lg relative my-6">
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="flex justify-start pb-2">
              <button
                className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
                onClick={handleClose}
                type="button"
                disabled={isSubmitting}
              >
                ×
              </button>
            </div>

            {/* Description & Type */}
            <div className="space-y-2 pb-3">
              <div className="flex items-center gap-3">
                <Menu as="div" className="relative inline-block">
                  <MenuButton className="inline-flex border cursor-pointer hover:bg-yellow-100 border-gray-200 w-full justify-center gap-x-1.5 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-amber-400">
                    {selectedReport}
                    <ChevronDownIcon className="-mr-1 size-5 text-amber-400" />
                  </MenuButton>
                  <MenuItems className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 bg-white transition">
                    <div className="py-1">
                      {reportType.map((type) => (
                        <MenuItem key={type}>
                          <button
                            type="button"
                            onClick={() => setSelectedReport(type)}
                            className="cursor-pointer text-gray-700 hover:bg-gray-100 block w-full text-left px-4 py-2 text-sm"
                          >
                            {type}
                          </button>
                        </MenuItem>
                      ))}
                    </div>
                  </MenuItems>
                </Menu>
              </div>

              <textarea
                placeholder="Description of the animal or situation."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="4"
                className="p-2 focus:outline-none resize-none text-sm w-full"
              />

              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className="w-full h-[200px] object-cover rounded-md mt-2"
                />
              )}

              <hr className="text-gray-200 p-1" />

              <div className="flex justify-between gap-2 items-center">
                <div className="flex-1">
                  <label className="block xl:text-sm text-xs font-medium mb-1 text-gray-400">
                    Breed (If known)
                  </label>
                  <input
                    placeholder="e.g. Aspin, Siamese, Persian..."
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="p-2 border border-gray-200 focus:outline-none rounded-md text-sm w-full"
                  />
                </div>

                <Menu as="div" className="relative inline-block w-1/2">
                  <label className="block xl:text-sm text-xs font-medium mb-1 text-gray-400">
                    Animal Coat or Color
                  </label>
                  <MenuButton className="inline-flex justify-between border cursor-pointer hover:bg-yellow-100 border-gray-200 w-full gap-x-1.5 rounded-md px-3 py-2 text-sm font-semibold text-amber-400">
                    {selectedCoatColor}
                    <ChevronDownIcon className="-mr-1 size-5 text-amber-400" />
                  </MenuButton>
                  <MenuItems className="absolute right-0 z-10 mt-2 w-56 max-h-[120px] overflow-y-scroll rounded-lg border border-gray-200 bg-white">
                    <div className="py-1">
                      {coatColor.map((type) => (
                        <MenuItem key={type}>
                          <button
                            type="button"
                            onClick={() => setSelectedCoatColor(type)}
                            className="block w-full text-left px-4 py-2 text-sm cursor-pointer hover:bg-gray-100"
                          >
                            {type}
                          </button>
                        </MenuItem>
                      ))}
                    </div>
                  </MenuItems>
                </Menu>
              </div>
            </div>

            <hr className="text-gray-200 p-1" />

            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                <div className="flex items-center cursor-pointer px-3 py-2 hover:bg-yellow-100 rounded-full">
                  <label className="text-xs text-gray-400 space-x-1 cursor-pointer">
                    <i className="bi bi-image-fill text-[#fbc02d]"></i>
                    {photo ? "Change" : "Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex items-center gap-2 cursor-pointer">
                  <button
                    type="button"
                    onClick={() => setIsLocationModalOpen(true)}
                    className="text-xs flex items-center gap-1 hover:bg-yellow-100 p-2 rounded-full"
                  >
                    <i className="bi bi-geo-alt-fill text-[#fbc02d]"></i>
                    <span className="text-gray-400">
                      {location
                        ? `${location.lat.toFixed(5)}, ${location.lng.toFixed(5)}`
                        : "Set Location"}
                    </span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className={`bg-[#2e7d32] hover:bg-[rgb(28,79,39)] px-5 py-1 text-white rounded-full ${
                  isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                {isSubmitting ? "Posting..." : "Post"}
              </button>
            </div>
          </form>

          {isLocationModalOpen && (
            <SelectLocation
              onClose={() => setIsLocationModalOpen(false)}
              onSelect={(selectedLocation) => {
                if (selectedLocation) setLocation(selectedLocation);
                setIsLocationModalOpen(false);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
