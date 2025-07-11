import React, { useEffect, useState } from "react";
import { storage, db, auth } from "../../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import defaultImg from "../../assets/default_img.jpg";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function Profile() {
  const { user } = useAuth();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(defaultImg);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username);
          setRole(data.userType);
        } else{
          setUsername(user.displayName)
          setRole("Community Volunteer")
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    if (user?.uid) {
      fetchUserData();
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePhoto(imageUrl);
    }
  };

  const handleSave = async () => {
    if (!user || !profilePhoto) return;

    try {
      const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
      const snapshot = await uploadBytes(storageRef, profilePhoto);
      const downloadURL = await getDownloadURL(snapshot.ref);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        profilePhoto: downloadURL,
      });

      setProfilePhoto(downloadURL);
      alert("Profile photo updated successfully!");
    } catch (error) {
      console.error("Error uploading photo:", error);
      alert("Failed to upload photo. Please try again.");
    }
  };

  const navigate = useNavigate();

  const handleLogout = () => {
    confirmAlert({
      title: "Confirm Logout",
      message: "Are you sure you want to logout?",
      buttons: [
        {
          label: "Yes",
          onClick: () => {
            signOut(auth)
              .then(() => {
                console.log("Sign out successful.");
                navigate("/login");
              })
              .catch((error) => {
                console.error("Error signing out", error);
                alert("Logout failed. Please try again.");
              });
          },
        },
        {
          label: "No",
          onClick: () => console.log("Logout cancelled."),
        },
      ],
    });
  };

  return (
    <div className="max-w-[600px] mx-auto h-auto space-y-4">
      <div className="border border-gray-200 shadow-sm flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 rounded-sm overflow-hidden bg-[#fafafa]">
        <main className="w-screen space-y-2 p-2">
          <h1 className="font-semibold text-xl text-center">Profile</h1>
          <div className="flex justify-center items-center flex-col space-y-2">
            <div className="relative group w-24 h-24 flex justify-center items-center m-2">
              <img
                src={profilePhoto}
                alt="User profile"
                className="w-24 h-24 rounded-full object-cover mt-4 mb-2 relative"
              />
              <label
                htmlFor="fileInput"
                className="absolute inset-x-0 inset-y-1 flex items-center w-24 h-24 rounded-full bg-black/50 justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              >
                <span className="text-white text-sm">Change</span>
              </label>
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
              />
            </div>
            <h2 className="text-base font-semibold">
              {username || "Loading..."}
            </h2>
            <h3 className="text-sm text-gray-500">{role || "Loading..."}</h3>
            <p className="text-gray-500 text-sm">Add a description...</p>
            {/*
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200 ease-in-out" onClick={handleSave}>
              Save
            </button>*/}
            {/* Logout */}
            <button
              type="button"
              onClick={handleLogout}
              aria-label="Logout"
              className="flex gap-2 items-center text-xl text-[#fafafa] bg-[rgb(40,112,56)]  px-3 py-1 hover:bg-[rgb(43,81,51)] rounded-full duration-200 ease-in cursor-pointer"
            >
              <i className="bi bi-box-arrow-right"></i>
              <span className="hidden xl:block text-xs mt-1">Logout</span>
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
