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
import EditPostModal from "./EditPostModal";

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

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          const postData = postSnap.data();
          setPost({ id: postSnap.id, ...postData });
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

  // Like/Unlike post
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

  // Get collection name dynamically
  const getCollectionName = (postType) => {
    switch (postType) {
      case "Lost Pet":
        return "lostPets";
      case "Stray Animal":
        return "strayAnimals";
      case "Adoption":
        return "adoptions";
      default:
        return "posts";
    }
  };

  // Edit Post
  const handleEditPost = (post) => {
    setPostToEdit(post);
    setIsEditing(true);
  };

  // Update Post
  const handleUpdatePost = async (postId, postType, updatedData) => {
    const collectionName = getCollectionName(postType);

    if (!postId) {
      console.error("Post ID is undefined.");
      alert("Error: Missing post ID.");
      return;
    }

    try {
      const postRef = doc(db, collectionName, postId);
      await updateDoc(postRef, updatedData);

      setPost((prev) => ({ ...prev, ...updatedData }));
      console.log(`Post ${postId} updated successfully in ${collectionName}`);
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post. Please try again.");
    }
  };

  // Delete Post
  const handleDeletePost = async (postId, postType) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;

    const collectionName = getCollectionName(postType);
    try {
      const postRef = doc(db, collectionName, postId);
      await deleteDoc(postRef);
      console.log(`Post ${postId} deleted successfully from ${collectionName}`);
      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const profilePath =
    post?.userId === user?.uid ? "/profile" : `/profile/${post?.userId}`;

  return (
    <div className="xl:min-w-[650px] border border-gray-200 bg-white rounded-lg p-7">
      {/* Render modal only if editing + postToEdit exists */}
      {isEditing && postToEdit && (
        <EditPostModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          post={postToEdit}
          onUpdate={handleUpdatePost}
        />
      )}

      <div className="flex gap-3 items-center mb-5">
        <Link to="/home">
          <i className="bi bi-arrow-left cursor-pointer text-lg"></i>
        </Link>
        <h1 className="text-xl font-semibold">Post</h1>
      </div>

      {post ? (
        <div className="flex flex-col gap-2">
          {/* Header */}
          <div className="flex justify-between items-start pb-2">
            <div className="flex h-full items-center">
              <img
                src={post.userPhoto || defaultImg}
                alt="Profile"
                className="w-14 h-14 rounded-full object-cover"
              />
              <div className="pl-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Link
                    to={profilePath}
                    className="text-base font-semibold hover:underline cursor-pointer"
                  >
                    {post.username}
                  </Link>
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

                  {/* Dog characteristics */}
                  <div className="flex py-1 gap-2">
                    {post.coatColor && (
                      <span className="text-xs p-1 border bg-green-100 text-green-700 border-green-300 rounded-sm">
                        {post.coatColor}
                      </span>
                    )}
                    {post.breed && (
                      <span className="text-xs p-1 border bg-green-100 text-green-700 border-green-300 rounded-sm">
                        {post.breed}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Edit/Delete */}
            {isOwner && (
              <div className="relative flex flex-col items-end">
                <i
                  onClick={() =>
                    setOpenMenuId(openMenuId === post.id ? null : post.id)
                  }
                  className="cursor-pointer bi bi-three-dots text-gray-500 hover:text-gray-700 font-medium text-lg"
                ></i>

                {openMenuId === post.id && (
                  <div className="flex flex-col items-start border border-gray-200 bg-white w-[80px] rounded-md absolute top-5 right-0 z-10 shadow-sm">
                    <button
                      onClick={() => {
                        handleEditPost(post);
                        setOpenMenuId(null);
                      }}
                      className="cursor-pointer text-xs text-start pl-3 text-gray-600 w-full hover:bg-gray-200 py-2"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => {
                        handleDeletePost(post.id, post.type);
                        setOpenMenuId(null);
                      }}
                      className="cursor-pointer text-xs text-start pl-3 text-gray-600 w-full hover:bg-gray-200 py-2"
                    >
                      Delete
                    </button>
                  </div>
                )}
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
              className="w-100 rounded-sm object-cover"
            />
          </div>

          {/* Location */}
          <div className="italic text-gray-400 text-sm">{address}</div>

          {/* Like, Comment, Rate */}
          <div className="flex justify-between xl:justify-around px-2 text-md text-gray-500 font-medium border-t border-gray-200 pt-3">
            <button
              onClick={handleLike}
              className="group cursor-pointer flex items-center gap-1"
            >
              <i
                className={`bi ${
                  isLikedByUser
                    ? "bi-hand-thumbs-up-fill text-[#fbc02d]"
                    : "bi-hand-thumbs-up text-gray-500 group-hover:text-[#fbc02d]"
                }`}
              ></i>
              <span
                className={`ml-2 font-medium ${
                  isLikedByUser
                    ? "text-[#fbc02d]"
                    : "text-gray-500 group-hover:text-[#fbc02d]"
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
