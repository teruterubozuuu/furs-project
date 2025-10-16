import React, { useEffect, useState } from "react";
import { storage, db, auth } from "../../firebase/config";
import {
  doc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  updateDoc, // <-- Included updateDoc for handleSave, assuming it was needed
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext";
import defaultImg from "../../assets/default_img.jpg";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { signOut } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom"; // <-- Added useParams

// --- Post Card Component (Placeholder - Customize this to match your real post design) ---
const PostCard = ({ post }) => (
  <div className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white">
    <div className="flex justify-between items-start mb-2">
      <p className="text-xs text-gray-500 font-medium">
        Type:{" "}
        <span className="font-semibold text-green-700">{post.postType}</span>
      </p>
      {/* Optional: Display timestamp */}
      {post.timestamp && (
        <p className="text-xs text-gray-400">
          {new Date(post.timestamp.toDate()).toLocaleDateString()}
        </p>
      )}
    </div>

    {/* Assuming your posts have a 'content' field */}
    <p className="text-gray-700 mt-1 line-clamp-3">
      {post.content || "Post content preview..."}
    </p>
  </div>
);
// ----------------------------------------

export default function Profile() {
  const { user } = useAuth();
  const { userId: urlUserId } = useParams();

  // Determine the target user's ID: URL param or logged-in user's ID
  const targetUserId = urlUserId || user?.uid;

  // Check if the profile being viewed is the logged-in user's
  const isOwner = user?.uid === targetUserId;

  // --- State Management ---
  const [username, setUsername] = useState("");
  const [role, setRole] = useState("");
  const [profilePhoto, setProfilePhoto] = useState(defaultImg);
  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const navigate = useNavigate();
  // ------------------------

  // 1. Fetch User Data based on targetUserId
  useEffect(() => {
    const fetchUserData = async () => {
      if (!targetUserId) return;

      try {
        const userDoc = await getDoc(doc(db, "users", targetUserId));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUsername(data.username);
          setRole(data.userType);
          // Add logic to setProfilePhoto from data if available
        } else {
          setUsername(user?.displayName || "Unknown User");
          setRole("Community Volunteer");
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, [targetUserId, user]);

  // 2. Fetch User Posts from both collections
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
          // Query: filter by userId and order by timestamp
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
                  : "Lost Pet Report",
            });
          });
        }

        setUserPosts(allPosts);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    fetchUserPosts();
  }, [targetUserId]);

  // --- Existing Handlers ---
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfilePhoto(imageUrl);
    }
  };

  const handleSave = async () => {
    // You'll need to update this to upload the file object itself, not the URL
    // If profilePhoto is a File object, this should work.
    if (!user || !profilePhoto) return;

    try {
      const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
      // Assuming profilePhoto holds the file object after handlePhotoChange
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

  // ---------------------------------------------------

  return (
    <div className="max-w-[600px] mx-auto h-auto space-y-8">
      <div className="border border-gray-200 shadow-sm flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 rounded-sm overflow-hidden bg-[#fafafa]">
        <main className="w-screen space-y-2 p-2">
          <h1 className="font-semibold text-xl text-center">
            {isOwner ? "Your Profile" : `${username}'s Profile`}
          </h1>
          <div className="flex justify-center items-center flex-col space-y-2">
            <div className="relative group w-24 h-24 flex justify-center items-center m-2">
              <img
                src={profilePhoto}
                alt="User profile"
                className="w-24 h-24 rounded-full object-cover mt-4 mb-2 relative"
              />
              {/* Show 'Change' overlay only for the owner */}
              {isOwner && (
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
              />
            </div>
            <h2 className="text-base font-semibold">
              {username || "Loading..."}
            </h2>
            <h3 className="text-sm text-gray-500">{role || "Loading..."}</h3>
            <p className="text-gray-500 text-sm">Add a description...</p>

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
