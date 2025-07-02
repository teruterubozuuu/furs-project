import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db, storage } from "../../../firebase/config";
import { getDoc, addDoc, doc, collection, Timestamp } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AddPost({ isOpen, onClose }) {
  const navigate = useNavigate();

  const [photo, setPhoto] = useState(null);
  const [preview, setPreview] = useState(null);
  const [breed, setBreed] = useState("");
  const [color, setColor] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("Stray");
  const [location, setLocation] = useState(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];

    if (file) {
      setPhoto(file);
      setPreview(URL.createObjectURL(file));
    }
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

    //Get Username
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
        `posts/${user.uid}/${Date.now()}_${photo.name}`
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
      color,
      description,
      status,
      location,
      createdAt: Timestamp.now(),
    };


    // Add report to firestore database
    try {
      await addDoc(collection(db, "posts"), reportData);
      alert("Report submitted successfully");
      onClose();
      navigate("/home");
    } catch (error) {
      console.error("Error submitting report:", error);
      alert("Failed to submit report. Please try again.");
    }

    // Clear form
    setPhoto(null);
    setBreed("");
    setColor("");
    setDescription("");
    setStatus("Stray");
    setLocation(null);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/30 flex items-center justify-center h-screen text-[#212121] text-start">
      <div className="bg-[#fefefe] p-6 rounded-md shadow-lg w-full max-w-md relative m-4 overflow-y-auto max-h-[90vh]">
        <div className="flex justify-end pb-5">
          <button
            className="text-gray-500 hover:text-gray-700 text-xl cursor-pointer"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <h1 className="text-xl font-bold mb-4 text-center">
          Report an Animal Sighting
        </h1>
        <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-medium mb-1">Photo</label>
            <label className="bg-gray-200 text-sm text-center py-2 rounded-md cursor-pointer hover:bg-gray-300 block">
              {photo ? "Change Photo" : "Upload Photo"}
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </label>
            {preview && (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-[200px] object-cover rounded-md mt-2"
              />
            )}
          </div>

          {/* Breed */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Breed (if known)
            </label>
            <input
              placeholder="e.g. Persian, Shih Tzu (leave blank if unsure)."
              type="text"
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              className="p-2 border rounded-md text-sm w-full"
            />
          </div>

          {/* Color/Coat */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Color / Coat
            </label>
            <select
              value={color}
              onChange={(e) => setColor(e.target.value)}
              className="p-2 border rounded-md text-sm w-full"
            >
              <option value="">Select a color</option>
              <option value="White">White</option>
              <option value="Black">Black</option>
              <option value="Brown">Brown</option>
              <option value="Gray/Silver">Gray/Silver</option>
              <option value="Golden">Yellow/Golden</option>
              <option value="Bicolor Mixed">Bicolor Mixed</option>
              <option value="Tricolor Mixed">Tricolor Mixed</option>
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Description
            </label>
            <textarea
              placeholder="Description of the animal or situation."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows="4"
              className="p-2 border rounded-md resize-none text-sm w-full"
            />
          </div>

          {/* Status */}
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="p-2 border rounded-md text-sm w-full"
            >
              <option value="Stray">Stray</option>
              <option value="Lost Pet">Lost Pet</option>
              <option value="Unknown">Unknown</option>
            </select>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium mb-1">Location</label>
            <button
              type="button"
              className="bg-blue-500 text-white py-2 rounded-md text-sm hover:bg-blue-600 w-full"
              onClick={handleGetLocation}
              disabled={loadingLocation}
            >
              {loadingLocation ? "Getting location..." : "Use My Location"}
            </button>
            {location && (
              <p className="text-xs text-gray-600 mt-1">
                {location.lat.toFixed(5)}, {location.lng.toFixed(5)}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="bg-green-500 text-white py-2 rounded-md text-sm hover:bg-green-600"
          >
            Submit Report
          </button>
        </form>
      </div>
    </div>
  );
}
