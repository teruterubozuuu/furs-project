import React, { useEffect, useState } from "react";
// Ensure you have all necessary Firestore/Storage imports
import { storage, db, auth } from "../../firebase/config";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
} from "firebase/firestore";

import { useAuth } from "../../context/AuthContext";
import defaultImg from "../../assets/default_img.jpg";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { signOut } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";

// --- Post Card Component (Assuming this is defined locally or imported) ---
// Note: If you have this in a separate file, remove this block.
const PostCard = ({ post }) => (
  <div className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white space-y-3">
    <div className="flex justify-between items-start">
      <p className="text-xs text-gray-500 font-medium">
        Type:{" "}
        <span className="font-semibold text-green-700">{post.postType}</span>
      </p>
      {post.createdAt && (
        <p className="text-xs text-gray-400">
          {post.createdAt.toDate().toLocaleDateString()}
        </p>
      )}
    </div>

    {post.photoURL && (
      <div className="flex justify-center p-2 bg-gray-50 rounded-lg">
        <img
          src={post.photoURL}
          alt={`${post.type} photo`}
          className="w-full h-auto max-h-96 object-contain rounded-sm"
        />
      </div>
    )}

    <div className="border-t pt-3">
      <p className="font-semibold text-sm mb-1">Description:</p>
      <p className="text-gray-700 text-sm">
        {post.description || "No detailed description available."}
      </p>
    </div>

    {post.address && (
      <div className="text-xs text-gray-500 italic mt-2">
        Location: {post.address}
      </div>
    )}
  </div>
);
// ------------------------------------------------------------------------

export default function Profile() {
  const { user } = useAuth();
  const { userId: urlUserId } = useParams();

  const targetUserId = urlUserId || user?.uid;
  const isOwner = user?.uid === targetUserId;

  // --- State Management ---
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [currentProfilePhoto, setCurrentProfilePhoto] = useState(defaultImg);
  const [fileToUpload, setFileToUpload] = useState(null);

  // State for Description and Edit Mode
  const [description, setDescription] = useState("Add a description...");
  const [isEditing, setIsEditing] = useState(false);

  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const navigate = useNavigate();
  // ------------------------

  // 1. Fetch User Data (Updated to include profilePhoto and description)
  useEffect(() => {
    const fetchUserData = async () => {
      if (!targetUserId) return;

      try {
        const userDoc = await getDoc(doc(db, "users", targetUserId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username);
          setRole(data.userType);

          setCurrentProfilePhoto(data.profilePhoto || defaultImg);
          setDescription(data.description || "Add a description...");
        } else {
          setUsername(user?.displayName || "Unknown User");
          setRole("Community Volunteer");
          setDescription("No description available.");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, [targetUserId, user]);

  // 2. Fetch User Posts (Remains the same - uses correct 'createdAt' ordering)
  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!targetUserId) {
        setLoadingPosts(false);
        return;
      }

      setLoadingPosts(true);
      const postCollections = [
        "stray_animal_posts",
        "lost_pet_posts",
        "unknown_status",
      ];
      const allPosts = [];

      try {
        for (const collectionName of postCollections) {
          const postsQuery = query(
            collection(db, collectionName),
            where("userId", "==", targetUserId),
            orderBy("createdAt", "desc")
          );

          const querySnapshot = await getDocs(postsQuery);

          querySnapshot.forEach((doc) => {
            allPosts.push({
              id: doc.id,
              ...doc.data(),
              postType:
                collectionName === "stray_animal_posts"
                  ? "Stray Animal Report"
                  : collectionName === "lost_pet_posts"
                  ? "Lost Pet Report"
                  : "Unknown Status",
            });
          });
        }

        setUserPosts(allPosts);
      } catch (error) {
        // This will catch the Firebase Index error if it wasn't created
        console.error("Error fetching user posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [targetUserId]);

  // 3. PROFILE PHOTO CHANGE HANDLER
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      // Display the temporary image URL immediately
      setCurrentProfilePhoto(URL.createObjectURL(file));
    }
  };

  // 4. PROFILE SAVE HANDLER
  const handleSave = async () => {
    if (!user) return;
    setIsEditing(false); // Exit edit mode immediately

    try {
      let photoURL = currentProfilePhoto;

      // A. Handle Photo Upload (only if a new file was selected)
      if (fileToUpload) {
        const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
        const snapshot = await uploadBytes(storageRef, fileToUpload);
        photoURL = await getDownloadURL(snapshot.ref);

        setFileToUpload(null);
      }

      // B. Save all profile data to Firestore
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        profilePhoto: photoURL,
        description: description,
      });

      // Update UI state with the final URL
      setCurrentProfilePhoto(photoURL);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
      setIsEditing(true);
    }
  };

  // Existing handleLogout function remains the same
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

  // --- JSX RETURN ---
  return (
    <div className="max-w-[600px] mx-auto h-auto space-y-8">
      <div className="border border-gray-200 shadow-sm flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 rounded-sm overflow-hidden bg-[#fafafa]">
        <main className="w-screen space-y-2 p-2">
          <h1 className="font-semibold text-xl text-center">
            {isOwner ? "Your Profile" : `${username}'s Profile`}
          </h1>
          <div className="flex justify-center items-center flex-col space-y-2">
            {/* 1. Profile Picture and Change Overlay */}
            <div className="relative group w-24 h-24 flex justify-center items-center m-2">
              <img
                src={currentProfilePhoto}
                alt="User profile"
                className="w-24 h-24 rounded-full object-cover mt-4 mb-2 relative"
              />
              {/* Show 'Change' overlay only if the owner is editing */}
              {isOwner && isEditing && (
                <label
                  htmlFor="fileInput"
                  className="absolute inset-x-0 inset-y-1 flex items-center w-24 h-24 rounded-full bg-black/50 justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                >
                  <span className="text-white text-sm">Change</span>
                </label>
              )}
              <input
                id="fileInput"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                className="hidden"
                disabled={!isEditing}
              />
            </div>

            {/* 2. Username and Role */}
            <h2 className="text-base font-semibold">
              {username || "Loading..."}
            </h2>
            <h3 className="text-sm text-gray-500">{role || "Loading..."}</h3>

            {/* 3. Description Field (Editable for Owner) */}
            {isOwner && isEditing ? (
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows="3"
                maxLength="150"
                className="w-full max-w-xs text-sm text-gray-700 p-2 border rounded-md resize-none"
              />
            ) : (
              <p className="text-gray-500 text-sm">{description}</p>
            )}

            {/* 4. Action Buttons (Edit, Save, Logout) */}
            <div className="flex justify-center gap-3 mt-4">
              {isOwner && !isEditing && (
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-200"
                >
                  Edit Profile
                </button>
              )}

              {isOwner && isEditing && (
                <button
                  type="button"
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-200"
                >
                  Save Changes
                </button>
              )}

              {/* Logout button remains outside the edit logic */}
              {isOwner && (
                <button
                  type="button"
                  onClick={handleLogout}
                  aria-label="Logout"
                  className="flex gap-2 items-center text-xl text-[#fafafa] bg-[rgb(40,112,56)] px-3 py-1 hover:bg-[rgb(43,81,51)] rounded-full duration-200 ease-in cursor-pointer"
                >
                  <i className="bi bi-box-arrow-right"></i>
                  <span className="hidden xl:block text-xs mt-1">Logout</span>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>

      {/* --- USER POSTS SECTION --- */}
      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4 border-b pb-2">
          {isOwner ? "Your Activity" : `${username}'s Posts`}
        </h2>

        {loadingPosts && (
          <p className="text-center text-gray-500">Loading posts...</p>
        )}

        {!loadingPosts && userPosts.length === 0 && (
          <p className="text-center text-gray-500">
            {username} hasn't made any posts yet.
          </p>
        )}

        {!loadingPosts && userPosts.length > 0 && (
          <div className="space-y-4">
            {userPosts.map((post) => (
              <PostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
      {/* --- END USER POSTS SECTION --- */}
    </div>
  );
}
