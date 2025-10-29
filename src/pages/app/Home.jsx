import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";

import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from "firebase/firestore";

import AddPost from "./components/AddPost";
import EditPostModal from "./components/EditPostModal";
import defaultImg from "../../assets/default_img.jpg";
import { OrbitProgress } from "react-loading-indicators";
import Filter from "./components/Filter";

// Helper function to determine the Firestore collection name based on post type
const getCollectionName = (postType) => {
  if (postType === "Stray") return "stray_animal_posts";
  if (postType === "Lost") return "lost_pet_posts";
  if (postType === "Unknown") return "unknown_status";
  return null;
};

export default function Home() {
  const { user } = useAuth();
  const [isOpenPost, setIsOpenPost] = useState(false);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);

  const [currentUserProfile, setCurrentUserProfile] = useState({
    photoURL: defaultImg,
    username: user?.displayName || "Guest",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;

      try {
        // Fetch user document from the 'users' collection
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCurrentUserProfile({
            // Prioritize profilePhoto from Firestore, fall back to default
            photoURL: data.profilePhoto || defaultImg,
            // Prioritize username from Firestore, fall back to Auth display name
            username: data.username || user.displayName,
          });
        }
      } catch (error) {
        console.error("Error fetching current user profile:", error);
      }
    };

    fetchUserProfile();
  }, [user]); // Reruns when the user object initializes

  // ------------------------------------------
  // 2. EDIT/UPDATE FUNCTIONALITY
  // ------------------------------------------
  const handleEditPost = (post) => {
    setPostToEdit(post);
    setIsEditing(true);
  };

  const handleUpdatePost = async (postId, postType, updatedData) => {
    const collectionName = getCollectionName(postType);
    if (!collectionName) {
      console.error("Unknown post type:", postType);
      return;
    }

    try {
      const postRef = doc(db, collectionName, postId);
      await updateDoc(postRef, updatedData);

      // Update the local state (UI) immediately
      setPosts((prevPosts) =>
        prevPosts.map((post) =>
          post.id === postId ? { ...post, ...updatedData } : post
        )
      );
      console.log(`Post ${postId} updated successfully in ${collectionName}.`);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post. Please try again.");
    }
  };

  // ------------------------------------------
  // 3. DELETE FUNCTIONALITY
  // ------------------------------------------
  const handleDeletePost = async (postId, postType) => {
    if (!window.confirm("Are you sure you want to delete this post?")) {
      return;
    }

    const collectionName = getCollectionName(postType);
    if (!collectionName) {
      console.error("Unknown post type:", postType);
      return;
    }

    try {
      const postRef = doc(db, collectionName, postId);
      await deleteDoc(postRef);

      // Update the local state (UI)
      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      console.log(
        `Post ${postId} deleted successfully from ${collectionName}.`
      );
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  // ------------------------------------------
  // 4. FETCH ALL POSTS (FEED CONTENT)
  // ------------------------------------------
  useEffect(() => {
    const fetchAllPosts = async () => {
      setIsLoading(true);
      try {
        const strayRef = collection(db, "stray_animal_posts");
        const lostRef = collection(db, "lost_pet_posts");
        const unknownRef = collection(db, "unknown_status");

        const [straySnap, lostSnap, unknownSnap] = await Promise.all([
          getDocs(query(strayRef, orderBy("createdAt", "desc"))),
          getDocs(query(lostRef, orderBy("createdAt", "desc"))),
          getDocs(query(unknownRef, orderBy("createdAt", "desc"))),
        ]);

        const strayPosts = straySnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "Stray",
        }));

        const lostPosts = lostSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "Lost",
        }));

        const unknownPosts = unknownSnap.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          type: "Unknown",
        }));

        const combined = [...strayPosts, ...lostPosts, ...unknownPosts].sort(
          (a, b) => {
            const aDate = a.createdAt?.toDate?.() || new Date(0);
            const bDate = b.createdAt?.toDate?.() || new Date(0);
            return bDate - aDate;
          }
        );

        // Perform reverse geocoding
        const updatedPosts = await Promise.all(
          combined.map(async (post) => {
            if (post.location?.lat && post.location?.lng) {
              const url = `https://nominatim.openstreetmap.org/reverse?lat=${post.location.lat}&lon=${post.location.lng}&format=json&accept-language=en`;
              try {
                const response = await fetch(url);
                const data = await response.json();
                const address = data.display_name || "Address not found";
                return { ...post, address };
              } catch (error) {
                console.error("Reverse geocoding error:", error);
                return { ...post, address: "Address error" };
              }
            }
            return { ...post, address: "No coordinates" };
          })
        );

        setPosts(updatedPosts);
      } catch (error) {
        console.error("Error fetching posts:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAllPosts();
  }, []);

  return (
    <div className="max-w-[700px] space-y-4">
      <EditPostModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        post={postToEdit}
        onUpdate={handleUpdatePost}
      />

      {/* Create Post and Filter Sections */}
      <div className=" flex justify-between items-stretch gap-2">
        <div className="flex-1 w-[700px] flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 rounded-sm border border-gray-200 shadow-sm bg-[#fafafa]">
          <img
            src={currentUserProfile.photoURL}
            alt="User profile picture"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div
            onClick={() => setIsOpenPost(true)}
            className="flex-1 border border-gray-300 cursor-pointer rounded-3xl bg-gray-100 hover:bg-gray-200 transition duration-200 ease-in-out"
          >
            <p className="w-full text-left p-2 text-gray-500 font-medium cursor-pointer">
              Create a post
            </p>
          </div>
        </div>

        {/* Filter section */}
        <div
          onClick={() => setIsOpenFilter(true)}
          className="bg-[#fafafa] flex flex-col items-center justify-center text-gray-500 border-gray-200 shadow-sm border rounded-sm p-4 hover:bg-gray-200 transition-all duration-200 ease-in-out cursor-pointer"
        >
          <i className="bi bi-filter text-2xl"></i>
          <p className="text-[10px]">Filter</p>
        </div>
      </div>

      <Filter isOpen={isOpenFilter} onClose={() => setIsOpenFilter(false)} />
      <AddPost isOpen={isOpenPost} onClose={() => setIsOpenPost(false)} />

      {isLoading ? (
        <div className="flex justify-center py-10">
          <OrbitProgress color="#2e7d32" size="large" />
        </div>
      ) : posts.length === 0 ? (
        <div className="flex justify-center text-gray-500 italic font-medium text-xl">
          <p>No posts yet...</p>
        </div>
      ) : (
        posts.map((post) => {
          const profilePath =
            post.userId === user?.uid ? "/profile" : `/profile/${post.userId}`;

          const isOwner = user?.uid === post.userId;

          return (
            <div
              key={post.id}
              className=" bg-[#fafafa] border border-gray-200 shadow-sm p-5 rounded-sm text-sm"
            >
              {/* Post header */}
              <div className="border-b border-gray-200">
                <div className="flex justify-between items-start pb-2">
                  <div className="flex h-full items-center">
                    {/* 🚨 FIX: Post Avatar */}
                    <img
                      src={isOwner ? currentUserProfile.photoURL : defaultImg}
                      alt="Profile"
                      className="w-15 h-15 rounded-full object-cover"
                    />

                    <div className="pl-2 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Link
                          to={profilePath}
                          className="text-base font-semibold hover:underline cursor-pointer"
                        >
                          {/* 🚨 FIX: Post Username */}
                          {isOwner
                            ? currentUserProfile.username
                            : post.username}
                        </Link>
                        <p className="text-[11px] text-gray-600">
                          {post.createdAt?.toDate
                            ? post.createdAt.toDate().toLocaleString()
                            : "Just now"}
                        </p>
                      </div>
                      <span
                        className={`text-xs p-1 border rounded-sm ${
                          post.status === "Stray"
                            ? "bg-red-100 text-red-700 border-red-300"
                            : post.status === "Lost Pet"
                            ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                            : "bg-gray-100 text-gray-700 border-gray-300"
                        }`}
                      >
                        {post.status}
                      </span>
                    </div>
                  </div>

                  {/* Edit/Delete Buttons */}
                  {isOwner && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditPost(post)}
                        className="text-xs text-blue-600 hover:text-blue-800 transition duration-150 ease-in-out"
                      >
                        <i className="bi bi-pencil-square"></i> Edit
                      </button>
                      <button
                        onClick={() => handleDeletePost(post.id, post.type)}
                        className="text-xs text-red-600 hover:text-red-800 transition duration-150 ease-in-out"
                      >
                        <i className="bi bi-trash"></i> Delete
                      </button>
                    </div>
                  )}
                </div>

                {/* Description */}
                <p>{post.description}</p>

                {/* Dog characteristics */}
                <div className="flex py-1 gap-3">
                  <span className="text-xs p-1 border bg-green-100 text-green-700 border-green-300 rounded-sm">
                    {post.color}
                  </span>

                  {post.breed && (
                    <span className="text-xs p-1 border bg-green-100 text-green-700 border-green-300  rounded-sm">
                      {post.breed}
                    </span>
                  )}
                </div>

                {/* Photo */}
                <div className="flex justify-center p-3">
                  <img
                    src={post.photoURL}
                    alt="Posted"
                    className="w-100 rounded-sm"
                  />
                </div>

                {/* Location */}
                <div className="py-1 italic text-gray-400 text-sm">
                  {post.address
                    ? post.address
                    : post.location
                    ? `Latitude: ${post.location.lat.toFixed(
                        5
                      )}, Longitude: ${post.location.lng.toFixed(5)}`
                    : "Location not available"}
                </div>
              </div>

              <div className="flex flex-1 justify-between xl:justify-around px-2 pt-3 text-sm text-gray-500 font-medium">
                <div className="flex items-center gap-2">
                  <i className="bi bi-hand-thumbs-up"></i>
                  <p>Like</p>
                </div>
                <div className="flex items-center gap-2">
                  <i className="bi bi-chat"></i>
                  <p>Comment</p>
                </div>
                <div className="flex items-center gap-2">
                  <i className="bi bi-arrow-90deg-right"></i>
                  <p>Repost</p>
                </div>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
