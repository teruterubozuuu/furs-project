import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { db } from "../../firebase/config";
import {
  collection,
  query,
  orderBy,
  doc,
  getDoc,
  deleteDoc,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";

import AddPost from "./components/AddPost";
import EditPostModal from "./components/EditPostModal";
import defaultImg from "../../assets/default_img.jpg";
import { OrbitProgress } from "react-loading-indicators";
import Filter from "./components/Filter";


const getCollectionName = (postType) => {
  if (postType === "Stray Animal") return "stray_animal_posts";
  if (postType === "Lost Pet") return "lost_pet_posts";
  if (postType === "Unknown") return "unknown_status";
  return "posts";
};

export default function Home() {
  const { user } = useAuth();
  const [isOpenPost, setIsOpenPost] = useState(false);
  const [isOpenFilter, setIsOpenFilter] = useState(false);
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [postMenu, setPostMenu] = useState(false);
  const [openMenuId, setOpenMenuId] = useState(null);

  const [isEditing, setIsEditing] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);


  const [currentUserProfile, setCurrentUserProfile] = useState({
    photoURL: defaultImg,
    username: user?.displayName || "Guest",
  });


  const [filters, setFilters] = useState({
    reportType: "",
    selectedColors: [],
  });


  const handleApplyFilter = ({ reportType, selectedColors }) => {
    setFilters({ reportType, selectedColors });
  };


  // 1. FETCH CURRENT USER PROFILE DATA
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.uid) return;

      try {

        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setCurrentUserProfile({
            photoURL: data.profilePhoto || defaultImg,
            username: data.username || user.displayName,
          });
        }
      } catch (error) {
        console.error("Error fetching current user profile:", error);
      }
    };

    fetchUserProfile();
  }, [user]); 

  // 2. EDIT/UPDATE FUNCTIONALITY
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


  // 3. DELETE FUNCTIONALITY
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


      setPosts((prevPosts) => prevPosts.filter((post) => post.id !== postId));
      console.log(
        `Post ${postId} deleted successfully from ${collectionName}.`
      );
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };


  // 4. FETCH ALL POSTS (FEED CONTENT) 
  useEffect(() => {
    setIsLoading(true);

    const postsRef = collection(db, "posts");

    const unsubPosts = onSnapshot(
      query(postsRef, orderBy("createdAt", "desc")),
      (snapshot) => handleSnapshot(snapshot, "General")
    );

    return () => {
      unsubPosts();
    };
  }, []);

  // 5. HELPER: Handle snapshot updates
  const handleSnapshot = async (snapshot, type) => {
    const newPosts = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        if (data.location?.lat && data.location?.lng) {
          try {
            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${data.location.lat}&lon=${data.location.lng}&format=json&accept-language=en`
            );
            const json = await res.json();
            return {
              id: docSnap.id,
              ...data,
              type,
              address: json.display_name || "Address not found",
            };
          } catch {
            return { id: docSnap.id, ...data, type, address: "Address error" };
          }
        }
        return { id: docSnap.id, ...data, type, address: "No coordinates" };
      })
    );

    setPosts((prev) => {
      const others = prev.filter((p) => p.type !== type);
      const merged = [...others, ...newPosts];
      return merged.sort((a, b) => {
        const aDate = a.createdAt?.toDate?.() || new Date(0);
        const bDate = b.createdAt?.toDate?.() || new Date(0);
        return bDate - aDate;
      });
    });

    setIsLoading(false);
  };

  return (
    <div className="space-y-3 ">
      <EditPostModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        post={postToEdit}
        onUpdate={handleUpdatePost}
      />

      {/* Create Post and Filter Sections */}
      <div className=" flex justify-between items-stretch gap-2 max-w-[700px] w-full">
        <div className="flex-1 flex flex-wrap sm:flex-nowrap items-center gap-3 px-4 rounded-lg border border-gray-200 shadow-sm bg-[#fafafa]">
          <img
            // 🚨 UPDATED: Use the fetched profile photo URL
            src={currentUserProfile.photoURL}
            alt="User profile picture"
            className="w-8 h-auto rounded-full object-cover flex-shrink-0"
          />
          <div
            onClick={() => setIsOpenPost(true)}
            className="flex-1 border border-gray-300 cursor-pointer rounded-3xl bg-gray-100 hover:bg-gray-200 transition duration-200 ease-in-out"
          >
            <p className="w-full text-left p-1 px-2 text-gray-500 font-medium cursor-pointer">
              Create a post
            </p>
          </div>
        </div>

        {/* Filter section */}
        <div
          onClick={() => setIsOpenFilter(true)}
          className="bg-[#fafafa] flex flex-col items-center justify-center text-gray-500 border-gray-200 shadow-sm border rounded-lg p-4 hover:bg-gray-200 transition-all duration-200 ease-in-out cursor-pointer"
        >
          <i className="bi bi-filter text-2xl"></i>
          <p className="text-[10px]">Filter</p>
        </div>
      </div>

      <Filter
        isOpen={isOpenFilter}
        onClose={() => setIsOpenFilter(false)}
        onApply={handleApplyFilter}
      />
      <AddPost isOpen={isOpenPost} onClose={() => setIsOpenPost(false)} />

      {/*POST*/}
      {isLoading ? (
        <div className="flex justify-center py-10 xl:w-[700px]">
          <OrbitProgress color="#2e7d32" size="large" />
        </div>
      ) : (
        (() => {
          // Filter logic
          const filteredPosts = posts.filter((post) => {
            const matchesReportType =
              !filters.reportType || post.status === filters.reportType;

            const matchesColor =
              filters.selectedColors.length === 0 ||
              filters.selectedColors.includes(post.coatColor);

            return matchesReportType && matchesColor;
          });

          if (filteredPosts.length === 0) {
            return (
              <div className="flex w-[650px] justify-center text-gray-500 italic font-medium text-xl mt-5">
                <p>No matching posts...</p>
              </div>
            );
          }

          return filteredPosts.map((post) => {
            const profilePath =
              post.userId === user?.uid
                ? "/profile"
                : `/profile/${post.userId}`;
            const isOwner = user?.uid === post.userId;

            return (
              <div
                key={post.id}
                className=" bg-[#fafafa] border border-gray-200 shadow-sm p-5 rounded-lg text-sm"
              >
                {/* Post header */}
                <div className="border-b border-gray-200">
                  <div className="flex justify-between items-start pb-2">
                    <div className="flex h-full items-center">
                      {/* 🚨 FIX: Post Avatar */}
                      <img
                        src={
                          isOwner
                            ? currentUserProfile.photoURL
                            : post.userPhoto || defaultImg
                        }
                        alt="Profile"
                        className="w-14 h-14 rounded-full object-cover"
                      />

                      <div className="pl-2">
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
                              ? post.createdAt
                                  .toDate()
                                  .toLocaleString("en-US", {
                                    year: "numeric",
                                    month: "short",
                                    day: "numeric",
                                    hour: "numeric",
                                    minute: "2-digit",
                                    hour12: true,
                                  })
                              : "Just now"}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs p-1 border rounded-sm ${
                              post.status === "Stray Animal"
                                ? "bg-red-100 text-red-700 border-red-300"
                                : post.status === "Lost Pet"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                : "bg-gray-100 text-gray-700 border-gray-300"
                            }`}
                          >
                            {post.status}
                          </span>
                          {/* Dog characteristics */}
                          <div className="flex py-1 gap-2">
                            <span className="text-xs p-1 border bg-green-100 text-green-700 border-green-300 rounded-sm">
                              {post.coatColor}
                            </span>

                            {post.breed && (
                              <span className="text-xs p-1 border bg-green-100 text-green-700 border-green-300 rounded-sm">
                                {post.breed}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Edit/Delete Buttons */}
                    <div>
                      {isOwner && (
                        <div className="relative flex flex-col items-end">
                          {/* Post Menu */}
                          <div className="relative flex flex-col items-end">
                            {/* Post Menu Button */}
                            <i
                              onClick={() =>
                                setOpenMenuId(
                                  openMenuId === post.id ? null : post.id
                                )
                              }
                              className="cursor-pointer bi bi-three-dots text-gray-500 hover:text-gray-700 font-medium transition duration-150 ease-in-out text-lg flex justify-end"
                            ></i>

                            {/* Dropdown Menu */}
                            {openMenuId === post.id && (
                              <div className="flex flex-col items-start border border-gray-200 bg-white w-[80px] rounded-md absolute top-5 right-0 z-10 shadow-sm">
                                <button
                                  onClick={() => {
                                    handleEditPost(post);
                                    setOpenMenuId(null);
                                  }}
                                  className="cursor-pointer text-xs text-start pl-3 text-gray-600 w-full hover:bg-gray-200 transition duration-150 ease-in-out py-2"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() => {
                                    handleDeletePost(post.id, post.type);
                                    setOpenMenuId(null);
                                  }}
                                  className="cursor-pointer text-xs text-start pl-3 text-gray-600 w-full hover:bg-gray-200 transition duration-150 ease-in-out py-2"
                                >
                                  Delete
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Description */}
                  <p>{post.description}</p>

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
          });
        })()
      )}
    </div>
  );
}
