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
import { confirmAlert } from "react-confirm-alert";
import "react-confirm-alert/src/react-confirm-alert.css";
import PostCard from "./components/PostCard";

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
    photoURL: user?.photoURL || defaultImg,
    username: user?.displayName || "Guest",
  });

  const [filters, setFilters] = useState({
    reportType: "",
    selectedColors: [],
    filterAnimalType: "",
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

  const handleApplyFilter = ({
    reportType,
    selectedColors,
    filterAnimalType,
  }) => {
    setFilters({ reportType, selectedColors, filterAnimalType });
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
            photoURL: data.profilePhoto || user?.photoURL || defaultImg,
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
  const handleDeletePost = (postId, postType) => {
    confirmAlert({
      title: "Delete Post",
      message: "Are you sure you want to delete this post?",
      buttons: [
        {
          label: "Yes",
          onClick: async () => {
            const collectionName = getCollectionName(postType);
            if (!collectionName) {
              console.error("Unknown post type:", postType);
              return;
            }

            try {
              const postRef = doc(db, collectionName, postId);
              await deleteDoc(postRef);

              setPosts((prevPosts) =>
                prevPosts.filter((post) => post.id !== postId)
              );
              console.log(
                `Post ${postId} deleted successfully from ${collectionName}.`
              );
            } catch (error) {
              console.error("Error deleting post:", error);
              alert("Failed to delete post. Please try again.");
            }
          },
        },
        {
          label: "No",
          onClick: () => console.log("Post deletion cancelled."),
        },
      ],
    });
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

  const handleSnapshot = async (snapshot) => {
    const newPostsPromises = snapshot.docs.map(async (docSnap) => {
      const data = docSnap.data();
      let isLikedByUser = false;

      if (user?.uid) {
        if (Object.keys(db).length === 0) {
          console.warn(
            "Firebase not fully initialized (db is mocked). Skipping data fetch."
          );
        } else {
          const likeRef = doc(db, "posts", docSnap.id, "likes", user.uid);
          const likeSnap = await getDoc(likeRef);
          isLikedByUser = likeSnap.exists();
        }
      }

      return {
        id: docSnap.id,
        ...data,
        type: "General",
        isLikedByUser,
      };
    });

    const newPosts = await Promise.all(newPostsPromises);

    const merged = newPosts.sort((a, b) => {
      const aDate = a.createdAt?.toDate?.() || new Date(0);
      const bDate = b.createdAt?.toDate?.() || new Date(0);
      return bDate - aDate;
    });

    setPosts(merged);
    setIsLoading(false);
  };
  const handleCopyLink = (postIdToCopy) => {
    const postUrl = `${window.location.origin}/${
      posts.find((p) => p.id === postIdToCopy)?.username
    }/status/${postIdToCopy}`;

    if (!postUrl.includes("status")) {
      const fallbackUrl = `${window.location.origin}/view-post/${postIdToCopy}`;
      console.warn("Using fallback post URL:", fallbackUrl);
      navigator.clipboard
        .writeText(fallbackUrl)
        .then(() => {
          alert("Post link copied to clipboard!");
          setOpenMenuId(null);
        })
        .catch((err) => {
          console.error("Failed to copy link: ", err);
          alert("Failed to copy link. Please try again or copy manually.");
        });
      return;
    }

    navigator.clipboard
      .writeText(postUrl)
      .then(() => {
        alert("Post link copied to clipboard!");
        setOpenMenuId(null);
      })
      .catch((err) => {
        console.error("Failed to copy link: ", err);
        alert("Failed to copy link. Please try again or copy manually.");
      });
  };

  return (
    <div className="max-w-[700px] xl:w-screen space-y-4">
      {isEditing && postToEdit && (
        <EditPostModal
          isOpen={isEditing}
          onClose={() => setIsEditing(false)}
          post={postToEdit}
          onUpdate={handleUpdatePost}
        />
      )}
      <div className=" flex flex-1 flex-wrap sm:flex-nowrap max-w-[700px] justify-between items-stretch gap-2">
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

            const matchesAnimalType =
              !filters.filterAnimalType ||
              post.animalType === filters.filterAnimalType;

            return matchesReportType && matchesColor && matchesAnimalType;
          });

          if (filteredPosts.length === 0) {
            return (
              <div className="w-full max-w-[650px] md:w-[650px] mx-auto px-4">
                <div className="flex justify-center text-gray-500 italic font-medium text-xl mt-5">
                  <p>No matching posts...</p>
                </div>
              </div>
            );
          }

          return filteredPosts.map((post) => (
            <PostCard
              key={post.id}
              post={post}
              user={user}
              currentUserProfile={currentUserProfile}
              handleLike={handleLike}
              handleDeletePost={handleDeletePost}
              handleEditPost={handleEditPost}
              openMenuId={openMenuId}
              setOpenMenuId={setOpenMenuId}
              handleCopyLink={handleCopyLink}
            />
          ));
        })()
      )}
    </div>
  );
}
