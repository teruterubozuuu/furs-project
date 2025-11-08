import React, { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { doc, getDoc, getFirestore } from "firebase/firestore";

// --- START INLINED DEPENDENCIES & MOCKS ---
const DEFAULT_IMG_URL = "https://placehold.co/100x100/2e7d32/FFFFFF?text=P";

// Simple Loading Spinner
const SimpleSpinner = () => (
    <div className="flex justify-center items-center py-10">
        <svg className="animate-spin h-8 w-8 text-[#2e7d32]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    </div>
);

const getCollectionName = (postType) => {
  if (postType === "Stray Animal") return "stray_animal_posts";
  if (postType === "Lost Pet") return "lost_pet_posts";
  if (postType === "Unknown") return "unknown_status";
  return "posts";
};

// Global DB access
const db = typeof window !== 'undefined' && window.db ? window.db : getFirestore();
// --- END INLINED DEPENDENCIES & MOCKS ---


export default function SimilarPosts() {
  const location = useLocation();
  const navigate = useNavigate();
  // 💡 FIX: Correctly destructure postId and username from the URL
  const { postId, username } = useParams(); 

  // Primary data source: Navigation state (fast)
  const [originalPost, setOriginalPost] = useState(location.state?.originalPost || null);
  
  const [similarPosts, setSimilarPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fallback and Fetch Logic (Runs on mount or when postId is retrieved)
  useEffect(() => {
    // 1. Check if we need to fetch the original post (i.e., if location state was lost)
    const fetchOriginalPostFallback = async () => {
        if (!postId || originalPost) return; // Skip if ID is missing or post is already in state
        
        setIsLoading(true);
        setError(null);
        
        try {
            // NOTE: Assuming all posts are initially in a generic 'posts' collection for simplicity
            const postRef = doc(db, 'posts', postId);
            const docSnap = await getDoc(postRef);

            if (docSnap.exists()) {
                const fetchedPost = { id: docSnap.id, ...docSnap.data() };
                setOriginalPost(fetchedPost);
                // Proceed to similarity search with the fetched post
                fetchSimilarPosts(fetchedPost);
            } else {
                throw new Error("Original post not found in the database.");
            }
        } catch (err) {
            console.error("Error fetching original post:", err);
            setError(`Failed to retrieve post ID ${postId}. Redirecting to home...`);
            const timer = setTimeout(() => navigate("/"), 3000);
            return () => clearTimeout(timer);
        }
    };
    
    // 2. Function to fetch similar posts (API call)
    const fetchSimilarPosts = async (postToSearch) => {
      setIsLoading(true);
      setError(null);
      
      const serverUrl = `http://127.0.0.1:5001/furs-project-7a0a3/us-central1/api/similar-posts`;

      try {
        const res = await fetch(serverUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ targetPost: postToSearch }), 
        });

        if (!res.ok) {
          const errorData = await res.json();
          throw new Error(errorData.error || "Failed to find similar posts on server.");
        }

        const data = await res.json();
        setSimilarPosts(data.similarPosts || []);

      } catch (err) {
        console.error("Error finding similar posts:", err);
        setError(`Failed to fetch results. Ensure your server is running. (${err.message})`);
      } finally {
        setIsLoading(false);
      }
    };

    if (originalPost) {
        // If we have the post from navigation state, search immediately
        fetchSimilarPosts(originalPost);
    } else {
        // Otherwise, run the fallback fetch
        fetchOriginalPostFallback();
    }
  }, [postId, navigate, originalPost]); 


  // Display Logic
  if (error) {
    return (
      <div className="p-8 text-center text-red-600 bg-red-50 rounded-lg max-w-[700px] mx-auto mt-8">
        <h2 className="text-xl font-bold mb-2">Error</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!originalPost && isLoading) {
      return <div className="p-8 text-center text-gray-500 max-w-[700px] mx-auto mt-8"><SimpleSpinner /></div>;
  }
  
  if (!originalPost) {
       return <div className="p-8 text-center text-gray-500 max-w-[700px] mx-auto mt-8">Post data is unavailable.</div>;
  }

  const renderPostCard = (post, isOriginal = false) => {
    const statusClass = post.status === "Stray Animal"
      ? "bg-red-100 text-red-700 border-red-300"
      : "bg-yellow-100 text-yellow-700 border-yellow-300";
      
    const scoreText = post.similarityScore 
        ? `${(post.similarityScore * 100).toFixed(0)}% Match` 
        : isOriginal ? "" : "N/A";

    return (
      <div 
        key={post.id || 'original'} 
        className={`p-4 rounded-lg shadow-md mb-4 transition-all ease-in ${
          isOriginal 
            ? "bg-[#e8f5e9] border-2 border-[#2e7d32] max-w-[700px] mx-auto" 
            : "bg-white border border-gray-200 hover:shadow-lg"
        }`}
      >
        <div className="flex justify-between items-start">
            <h3 className="font-bold text-lg mb-2">
                {isOriginal ? "Original Report" : post.username ? post.username + "'s Post" : "Similar Post"}
            </h3>
            <span className={`text-sm font-semibold p-1 rounded ${statusClass}`}>
                {post.status}
            </span>
        </div>

        <p className="text-gray-700 italic mb-2">
            "{post.description.substring(0, 150)}{post.description.length > 150 ? '...' : ''}"
        </p>
        
        <div className="flex flex-wrap gap-2 text-xs pt-2 border-t border-gray-100">
          {post.animalType && <span className="p-1 bg-green-100 rounded">Animal Type: {post.animalType}</span>  }
            {post.breed && <span className="p-1 bg-green-100 rounded">Breed: {post.breed}</span>}
            {post.coatColor && <span className="p-1 bg-green-100 rounded">Color: {post.coatColor}</span>}
            {post.location?.landmark && <span className="p-1 bg-green-100 rounded">Landmark: {post.location.landmark}</span>}
            {post.address && <span className="p-1 bg-green-100 rounded">Address: {post.address.substring(0, 40)}...</span>}
        </div>
        
        {!isOriginal && post.similarityScore > 0 && (
            <div className="mt-3 pt-3 border-t border-gray-200">
                <span className="text-sm font-bold text-indigo-700">{scoreText}</span>
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="container mx-auto p-4 max-w-[700px] space-y-6 border border-gray-200 bg-white shadow-sm rounded-lg">
      <div className="flex items-center space-x-2 mb-4">
        <button onClick={() => navigate(-1)} className="text-gray-600 hover:text-gray-800 transition">
            <i className="bi bi-arrow-left text-2xl cursor-pointer"></i>
        </button>
        <h1 className="text-2xl font-extrabold text-[#2e7d32]">Similar Posts</h1>
      </div>


      {renderPostCard(originalPost, true)}

      <h2 className="text-xl font-bold text-gray-700 mt-6">Matching Reports</h2>
{isLoading ? (
        <SimpleSpinner />
      ) : similarPosts.length > 0 ? (
        <div className="space-y-4">
          {/* FIX APPLIED: Wrap each card in a Link inside the map function */}
          {similarPosts.map(post => (
            <Link 
              key={post.id} 
              to={`/${post.username || 'unknown_user'}/status/${post.id}`}
              // Ensure the Link acts as a block element to contain the card
              className="block"
            >
              {renderPostCard(post)}
            </Link>
          ))}
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500 italic bg-white border border-gray-200 rounded-lg">
          No other reports were found to be sufficiently similar (above 50% threshold).
        </div>
      )}
    </div>
  );
}