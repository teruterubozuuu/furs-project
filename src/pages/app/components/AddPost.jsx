import SelectLocation from "./SelectLocation";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import defaultImg from "../../../assets/default_img.jpg";
import {
  Menu,
  MenuButton,
  MenuItem,
  MenuItems,
  Portal,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { getDoc, addDoc, doc, collection, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { auth, db, storage } from "../../../firebase/config";

export default function AddPost({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [description, setDescription] = useState("");
  const [breed, setBreed] = useState("");
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
  const [selectedReport, setSelectedReport] = useState("Report Type");
  const [selectedCoatColor, setSelectedCoatColor] = useState("Coat/Color");
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setPhoto(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleClose = () => {
    onClose();
    setPhotoPreview(null);
    setPhoto(null);
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setLoadingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
        setLoadingLocation(false);
      },
      () => {
        alert("Unable to retrieve your location.");
        setLoadingLocation(false);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      alert("User not logged in");
      return;
    }

    if (!photo) {
      alert("Please upload a photo.");
      return;
    }

    let username = user.displayName;
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists() && userDoc.data().username) {
        username = userDoc.data().username;
      }
    } catch (error) {
      console.error("Error fetching username from Firestore:", error);
    }

    // Upload photo
    let photoURL = "";
    try {
      const storageRef = ref(
        storage,
        `stray_animal_posts/${user.uid}/${Date.now()}_${photo.name}`
      );
      const snapshot = await uploadBytes(storageRef, photo);
      photoURL = await getDownloadURL(snapshot.ref);
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo. Please try again.");
      return;
    }

    // Create report data
    const reportData = {
      userId: user.uid,
      username: username,
      photoURL,
      breed,
      coatColor: selectedCoatColor,
      description,
      status: selectedReport,
      location,
      createdAt: Timestamp.now(),
    };

    // Determine which collection to use based on selectedReport
    let collectionName = "posts"; // default fallback
    if (selectedReport === "Lost Pet") {
      collectionName = "lost_pet_posts";
    } else if (selectedReport === "Stray Animal") {
      collectionName = "stray_animal_posts";
    } else if (selectedReport === "Unknown") {
      collectionName = "unknown_status";
    }

    // Add report to the correct Firestore collection
    try {
      await addDoc(collection(db, collectionName), reportData);
      alert(`Report submitted successfully.`);
      onClose();
      navigate("/home");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    }
    // Clear form
    setPhoto(null);
    setPhotoPreview(null);
    setBreed("");
    setSelectedCoatColor("");
    setDescription("");
    setLocation(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/20  h-screen">
      <div className="flex justify-center  text-[#212121] p-3 text-start">
        <div className="bg-[#fefefe] px-6 py-3 rounded-md flex justify-center w-full shadow-lg max-w-lg relative my-6">
          <form className="w-full" onSubmit={handleSubmit}>
            <div className="flex justify-start pb-2">
              <button
                className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
                onClick={handleClose}
              >
                ×
              </button>
            </div>
            {/* Description */}
            <div className="space-y-2 pb-3">
              <div className="flex items-center gap-3">
                {/*Report Type*/}
                <Menu as="div" className="relative inline-block">
                  <MenuButton className="inline-flex border-1 cursor-pointer hover:bg-yellow-100 transition-all ease-in border-gray-200 w-full justify-center gap-x-1.5 rounded-full bg-white/10 px-3 py-2 text-sm font-semibold text-amber-400 inset-ring-1 inset-ring-white/5">
                    {selectedReport}
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="-mr-1 size-5 text-amber-400 "
                    />
                  </MenuButton>
                  <MenuItems
                    transition
                    className="absolute left-0 z-10 mt-2 w-56 origin-top-right rounded-lg border border-gray-200 bg-white outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                  >
                    <div className="py-1">
                      {reportType.map((type) => (
                        <MenuItem key={type}>
                          <button
                            type="button"
                            onClick={() => setSelectedReport(type)}
                            className="cursor-pointer g-gray-200 text-gray-700 hover:bg-gray-100 block w-full text-left px-4 py-2 text-sm"
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

              {/*Photo Preview*/}
              {photoPreview && (
                <img
                  src={photoPreview}
                  alt="Preview"
                  className={`w-full h-[200px] object-cover rounded-md mt-2`}
                />
              )}

              <hr className=" text-gray-200 p-1" />

              <div className="flex justify-between  gap-2 items-center">
                {/*  Breed */}
                <div className="flex-1">
                  <label className="block xl:text-sm text-xs font-medium mb-1 text-gray-400">
                    Breed (If known)
                  </label>
                  <input
                    placeholder="e.g. Aspin, Siamese, Persian..."
                    type="text"
                    value={breed}
                    onChange={(e) => setBreed(e.target.value)}
                    className="text-ellipsis p-2 border-1 border-gray-200 focus:outline-none rounded-md text-sm w-full"
                  />
                </div>

                {/* Color/Coat */}
                <Menu
                  as="div"
                  className="relative inline-block flex-grow-0 flex-shrink-0 w-1/2"
                >
                  <label className="block xl:text-sm text-xs font-medium mb-1 text-gray-400">
                    Animal Coat or Color
                  </label>
                  <MenuButton className="inline-flex justify-between border-1 cursor-pointer transition-all ease-in hover:bg-yellow-100 border-gray-200 w-full gap-x-1.5 rounded-md bg-white/10 px-3 py-2 text-sm font-semibold text-amber-400 inset-ring-1 inset-ring-white/5">
                    {selectedCoatColor}
                    <ChevronDownIcon
                      aria-hidden="true"
                      className="-mr-1 size-5 text-amber-400 "
                    />
                  </MenuButton>

                  <MenuItems
                    transition
                    className="absolute right-0 z-10 mt-2 w-56 max-h-[120px] overflow-y-scroll origin-top-right rounded-lg border border-gray-200 bg-white outline-1 -outline-offset-1 outline-white/10 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
                  >
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

            <hr className=" text-gray-200 p-1" />
            <div className="flex justify-between items-center">
              <div className="flex gap-2 items-center">
                {/*Photo*/}
                <div className="flex items-center  cursor-pointer transition-all ease-in  px-3 py-2 hover:bg-yellow-100 rounded-full">
                  <label className="text-xs text-gray-400 space-x-1 cursor-pointer ">
                    <i className="bi bi-image-fill text-[#fbc02d] cursor-pointer "></i>
                    {photo ? "Change" : "Photo"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden cursor-pointer "
                    />
                  </label>
                </div>

                {/* Location */}
                <div className="flex items-center transition-all ease-in gap-2 cursor-pointer">
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
                className="bg-[#2e7d32] transition-all ease-in hover:bg-[rgb(28,79,39)] px-5 py-1 text-white rounded-full cursor-pointer"
              >
                Post
              </button>
            </div>
          </form>
          {/* Location Modal */}
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
