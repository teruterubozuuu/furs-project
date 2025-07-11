import React, { useEffect, useState } from "react";
import AddPost from "./components/AddPost";
import { db } from "../../firebase/config";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import defaultImg from "../../assets/default_img.jpg";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const postsRef = collection(db, "posts");
        const q = query(postsRef, orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);

        const fetchedPosts = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching posts: ", error);
      }
    };

    fetchPosts();
  }, []);

  return (
    <div className="max-w-[800px] mx-auto h-auto space-y-4">
      <div className="flex justify-between items-stretch gap-3">
        <div className="flex-1 flex flex-wrap sm:flex-nowrap items-center gap-3 p-4 rounded-sm border border-gray-200 shadow-sm bg-[#fafafa]">
          <img
            src={defaultImg}
            alt="User profile picture"
            className="w-8 h-8 rounded-full object-cover flex-shrink-0"
          />
          <div
            onClick={() => setIsOpen(true)}
            className="flex-1 border border-gray-300 cursor-pointer rounded-3xl bg-gray-100 hover:bg-gray-200 transition duration-200 ease-in-out"
          >
            <p className="w-full text-left p-2 text-gray-500 font-medium cursor-pointer">
              Create a post
            </p>
          </div>
        </div>

        {/* Filter section */}
        <div className="bg-[#fafafa] flex flex-col items-center justify-center text-gray-500 border-gray-200 shadow-sm border rounded-sm p-4 hover:bg-gray-200 transition-all duration-200 ease-in-out cursor-pointer">
          <i className="bi bi-filter text-2xl"></i>
          <p className="text-[10px]">Filter</p>
        </div>
      </div>
      <AddPost isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {posts.length === 0 ? (
        <div className="min-w-[600px] text-center text-gray-500 italic font-medium text-xl">
          <h1>No Posts Yet</h1>
        </div>
      ) : (
        posts.map((post) => (
          <div
            key={post.id}
            className=" bg-[#fafafa] border border-gray-200 shadow-sm p-5 rounded-sm text-sm"
          >
            {/* Post header */}
            <div className="border-b border-gray-200">
              <div className="flex h-full items-center pb-2">
                <img
                  src={defaultImg}
                  alt="Profile"
                  className="w-15 h-15 rounded-full"
                />
                <div className="pl-2 space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-base">{post.username}</p>
                    <p className="text-[11px] text-gray-600">
                      {post.createdAt?.toDate
                        ? post.createdAt.toDate().toLocaleString()
                        : "Just now"}
                    </p>
                  </div>
                  <span
                    className={`text-xs p-1 border rounded-sm ${
                      post.status === "Stray"
                        ? "bg-green-100 text-green-700 border-green-300"
                        : post.status === "Lost Pet"
                        ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                        : "bg-gray-100 text-gray-700 border-gray-300"
                    }`}
                  >
                    {post.status}
                  </span>
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
                {post.location
                  ? `Latitude: ${post.location.lat.toFixed(
                      5
                    )}, Longitude: ${post.location.lng.toFixed(5)}`
                  : "Location not available"}
              </div>

              {/* Dog characteristics */}
              <div className="flex py-1 gap-3">
                <span className="text-xs p-1 border border-gray-400 rounded-sm">
                  {post.color}
                </span>

                <span className="text-xs p-1 border border-gray-400 rounded-sm">
                  {post.breed}
                </span>
              </div>
            </div>

            <div className="flex flex-1 justify-between xl:justify-around px-2 pt-3 text-sm text-gray-500 font-medium">
              <div className="flex items-center gap-2">
                <i class="bi bi-hand-thumbs-up"></i>
                <p>Like</p>
              </div>
              <div className="flex items-center gap-2">
                <i class="bi bi-chat"></i>
                <p>Comment</p>
              </div>
              <div className="flex items-center gap-2">
                <i class="bi bi-arrow-90deg-right"></i>
                <p>Repost</p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
