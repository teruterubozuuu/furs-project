import React, { useEffect, useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
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
  increment,
  setDoc,
} from "firebase/firestore";

import AddPost from "./components/AddPost";
import EditPostModal from "./components/EditPostModal";
import defaultImg from "../../assets/default_img.jpg";
import { OrbitProgress } from "react-loading-indicators";
import Filter from "./components/Filter";
import { useAuth } from "../../context/AuthContext";

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
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [userType, setUserType] = useState("");
  const navigate = useNavigate();

  const [currentUserProfile, setCurrentUserProfile] = useState({
    photoURL: defaultImg,
    username: user?.displayName || "Guest",
  });

  const [filters, setFilters] = useState({
    reportType: "",
    selectedColors: [],
  });

  const handleLike = async (postId, postType) => {
    if (!user) {
      alert("Please log in to like posts.");
      return;
    }

    const collectionName = getCollectionName(postType);
    const postRef = doc(db, collectionName, postId);
    const likeRef = doc(db, collectionName, postId, "likes", user.uid);

    try {
      const likeSnap = await getDoc(likeRef);

      if (likeSnap.exists()) {
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likes: increment(-1) });

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likes: (p.likes || 1) - 1, isLikedByUser: false }
              : p
          )
        );
      } else {
        await setDoc(likeRef, { userId: user.uid, timestamp: new Date() });
        await updateDoc(postRef, { likes: increment(1) });

        setPosts((prev) =>
          prev.map((p) =>
            p.id === postId
              ? { ...p, likes: (p.likes || 0) + 1, isLikedByUser: true }
              : p
          )
        );
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

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
          setUserType(data.userType || "");
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
      (snapshot) => handleSnapshot(snapshot)
    );

    return () => {
      unsubPosts();
    };
  }, [user]);

// 5. HELPER: Handle snapshot updates
  const handleSnapshot = async (snapshot) => {
    const newPosts = await Promise.all(
      snapshot.docs.map(async (docSnap) => {
        const data = docSnap.data();
        let isLikedByUser = false;

        // Fetch like status (Fast Firestore check)
        if (user?.uid) {
          const likeRef = doc(db, "posts", docSnap.id, "likes", user.uid);
          const likeSnap = await getDoc(likeRef);
          isLikedByUser = likeSnap.exists();
        }

        // Return the post data immediately without the address
        return {
          id: docSnap.id,
          ...data,
          type: "General", // Changed from 'type' to a fixed type for this example
          isLikedByUser,
          // Set initial address to a placeholder
          address: data.location?.lat ? "Fetching address..." : "No coordinates",
        };
      })
    );

    



const merged = newPosts.sort((a, b) => {
      const aDate = a.createdAt?.toDate?.() || new Date(0);
      const bDate = b.createdAt?.toDate?.() || new Date(0);
      return bDate - aDate;
    });
    
    setPosts(merged);
    setIsLoading(false);

    fetchAddressesForPosts(merged);

    
  };

  // 6. NEW HELPER: Fetch addresses using the Firebase Function proxy
  const fetchAddressesForPosts = async (currentPosts) => {
    const promises = currentPosts.map(async (post) => {
      if (!post.location?.lat) return post; 

      //const functionUrl = '/api/reverse'; 
      // For local testing: 
      const functionBaseUrl = window.location.hostname === "localhost"
    ? "http://127.0.0.1:5001/furs-project-7a0a3/us-central1/api" // Local emulator
    : "https://us-central1-furs-project-7a0a3.cloudfunctions.net/api"; // Production
      
      try {
        // 2. Append the Express route '/reverse' and the query parameters
        const res = await fetch(
          `${functionBaseUrl}/reverse?lat=${post.location.lat}&lon=${post.location.lng}`
        );

        const json = await res.json();
        const address = json.display_name || "Address not found";
        return { ...post, address };
      } catch (error) {
        console.error("Function/Reverse geocoding error:", error);
        return { ...post, address: "Address error" };
      }
    });

    const updatedPosts = await Promise.all(promises);
    

    setPosts(prevPosts => {
        const map = new Map(updatedPosts.map(p => [p.id, p]));
        return prevPosts.map(p => map.get(p.id) || p);
    });
  };


  return (
    <div className="max-w-[700px] space-y-4">
            {isEditing && postToEdit && (
              <EditPostModal
                isOpen={isEditing}
                onClose={() => setIsEditing(false)}
                post={postToEdit}
                onUpdate={handleUpdatePost}
              />
            )}
      <div className=" flex flex-1 flex-wrap sm:flex-nowrap max-w-[700px]  justify-between items-stretch gap-2">
        {userType !== "" && (
          <div
            className={
              userType === "Rescuer"
                ? "hidden"
                : "flex-1 flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 rounded-sm border border-gray-200 shadow-sm bg-[#fafafa]"
            }
          >
            <img
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
        )}

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
              !filters.reportType ||
              filters.reportType === "All" ||
              post.status === filters.reportType;

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
                className="mb-3 bg-[#fafafa] border border-gray-200 hover:bg-[#f1f1f1] transition-all ease-in shadow-sm p-5 rounded-lg text-sm cursor-pointer"
              >
                {/* Post header */}
                <div className="border-b border-gray-200">
                  <div className="flex justify-between items-start pb-2">
                    <div className="flex h-full items-center ">
                      {/* 🚨 FIX: Post Avatar */}
                      <img
                        src={
                          isOwner
                            ? currentUserProfile.photoURL
                            : post.userPhoto || defaultImg
                        }
                        alt="Profile"
                        className="w-17 h-17 rounded-full object-cover"
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
                          <div className="md:flex md:flex-row flex-col gap-1">
                            <div className="flex items-center gap-1">

                          <span
                            className={`text-[10px] p-1 border rounded-sm ${
                              post.status === "Stray Animal"
                                ? "bg-red-100 text-red-700 border-red-300"
                                : post.status === "Lost Pet"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                                : "bg-gray-100 text-gray-700 border-gray-300"
                            }`}
                          >
                            {post.status}
                          </span>


                            {post.animalType && (
                              <span className={`text-[10px] flex items-center p-1 border rounded-sm ${
                              post.animalType === "Dog"
                                ? "bg-blue-100 text-blue-700 border-blue-300"
                                : post.animalType === "Cat"
                                ? "bg-orange-100 text-orange-700 border-orange-300"
                                : "bg-gray-100 text-gray-700 border-gray-300"
                            }`}>
                                {post.animalType}
                              </span>
                            )}
                            </div>
                          {/* Dog characteristics */}
                          <div className="flex py-1 gap-1">


                            {post.breed && (
                              <span className="text-[10px] flex items-center  p-1 border bg-green-100 text-green-700 border-green-300 rounded-sm">
                                {post.breed}
                              </span>
                            )}

                            <span className="text-[10px] flex items-center  p-1 border bg-green-100 text-green-700 border-green-300 rounded-sm">
                              {post.coatColor}
                            </span>
                          </div>
                          
                        </div>


                      </div>
                      
                    </div>

                    {/* Edit/Delete Buttons */}
                    <div className="flex items-center gap-2">
                      {isOwner && (
                        <div className="relative flex flex-col items-end">
                          {/* Post Menu */}
                          <div className="relative flex flex-col items-end">
                            {/* Post Menu Button */}
                            <i
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                setOpenMenuId(
                                  openMenuId === post.id ? null : post.id
                                );
                              }}
                              className="cursor-pointer bi bi-three-dots text-gray-500 hover:text-gray-700 font-medium transition duration-150 ease-in-out text-lg flex justify-end"
                            ></i>

                            {/* Dropdown Menu */}
                            {openMenuId === post.id && (
                              <div className="flex flex-col items-start border border-gray-200 bg-white w-[80px] rounded-md absolute top-5 right-0 z-10 shadow-sm">
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    handleEditPost(post);
                                    setOpenMenuId(null);
                                  }}
                                  className="cursor-pointer text-xs text-start pl-3 text-gray-600 w-full hover:bg-gray-200 transition duration-150 ease-in-out py-2"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
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

                  <Link to={`/${post.username}/status/${post.id}`}>
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
                                          {post.location?.landmark && (
                        <p className="mt-1 italic text-gray-500">
                          <span className="font-semibold text-gray-500">
                            Landmark:
                          </span>{" "}
                          {post.location.landmark}
                        </p>
                      )}
                    <div className="py-1 text-sm text-gray-500">
                      {post.address ? (
                       <p className="italic"> <span className="font-semibold">Address:</span>  {post.address}</p>
                      ) : post.location ? (
                        <p className="italic">
                          Latitude: {post.location.lat.toFixed(5)}, Longitude:{" "}
                          {post.location.lng.toFixed(5)}
                        </p>
                      ) : (
                        <p className="italic">Location not available</p>
                      )}

                    </div>
                  </Link>
                </div>
                {/* Post actions */}
                <Link to={`/${post.username}/status/${post.id}`}>
                  <div className="flex flex-1 justify-between xl:justify-around px-2 pt-3 text-md text-gray-500 font-medium">
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        handleLike(post.id, post.type);
                      }}
                      className="group cursor-pointer flex items-center gap-1"
                    >
                      <i
                        className={`bi ${
                          post.isLikedByUser
                            ? "bi-hand-thumbs-up-fill text-[#fbc02d]"
                            : "bi-hand-thumbs-up text-gray-500 group-hover:text-[#fbc02d] transition-all ease-in"
                        }`}
                      ></i>
                      <span
                        className={`ml-2 font-medium  ${
                          post.isLikedByUser
                            ? "text-[#fbc02d]"
                            : "text-gray-500 group-hover:text-[#fbc02d] transition-all ease-in"
                        }`}
                      >
                        {post.likes > 0 ? post.likes : "Like"}
                      </span>
                    </button>

                    <div className="flex items-center gap-2 hover:text-[#fbc02d]">
                      <i className="bi bi-chat"></i>
                      <span>Comment</span>
                    </div>
                    <div className="flex items-center gap-2 hover:text-[#fbc02d]">
                      <i className="bi bi-star-half"></i>
                      <span>Rate</span>
                    </div>
                  </div>
                </Link>
              </div>
            );
          });
        })()
      )}
    </div>
  );
}
