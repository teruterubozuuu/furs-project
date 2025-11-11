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

// Hugging Face Model for Feature Extraction (Embeddings)
// This new endpoint requires manual Cosine Similarity calculation (implemented below).
const HF_EMBEDDING_MODEL_URL = "https://api-inference.huggingface.co/models/intfloat/e5-mistral-7b-instruct";

const app = express();

// Enable CORS for all routes (defined early)
app.use(cors({
    origin: ["http://localhost:5173", "https://furs-project-7a0a3.web.app"],
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
 * Calculates the cosine similarity between two vectors (arrays of numbers).
 * @returns {number} The result ranges from -1 (opposite) to 1 (identical).
 */
const cosineSimilarity = (vecA, vecB) => {
    let dotProduct = 0;
    let magnitudeA = 0;
    let magnitudeB = 0;

    // Ensure vectors have the same length
    if (vecA.length !== vecB.length) {
        console.error("Vector lengths do not match.");
        return 0;
    }

    for (let i = 0; i < vecA.length; i++) {
        dotProduct += vecA[i] * vecB[i];
        magnitudeA += vecA[i] * vecA[i];
        magnitudeB += vecB[i] * vecB[i];
    }

    magnitudeA = Math.sqrt(magnitudeA);
    magnitudeB = Math.sqrt(magnitudeB);

    if (magnitudeA === 0 || magnitudeB === 0) {
        return 0; // Avoid division by zero
    }

    // Cosine similarity formula
    return dotProduct / (magnitudeA * magnitudeB);
};


/**
 * Calls the Hugging Face API to fetch embeddings (feature vectors) in a batch.
 * @param {string[]} texts Array of texts to embed.
 * @returns {Promise<number[][]>} Array of embedding vectors.
 */
async function fetchEmbeddings(texts) {
    if (!HF_API_TOKEN || texts.length === 0) {
        console.warn("Embedding fetching skipped: Missing token or texts.");
        return [];
    }
    
    // Send the batch request
    let response = await fetch(HF_EMBEDDING_MODEL_URL, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${HF_API_TOKEN}`, 
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            // The inputs array contains all sentences to be embedded
            inputs: texts,
        }),
    });

    // Handle initial loading state from HF API
    if (response.status === 503) {
        console.log("HF model is loading, waiting 10 seconds...");
        await new Promise(resolve => setTimeout(resolve, 10000));
        return fetchEmbeddings(texts); // Retry recursively
    }

    if (!response.ok) {
        console.error(`HF Embedding API Error (${response.status}):`, await response.text());
        return [];
    }

    const embeddings = await response.json();
    return Array.isArray(embeddings) ? embeddings : [];
}

/**
 * Fetches embeddings for the source and targets, calculates cosine similarity,
 * and returns the scores for the target texts.
 * @param {string} sourceText The description of the target post.
 * @param {string[]} targetTexts Array of descriptions from other posts.
 * @returns {Promise<number[]>} Array of cosine similarity scores (0 to 1).
 */
async function fetchBatchEmbeddingsAndScore(sourceText, targetTexts) {
     if (!sourceText || targetTexts.length === 0) {
         return targetTexts.map(() => 0);
    }
    
    // Fetch embeddings for the source and all targets in a single batch call
    const allTexts = [sourceText, ...targetTexts];
    const embeddings = await fetchEmbeddings(allTexts);

    if (embeddings.length !== allTexts.length || embeddings.length < 1) {
        console.warn("Failed to retrieve expected number of embeddings.");
        return targetTexts.map(() => 0);
    }
    
    const sourceEmbedding = embeddings[0];
    const comparisonEmbeddings = embeddings.slice(1);
    
    // Calculate the cosine similarity score for each comparison embedding
    const scores = comparisonEmbeddings.map(targetEmbedding => 
        cosineSimilarity(sourceEmbedding, targetEmbedding)
    );
    
    return scores;
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
        
        // 2. Fetch AI Similarity Scores via Feature Extraction and manual Cosine Similarity
        let aiScores = [];
        if (targetDescription.length > 0 && comparisonDescriptions.length > 0) {
            // Use the new function that fetches embeddings and calculates scores
            aiScores = await fetchBatchEmbeddingsAndScore(targetDescription, comparisonDescriptions);
        }

        // 3. Calculate Final Similarity Score (Location, Attributes, AI)
        
        // Define weights (total must be 1.0)
        const weights = {
            location: 0.20, 
            aiDescription: 0.20, 
            color: 0.17,
            breed: 0.18, 
            animalType: 0.15, 
            status: 0.10 // Total: 1.00
        };
        
        let aiScoreIndex = 0;
        
        const postsWithScore = allPosts.map(post => {
            let score = 0;
            
            // --- Location Match Check (40% Weight) ---
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

                // Normalize proximity: 0km -> 1.0, 10km -> 0.0 (using 15km as soft limit for score decay)
                locationScore = Math.max(0, 1 - (distance / (MAX_COMPARISON_DISTANCE_KM * 1.5))); 
                score += locationScore * weights.location;
            } else {
                 return { ...post, similarityScore: 0 }; // Fails if location data is missing
            }


            // --- AI Description Match (30% Weight) ---
            if (post.description && targetPost.description && post.description.length > 0) {
                // Check if this post was included in the AI batch calculation
                const wasInBatch = postsWithDescriptions.some(p => p.id === post.id);

                if (wasInBatch && aiScoreIndex < aiScores.length) {
                    aiDescriptionScore = aiScores[aiScoreIndex] || 0;
                    score += aiDescriptionScore * weights.aiDescription;
                    aiScoreIndex++;
                }
            }
            // If there's no description to compare, the score contribution is 0

            // --- Fixed Attribute Matches (30% Weight) ---

            // Match 1: Coat Color (5% Weight)
            if (post.coatColor && targetPost.coatColor && post.coatColor.toLowerCase() === targetPost.coatColor.toLowerCase()) {
                score += weights.color;
            }

            // Match 2: Breed (13% Weight)
            if (post.breed && targetPost.breed && post.breed.toLowerCase() === targetPost.breed.toLowerCase()) {
                score += weights.breed;
            }

            // Match 3: Status (10% Weight)
            if (post.status && targetPost.status && post.status === targetPost.status) {
                score += weights.status;
            }

            // Match 4: Animal Type (2% Weight)
            if (post.animalType && targetPost.animalType && post.animalType.toLowerCase() === targetPost.animalType.toLowerCase()) {
                score += weights.animalType;
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


app.post("/similarity", async (req, res) => { res.json({ similarity: [0] }); });

export const api = functions.https.onRequest(app);