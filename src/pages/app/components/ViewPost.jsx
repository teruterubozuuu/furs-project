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
  collection,
  getDocs,
  addDoc,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { useAuth } from "../../../context/AuthContext";
import defaultImg from "../../../assets/default_img.jpg";
import EditPostModal from "./EditPostModal";
import RatingModal from "./RatingModal";
import { useNavigate } from "react-router-dom";

export default function ViewPost() {
  const { postId } = useParams();
  const { user, userData } = useAuth();
  const navigate = useNavigate();

  const [post, setPost] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [isLikedByUser, setIsLikedByUser] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [address, setAddress] = useState("Loading location...");
  const [openMenuId, setOpenMenuId] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [postToEdit, setPostToEdit] = useState(null);
  const [isRating, setIsRating] = useState(false);

  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState([]);

  // Fetch post data
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, "posts", postId);
        const postSnap = await getDoc(postRef);

        if (postSnap.exists()) {
          const postData = postSnap.data();
          // Merge ID and data immediately for local use
          const fullPostData = { id: postSnap.id, ...postData }; 
          
          setPost(fullPostData); // Set the state
          setLikesCount(postData.likes || 0);
          setIsOwner(user?.uid === postData.userId);

          if (user?.uid) {
            const likeRef = doc(db, "posts", postId, "likes", user.uid);
            const likeSnap = await getDoc(likeRef);
            setIsLikedByUser(likeSnap.exists());
          }

          if (fullPostData.location?.lat && fullPostData.location?.lng) {
            const functionBaseUrl = `http://127.0.0.1:5001/furs-project-7a0a3/us-central1/api`;
            try {
              const res = await fetch(
                `${functionBaseUrl}/reverse?lat=${fullPostData.location.lat}&lon=${fullPostData.location.lng}`
              );
              const json = await res.json();
              setAddress(json.display_name || "Address not found");
            } catch (error) {
              console.error("Function/Reverse geocoding error:", error);
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

  // fetch comments
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const commentsSnap = await getDocs(
          collection(db, "posts", postId, "comments")
        );
        setComments(
          commentsSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching comments:", error);
      }
    };
    fetchComments();
  }, [postId]);

  // creates a notification
  const createNotification = async (type, postOwnerId, extraData = {}) => {
    if (user.uid === postOwnerId) return; // prevents self-notification

    try {
      const notifRef = collection(db, "users", postOwnerId, "notifications");
      await addDoc(notifRef, {
        senderId: user.uid,
        senderName: userData?.username || "Someone",
        senderPhoto: userData?.profilePhoto || "",
        postId,
        postUsername: extraData.postUsername || "",
        postDescription: post?.description?.slice(0, 80) || "",
        type,
        value: extraData.value || null, // for rating stars
        comment: extraData.comment || null, // for comment text
        timestamp: serverTimestamp(),
        read: false,
      });
    } catch (error) {
      console.error("Error creating notification:", error);
    }
  };

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
        await deleteDoc(likeRef);
        await updateDoc(postRef, { likes: increment(-1) });
        setIsLikedByUser(false);
        setLikesCount((prev) => prev - 1);
      } else {
        await setDoc(likeRef, { userId: user.uid, timestamp: new Date() });
        await updateDoc(postRef, { likes: increment(1) });
        setIsLikedByUser(true);
        setLikesCount((prev) => prev + 1);

        // create like notification
        if (post?.userId) {
          await createNotification("like", post.userId);
        }
      }
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  // handles rating
  const handleRating = async (value) => {
    if (!user) {
      alert("Please log in to rate posts.");
      return;
    }
    if (post?.userId === user.uid) {
      alert("You can’t rate your own post.");
      return;
    }

    try {
      const targetUserRef = doc(db, "users", post.userId);
      const ratingDocRef = doc(targetUserRef, "ratings", user.uid);

      // Get current total rating info
      const userDoc = await getDoc(targetUserRef);
      const userData = userDoc.data() || {};
      const currentSum = userData.totalRatingSum || 0;
      const currentCount = userData.totalRatingCount || 0;

      // Prevent double rating
      const existingRating = await getDoc(ratingDocRef);
      if (existingRating.exists()) {
        alert("You’ve already rated this user.");
        return;
      }

      // Save the rating
      await setDoc(ratingDocRef, {
        raterId: user.uid,
        rating: value,
        createdAt: serverTimestamp(),
      });

      // Update totals
      await updateDoc(targetUserRef, {
        totalRatingSum: currentSum + value,
        totalRatingCount: currentCount + 1,
      });

      // create rating notification
      await createNotification("rating", post.userId, { value });

      alert(`You rated ${post.username} ${value} stars!`);
    } catch (error) {
      console.error("Error adding rating:", error);
    }
  };

  // Add comment
  const handleAddComment = async () => {
    if (!user) {
      alert("Please log in to comment.");
      return;
    }
    if (!commentText.trim()) return;

    try {
      const commentRef = collection(db, "posts", postId, "comments");
      await addDoc(commentRef, {
        userId: user.uid,
        username: userData?.username || "Anonymous",
        postUsername: post?.username || "Unknown",
        profilePhoto: userData?.profilePhoto || "",
        text: commentText,
        timestamp: new Date(),
      });

      setComments((prev) => [
        ...prev,
        {
          userId: user.uid,
          username: userData?.username || "Anonymous",
          postUsername: post?.username || "Unknown",
          profilePhoto: userData?.profilePhoto || "",
          text: commentText,
          timestamp: new Date(),
        },
      ]);

      // create comment notification
      if (post?.userId) {
        await createNotification("comment", post.userId, {
          comment: commentText,
          postUsername: post.username,
        });
      }

      setCommentText("");
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

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

  const handleEditPost = (post) => {
    setPostToEdit(post);
    setIsEditing(true);
  };

  const handleUpdatePost = async (postId, postType, updatedData) => {
    const collectionName = getCollectionName(postType);
    if (!postId) {
      alert("Error: Missing post ID.");
      return;
    }

    try {
      const postRef = doc(db, collectionName, postId);
      await updateDoc(postRef, updatedData);
      setPost((prev) => ({ ...prev, ...updatedData }));
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Failed to update post. Please try again.");
    }
  };

  const handleDeletePost = async (postId, postType) => {
    if (!window.confirm("Are you sure you want to delete this post?")) return;
    const collectionName = getCollectionName(postType);
    try {
      const postRef = doc(db, collectionName, postId);
      await deleteDoc(postRef);
      alert("Post deleted successfully!");
    } catch (error) {
      console.error("Error deleting post:", error);
      alert("Failed to delete post. Please try again.");
    }
  };

  const profilePath =
    post?.userId === user?.uid ? "/profile" : `/profile/${post?.userId}`;

        // 7. UPDATED FUNCTION: Handle similarity search and navigation
    const handleFindSimilarPosts = (targetPost) => {
        if (!targetPost.id) {
            console.error("Target post is missing ID.");
            return;
        }

        navigate(`/similar-posts/${targetPost.username}/${targetPost.id}`, { 
            state: { 
                originalPost: targetPost,
            } 
        });
    };


  return (
    <div className="xl:min-w-[650px] border border-gray-200 bg-white rounded-lg p-7">
      {isEditing && postToEdit && (
        <EditPostModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          post={postToEdit}
          onUpdate={handleUpdatePost}
        />
      )}

      <RatingModal
        isOpen={isRating}
        onClose={() => setIsRating(false)}
        onRate={handleRating}
      />

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
                className="w-17 h-17 rounded-full object-cover"
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
                        <button
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // Correctly passing the full 'post' object 
                            handleFindSimilarPosts(post); 
                          }}
                          className="cursor-pointer text-[10px] text-start text-gray-500 font-semibold underline hover:text-green-700 transition"
                        >
                          See similar posts
                        </button>
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
          <div className="text-sm text-gray-500 mt-2">
            {post.location?.landmark && (
              <p className="mt-1 text-gray-500 italic">
                <span className="font-semibold ">Landmark:</span>{" "}
                {post.location.landmark}
              </p>
            )}
                        <p className="italic"><span className="font-semibold ">Address:</span>{" "} {address}</p>
          </div>

          {/* Like, Comment, Rate */}
          <div className="flex flex-row justify-between xl:justify-around px-2 text-md text-gray-500 font-medium border-t border-gray-200 pt-3 gap-2">
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

            <div className="flex items-center gap-2 cursor-pointer hover:text-[#fbc02d]">
              <i className="bi bi-chat"></i>
              <span className="xl:flex hidden">Comment</span>
            </div>
            <div
              className="flex items-center gap-2 cursor-pointer hover:text-[#fbc02d]"
              onClick={() => setIsRating(true)}
            >
              <i class="bi bi-star-half"></i>
              <span className="xl:flex hidden">Rate</span>
            </div>
          </div>

          {/* comments section */}
          <div className="mt-4 flex flex-col gap-2">
            {comments.map((comment) => (
              <div key={comment.id} className="flex items-start gap-2">
                <img
                  src={comment.profilePhoto || defaultImg}
                  alt="Profile"
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm">
                      {comment.username}
                    </span>
                    <span className="text-xs text-gray-500 font-light">
                      {comment.timestamp?.toDate
                        ? comment.timestamp.toDate().toLocaleString("en-US", {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "numeric",
                            minute: "2-digit",
                            hour12: true,
                          })
                        : "Just now"}{" "}
                    </span>
                  </div>
                  <span className="text-gray-700 text-sm">{comment.text}</span>
                </div>
              </div>
            ))}
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="border border-gray-300 rounded-md px-2 py-1 flex-1 focus:outline-none"
              />
              <button
                onClick={handleAddComment}
                className="bg-[#2e7d32] text-white px-3 rounded-md cursor-pointer hover:bg-[rgb(28,79,39)] duration-200 ease-in"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500">Loading post...</p>
      )}
    </div>
  );
}
