import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { db } from "../../../firebase/config";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  setDoc,
  increment,
} from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import defaultImg from "../../../assets/default_img.jpg";

export default function ViewPost() {
  const { username, postId } = useParams();
  const { user } = useAuth();

  const [post, setPost] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [address, setAddress] = useState("Loading location...");
    const [openMenuId, setOpenMenuId] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [postToEdit, setPostToEdit] = useState(null);

  const [currentUserProfile, setCurrentUserProfile] = useState({
    photoURL: defaultImg,
    username: user?.displayName || "Guest",
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          const postData = postSnap.data();
          setPost(postData);
          setLikesCount(postData.likes || 0);
          setIsOwner(user?.uid === postData.userId);

          if (user?.uid) {
            const likeRef = doc(db, "posts", postId, "likes", user.uid);
            const likeSnap = await getDoc(likeRef);
            setIsLikedByUser(likeSnap.exists());
          }

          if (postData.location?.lat && postData.location?.lng) {
            try {
              const res = await fetch(
                `https://nominatim.openstreetmap.org/reverse?lat=${postData.location.lat}&lon=${postData.location.lng}&format=json&accept-language=en`
              );
              const json = await res.json();
              setAddress(json.display_name || "Address not found");
            } catch {
              setAddress("Address unavailable");
            }
          } else {
            setAddress("No location provided");
          }
        } else {
          console.log("No such post!");
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId, user?.uid]);

  const handleLike = async () => {
    if (!user) {
      alert("Please log in to like posts.");
      return;
    }

    const postRef = doc(db, "posts", postId);
    const likeRef = doc(db, "posts", postId, "likes", user.uid);

    try {
      const likeSnap = await getDoc(likeRef);
      if (likeSnap.exists()) {
        // Unlike
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likes: increment(-1) });
        setIsLikedByUser(false);
        setLikesCount((prev) => prev - 1);
      } else {
        // Like
        await setDoc(likeRef, { userId: user.uid, timestamp: new Date() });
        await updateDoc(postRef, { likes: increment(1) });
        setIsLikedByUser(true);
        setLikesCount((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

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

  return (
    <div className="xl:min-w-[650px] border border-gray-200 bg-white rounded-lg p-7">
      <div className="flex gap-3 items-center mb-5">
        <Link to="/home">
          <i className="bi bi-arrow-left cursor-pointer text-lg"></i>
        </Link>
        <h1 className="text-xl font-semibold">Post</h1>
      </div>

      {post ? (
        <div className="flex flex-col gap-2">
          {/* Header */}
          <div className="flex items-center gap-3">
            <img
              src={
post.userPhoto
              }
              alt="Profile"
              className="w-14 h-14 rounded-full object-cover"
            />
            
            <div>
              <div className="flex gap-2 items-center flex-wrap">
                <h2 className="font-semibold text-gray-800">
                  {post.username}
                </h2>
                <p className="text-[11px] text-gray-600">
                  {post.createdAt?.toDate
                    ? post.createdAt.toDate().toLocaleString("en-US", {
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

          {/* Description */}
          <p className="text-gray-700">{post.description}</p>

          {/* Photo */}
          <div className="flex justify-center p-3">
            <img
              src={post.photoURL}
              alt="Posted"
              className="w-100 rounded-sm"
            />
          </div>

          {/* Location */}
          <div className="italic text-gray-400 text-sm">{address}</div>

          {/* Like, Comment, Rate */}
          <div className="flex justify-between xl:justify-around px-2 pt-3 text-md text-gray-500 font-medium border-t border-gray-200 pt-3">
            <button
              onClick={handleLike}
              className="group cursor-pointer flex items-center gap-1"
            >
              <i
                className={`bi ${
                  isLikedByUser
                    ? "bi-hand-thumbs-up-fill text-[#fbc02d]"
                    : "bi-hand-thumbs-up text-gray-500 group-hover:text-[#fbc02d] transition-all ease-in"
                }`}
              ></i>
              <span
                className={`ml-2 font-medium ${
                  isLikedByUser
                    ? "text-[#fbc02d]"
                    : "text-gray-500 group-hover:text-[#fbc02d] transition-all ease-in"
                }`}
              >
                {likesCount > 0 ? likesCount : "Like"}
              </span>
            </button>

            <div className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
              <i className="bi bi-chat"></i>
              <span>Comment</span>
            </div>

            <div className="flex items-center gap-2 cursor-pointer hover:text-gray-700">
              <i className="bi bi-star-half"></i>
              <span>Rate</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Loading post...</p>
      )}
    </div>
  );
}
