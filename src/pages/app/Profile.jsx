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
  writeBatch,
  serverTimestamp,
} from "firebase/firestore";

import { useAuth } from "../../context/AuthContext";
import defaultImg from "../../assets/default_img.jpg";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import { signOut } from "firebase/auth";
import { useNavigate, useParams } from "react-router-dom";

// --- Star Icon Helper Component ---
const StarRatingDisplay = ({ rating, count }) => {
  // Round rating to the nearest half for display
  const roundedRating = Math.round(rating * 2) / 2;
  const fullStars = Math.floor(roundedRating);
  const hasHalfStar = roundedRating % 1 !== 0;
  const emptyStars = 5 - Math.ceil(roundedRating);

  const stars = [];

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars.push(
      <i key={`full-${i}`} className="bi bi-star-fill text-yellow-500"></i>
    );
  }
  // Half star
  if (hasHalfStar) {
    stars.push(<i key="half" className="bi bi-star-half text-yellow-500"></i>);
  }
  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars.push(<i key={`empty-${i}`} className="bi bi-star text-gray-300"></i>);
  }

  return (
    <div className="flex items-center space-x-1 text-sm">
      {stars}
      <span className="ml-2 text-xs text-gray-500">
        ({rating.toFixed(1)} / {count} ratings)
      </span>
    </div>
  );
};

// --- Post Card Component (Assuming defined locally) ---
const PostCard = ({ post }) => (
  <div className="border border-gray-200 p-4 rounded-lg shadow-sm bg-white space-y-3">
    {" "}
    <div className="flex justify-between items-start">
      {" "}
      <p className="text-xs text-gray-500 font-medium">
        Type:{" "}
        <span className="font-semibold text-green-700">{post.postType}</span>{" "}
      </p>{" "}
      {post.createdAt && (
        <p className="text-xs text-gray-400">
          {post.createdAt.toDate().toLocaleDateString()}{" "}
        </p>
      )}{" "}
    </div>{" "}
    {post.photoURL && (
      <div className="flex justify-center p-2 bg-gray-50 rounded-lg">
        {" "}
        <img
          src={post.photoURL}
          alt={`${post.type} photo`}
          className="w-full h-auto max-h-96 object-contain rounded-sm"
        />{" "}
      </div>
    )}{" "}
    <div className="border-t pt-3">
      <p className="font-semibold text-sm mb-1">Description:</p>{" "}
      <p className="text-gray-700 text-sm">
        {post.description || "No detailed description available."}{" "}
      </p>{" "}
    </div>{" "}
    {post.address && (
      <div className="text-xs text-gray-500 italic mt-2">
        Location: {post.address}{" "}
      </div>
    )}{" "}
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

  const [averageRating, setAverageRating] = useState(0);
  const [ratingCount, setRatingCount] = useState(0);
  const [isRatingSubmitted, setIsRatingSubmitted] = useState(false);
  // ------------------------

  const [userPosts, setUserPosts] = useState([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const navigate = useNavigate();

  // 1. Fetch User Data (Includes Rating Data Check)
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

          const count = data.totalRatingCount || 0;
          const sum = data.totalRatingSum || 0;
          setRatingCount(count);
          setAverageRating(count > 0 ? sum / count : 0);
        } else {
          setUsername(user?.displayName || "Unknown User");
          setRole("Community Volunteer");
          setDescription("No description available.");
        }

        if (user?.uid && !isOwner) {
          const ratingDocRef = doc(
            db,
            "users",
            targetUserId,
            "ratings",
            user.uid
          );
          const ratingSnapshot = await getDoc(ratingDocRef);
          setIsRatingSubmitted(ratingSnapshot.exists());
        }
      } catch (error) {
        console.error("Error fetching user data: ", error);
      }
    };

    fetchUserData();
  }, [targetUserId, user, isOwner]);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!targetUserId) return; // don't query yet if undefined

      setLoadingPosts(true);
      try {
        const postsQuery = query(
          collection(db, "posts"),
          where("userId", "==", targetUserId),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(postsQuery);

        const allPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          postType: doc.data().status,
        }));

        console.log("Fetched posts:", allPosts); // ✅ Debug log
        setUserPosts(allPosts);
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    // ✅ Only fetch when targetUserId exists and user is loaded
    if (targetUserId || user) fetchUserPosts();
  }, [targetUserId, user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFileToUpload(file);
      setCurrentProfilePhoto(URL.createObjectURL(file));
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsEditing(false);

    try {
      let photoURL = currentProfilePhoto;

      if (fileToUpload) {
        const storageRef = ref(storage, `users/${user.uid}/profile.jpg`);
        const snapshot = await uploadBytes(storageRef, fileToUpload);
        photoURL = await getDownloadURL(snapshot.ref);
        setFileToUpload(null);
      }

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        profilePhoto: photoURL,
        description: description,
      });

      setCurrentProfilePhoto(photoURL);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile. Please try again.");
      setIsEditing(true);
    }
  };

  const handleRateUser = async (rating) => {
    if (!user?.uid || isOwner || isRatingSubmitted) return;

    // Use the logged-in user's UID as the rating document ID
    const ratingDocId = user.uid;
    const targetUserRef = doc(db, "users", targetUserId);
    const ratingDocRef = doc(targetUserRef, "ratings", ratingDocId);

    try {
      const batch = writeBatch(db);

      // 1. Set document in the ratings sub-collection (to track individual votes)
      batch.set(ratingDocRef, {
        raterId: user.uid,
        rating: rating,
        createdAt: serverTimestamp(),
      });

      // 2. Update the main user document metadata (Atomic Update)
      batch.update(targetUserRef, {
        totalRatingSum: averageRating * ratingCount + rating,
        totalRatingCount: ratingCount + 1,
      });

      await batch.commit();

      // 3. Update local UI states
      const newCount = ratingCount + 1;
      const newSum = averageRating * ratingCount + rating;

      setRatingCount(newCount);
      setAverageRating(newSum / newCount);
      setIsRatingSubmitted(true);
      alert(`You rated ${username} ${rating} stars!`);
    } catch (error) {
      console.error("Error submitting rating:", error);
      alert("Failed to submit rating. Please try again.");
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

  // --- JSX RETURN ---
  return (
    <div className=" h-auto space-y-8">
      <div className="border border-gray-200 shadow-sm flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 rounded-lg overflow-hidden bg-[#fafafa]">
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

            {/* 🚨 RATING DISPLAY */}
            {(ratingCount > 0 || !isOwner) && (
              <StarRatingDisplay rating={averageRating} count={ratingCount} />
            )}

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

            {/* 🚨 RATING INPUT (Visible only if NOT owner, NOT rated, and Logged In) */}
            {!isOwner && !isRatingSubmitted && user?.uid && (
              <div className="mt-4 p-3 border rounded-lg bg-white shadow-sm">
                <p className="text-sm font-semibold mb-2 text-gray-700">
                  Rate this user:
                </p>
                <div className="flex justify-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => handleRateUser(star)}
                      className="text-2xl text-yellow-500 hover:scale-110 transition duration-100 ease-in-out focus:outline-none"
                      aria-label={`Rate ${star} stars`}
                    >
                      <i className="bi bi-star-fill"></i>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Display confirmation if rated */}
            {!isOwner && isRatingSubmitted && (
              <p className="mt-4 text-sm text-green-600 font-medium">
                <i className="bi bi-check-circle-fill mr-1"></i>
                Thank you for your rating!
              </p>
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
