import express from "express";
import cors from "cors";
import * as functions from "firebase-functions";
// Use direct imports for ES Module compatibility
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth"; // Needed for deleteUser
import fetch from "node-fetch"; 

// Initialize Firebase Admin SDK
initializeApp(); 

// Initialize Firestore and Auth services
const db = getFirestore();
const auth = getAuth();

// Access HF token from the function environment variables
const HF_API_TOKEN = process.env.HF_API_TOKEN;

// Hugging Face Model for Sentence Similarity
const HF_MODEL_URL = "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2";

const app = express();

// Ensure app.use(cors) and app.use(express.json) are only applied once to the app
// We will remove the duplicates later in the file.

// Enable CORS for all routes (defined early)
app.use(cors({
    origin: ["http://localhost:5173", "*"],
    methods: "*",
    allowedHeaders: "*",
    credentials: false,
}));
app.use(express.json());


// --- Core Helper Functions ---

/**
 * Calculates the distance between two geographical points using the Haversine formula.
 * @returns {number} Distance in kilometers.
 */
const getDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of Earth in kilometers
    const toRad = (angle) => angle * (Math.PI / 180);

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in km
};

/**
 * Calls the Hugging Face API to calculate the batch similarity score
 * between a source sentence and a list of target sentences.
 * @param {string} sourceText The description of the target post.
 * @param {string[]} targetTexts Array of descriptions from other posts.
 * @returns {Promise<number[]>} Array of cosine similarity scores (0 to 1).
 */
async function fetchBatchSimilarity(sourceText, targetTexts) {
    if (!HF_API_TOKEN || !sourceText || targetTexts.length === 0) {
        console.warn("AI Similarity skipped: Missing token, source text, or target texts.");
        return targetTexts.map(() => 0);
    }
    
    // Check if the model is currently loading (common HF delay)
    let response = await fetch(HF_MODEL_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_API_TOKEN}`, 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            inputs: {
                source_sentence: sourceText,
                sentences: targetTexts,
            }
        }),
    });

    // Handle initial loading state from HF API
    if (response.status === 503) {
        console.log("HF model is loading, waiting 10 seconds...");
        await new Promise(resolve => setTimeout(resolve, 10000));
        response = await fetch(HF_MODEL_URL, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_API_TOKEN}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                inputs: {
                    source_sentence: sourceText,
                    sentences: targetTexts,
                }
            }),
        });
    }

    if (!response.ok) {
        console.error(`HF API Error (${response.status}):`, await response.text());
        return targetTexts.map(() => 0);
    }

    // The API returns an array of similarity scores for the batch
    const scores = await response.json();
    return Array.isArray(scores) ? scores : targetTexts.map(() => 0);
}


// ----------------------------------------------------------------------
// ENDPOINT: Reverse Geocoding
// ----------------------------------------------------------------------
app.get("/reverse", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat/lon" });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      { headers: { "User-Agent": "FursApp/1.0" } }
    );

    if (!response.ok) {
    console.error(`Nominatim API failed with status: ${response.status}`);
    const errorBody = await response.text();
    console.error("Nominatim Error Body:", errorBody.substring(0, 200)); 
    return res.status(502).json({ error: "External API Error" }); 
  }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching Nominatim data:", error);
    res.status(500).json({ error: "Failed to fetch from Nominatim" });
  }
});


// ----------------------------------------------------------------------
// ENDPOINT: Delete User from Auth
// ----------------------------------------------------------------------
app.delete("/deleteUser/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    // Correct usage of the initialized auth service
    await auth.deleteUser(uid); 
    res.json({ message: `User ${uid} deleted from Authentication.` });
  } catch (error) {
    console.error("Error deleting Auth user:", error);
    res.status(500).json({ error: "Failed to delete user from Authentication" });
  }
});

// ----------------------------------------------------------------------
// ENDPOINT: Find Similar Posts (Location, Attributes, and AI Description)
// ----------------------------------------------------------------------
app.post("/similar-posts", async (req, res) => {
    const { targetPost } = req.body;
    const { id: targetPostId } = targetPost;
    
    // Hard limit: Posts further than this get a 0 score.
    const MAX_COMPARISON_DISTANCE_KM = 10; 
    
    // Similarity threshold to show results
    const MIN_SIMILARITY_THRESHOLD = 0.5;
    const MAX_RESULTS = 5;

    if (!targetPost || typeof targetPost !== 'object' || !targetPostId) {
        return res.status(400).json({ error: "Invalid targetPost data provided." });
    }
    
    if (!targetPost.location?.lat || !targetPost.location?.lng) {
         return res.status(400).json({ error: "Target post is missing location coordinates (lat/lng)." });
    }

    try {
        // 1. Fetch all posts
        const postsRef = db.collection("posts");
        const snapshot = await postsRef.get();
        const allPosts = snapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(post => post.id !== targetPostId); 
            
        if (allPosts.length === 0) {
            return res.json({ similarPosts: [], message: "No other posts found to compare." });
        }
        
        const targetDescription = targetPost.description || "";

        // Filter posts with descriptions for AI processing
        const postsWithDescriptions = allPosts.filter(p => p.description && p.description.length > 0);
        
        // Prepare data for batch AI call
        const comparisonDescriptions = postsWithDescriptions.map(p => p.description);
        
        // 2. Fetch AI Similarity Scores in a single batch
        let aiScores = [];
        if (targetDescription.length > 0 && comparisonDescriptions.length > 0) {
            aiScores = await fetchBatchSimilarity(targetDescription, comparisonDescriptions);
        }

        // 3. Calculate Final Similarity Score (Location, Attributes, AI)
        
        // Define weights (total must be 1.0)
        const weights = {
            location: 0.6, // Highest priority
            aiDescription: 0.2, // AI Description matching
            color: 0.05,
            breed: 0.05,
            status: 0.1 // Status is critical for filtering
        };
        
        let aiScoreIndex = 0;
        
        const postsWithScore = allPosts.map(post => {
            let score = 0;
            
            // --- Location Match Check (60% Weight) ---
            let distance = Infinity;
            let locationScore = 0;
            let aiDescriptionScore = 0;

            if (post.location?.lat && post.location?.lng) {
                distance = getDistance(
                    targetPost.location.lat,
                    targetPost.location.lng,
                    post.location.lat,
                    post.location.lng
                );
                post.distanceKm = distance.toFixed(2); 

                // Check for hard distance cutoff
                if (distance > MAX_COMPARISON_DISTANCE_KM) {
                    return { ...post, similarityScore: 0 }; 
                }

                // Normalize proximity: 0km -> 1.0, 10km -> 0.0
                locationScore = Math.max(0, 1 - (distance / (MAX_COMPARISON_DISTANCE_KM * 1.5))); 
                score += locationScore * weights.location;
            } else {
                 return { ...post, similarityScore: 0 }; // Fails if location data is missing
            }


            // --- AI Description Match (20% Weight) ---
            if (post.description && targetDescription && post.description.length > 0) {
                // Check if this post was included in the AI batch calculation
                const wasInBatch = postsWithDescriptions.some(p => p.id === post.id);

                if (wasInBatch && aiScoreIndex < aiScores.length) {
                    aiDescriptionScore = aiScores[aiScoreIndex] || 0;
                    score += aiDescriptionScore * weights.aiDescription;
                    aiScoreIndex++;
                }
            }
            // If there's no description to compare, the score contribution is 0

            // --- Fixed Attribute Matches (Remaining 20% Weight) ---

            // Match 1: Coat Color (5% Weight)
            if (post.coatColor && targetPost.coatColor && post.coatColor.toLowerCase() === targetPost.coatColor.toLowerCase()) {
                score += weights.color;
            }

            // Match 2: Breed (5% Weight)
            if (post.breed && targetPost.breed && post.breed.toLowerCase() === targetPost.breed.toLowerCase()) {
                score += weights.breed;
            }

            // Match 3: Status (10% Weight)
            if (post.status && targetPost.status && post.status === targetPost.status) {
                score += weights.status;
            }

            return { 
                ...post, 
                similarityScore: Math.min(1.0, score), // Cap score at 1.0
                locationScore: locationScore.toFixed(2),
                descriptionAiScore: aiDescriptionScore.toFixed(2),
            };
        });

        // 4. Filter, sort, and limit results
        const similarPosts = postsWithScore
            .filter(post => post.similarityScore >= MIN_SIMILARITY_THRESHOLD)
            .sort((a, b) => b.similarityScore - a.similarityScore)
            .slice(0, MAX_RESULTS);

        res.json({ similarPosts });
    } catch (error) {
        console.error("Error finding similar posts:", error);
        res.status(500).json({ error: "Failed to process similarity search." });
    }
});


// ----------------------------------------------------------------------
// Mock Endpoints (These remain as mocks)
// ----------------------------------------------------------------------
async function checkSimilarity(text1, text2) { return 0; }
async function fetchSimilarityScoreArray(text1, text2) { return [0]; }
app.post("/api/similarity", async (req, res) => { res.json({ similarity: [0] }); });


// EXPORT THE EXPRESS APP AS A SINGLE FIREBASE HTTPS FUNCTION
export const api = functions.https.onRequest(app);