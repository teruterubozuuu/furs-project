import express from "express";
import cors from "cors";
import * as functions from "firebase-functions";
// Use direct imports for ES Module compatibility
import { initializeApp } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getAuth } from "firebase-admin/auth"; // Needed for deleteUser
import fetch from "node-fetch";
import { defineSecret } from "firebase-functions/params";

// Initialize Firebase Admin SDK
initializeApp();

// Initialize Firestore and Auth services
const db = getFirestore();
const auth = getAuth();

// Define the secret parameter (value is set via CLI)
const mySecret = defineSecret("HF_API_TOKEN");
const HF_EMBEDDING_MODEL_URL =
  "https://router.huggingface.co/hf-inference/sentence-transformers/paraphrase-multilingual-mpnet-base-v2";

const app = express();

// Enable CORS for all routes
app.use(
  cors({
    origin: ["http://localhost:5173", "https://furs-project-7a0a3.web.app"],
    methods: "*",
    allowedHeaders: "*",
    credentials: false,
  })
);
app.use(express.json());

const CACHE_DURATION_MS = 24 * 60 * 60 * 1000;
const MAX_RETRIES = 5; // Used for Hugging Face API retry logic

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
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

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
  let magnitudeB = 0; // Ensure vectors have the same length

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
  } // Cosine similarity formula

  return dotProduct / (magnitudeA * magnitudeB);
};

/**
 * Calls the Hugging Face API to fetch embeddings (feature vectors) in a batch.
 * Implements exponential backoff/retry logic for the 503 (loading) status, matching the test script.
 * @param {string[]} texts Array of texts to embed.
 * @param {number} retryCount Current number of retries (internal use).
 * @returns {Promise<number[][]>} Array of embedding vectors.
 */
async function fetchEmbeddings(texts, retryCount = 0) {
  // Access the secret value injected by Firebase Functions runtime
  const token = mySecret.value();

  if (!token || texts.length === 0) {
    console.warn("Embedding fetching skipped: Missing token or texts.");
    return [];
  }
  try {
    let response = await fetch(HF_EMBEDDING_MODEL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`, // Use the resolved token
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: texts,
      }),
    }); // Handle initial loading state from HF API (Status 503) using exponential backoff

    if (response.status === 503) {
      if (retryCount >= MAX_RETRIES) {
        throw new Error("HF Model Load Timeout: Max retries reached.");
      }
      const delay = Math.pow(2, retryCount) * 1000;
      console.log(
        `HF model is loading (503). Retrying in ${delay / 1000}s... (Attempt ${
          retryCount + 1
        }/${MAX_RETRIES})`
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
      return fetchEmbeddings(texts, retryCount + 1); // Recursive retry
    }

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`HF Embedding API Error (${response.status}):`, errorBody);
      return [];
    }

    const embeddings = await response.json();
    return Array.isArray(embeddings) ? embeddings : [];
  } catch (error) {
    console.error("Error during fetchEmbeddings:", error.message);
    return [];
  }
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
  } // Fetch embeddings for the source and all targets in a single batch call
  const allTexts = [sourceText, ...targetTexts];
  const embeddings = await fetchEmbeddings(allTexts);

  if (embeddings.length !== allTexts.length || embeddings.length < 1) {
    console.warn(
      "Failed to retrieve expected number of embeddings. Returning zero scores."
    );
    return targetTexts.map(() => 0);
  }
  const sourceEmbedding = embeddings[0];
  const comparisonEmbeddings = embeddings.slice(1); // Calculate the cosine similarity score for each comparison embedding
  const scores = comparisonEmbeddings.map((targetEmbedding) =>
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
  } // Create a unique cache ID for the coordinates (rounded to 5 decimal places for precision)
  const latKey = parseFloat(lat).toFixed(5);
  const lonKey = parseFloat(lon).toFixed(5);
  const cacheId = `${latKey},${lonKey}`;

  const cacheRef = db.collection("nominatimCache").doc(cacheId);

  try {
    // 1. Check Cache
    const cacheDoc = await cacheRef.get();
    if (cacheDoc.exists) {
      const cacheData = cacheDoc.data();
      const lastUpdated = cacheData.timestamp.toMillis();
      const age = Date.now() - lastUpdated;

      if (age < CACHE_DURATION_MS) {
        console.log(`[Cache Hit] Returning cached result for ${cacheId}`);
        return res.json(cacheData.data);
      }
    } // 2. Fetch from External API (Cache Miss or Expired)

    console.log(
      `[Cache Miss] Fetching fresh data from Nominatim for ${cacheId}`
    );
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      { headers: { "User-Agent": "FursApp/1.0" } } // User-Agent is still critical
    );

    if (!response.ok) {
      console.error(`Nominatim API failed with status: ${response.status}`); // Check for potential block status 429/403
      if (response.status === 403 || response.status === 429) {
        return res
          .status(429)
          .json({
            error:
              "Nominatim Blocked: Rate limit exceeded or access policy violated. Please wait.",
          });
      }
      const errorBody = await response.text();
      console.error("Nominatim Error Body:", errorBody.substring(0, 200));
      return res.status(502).json({ error: "External API Error" });
    }

    const data = await response.json(); // 3. Store Result in Cache (Use setDoc for atomic overwrite)

    await cacheRef.set({
      timestamp: new Date(),
      lat: latKey,
      lon: lonKey,
      data: data,
    }); // 4. Return fresh data
    res.json(data);
  } catch (error) {
    console.error(
      "Error processing Reverse Geocoding (Network or Firestore):",
      error
    );
    res
      .status(500)
      .json({
        error:
          "Failed to process the reverse geocoding request due to an internal server or network error.",
      });
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
    res
      .status(500)
      .json({ error: "Failed to delete user from Authentication" });
  }
});

// ----------------------------------------------------------------------
// ENDPOINT: Find Similar Posts (Location, Attributes, and AI Description)
// ----------------------------------------------------------------------
app.post("/similar-posts", async (req, res) => {
  const { targetPost } = req.body;
  const { id: targetPostId } = targetPost;

  // Limits & thresholds
  const MAX_COMPARISON_DISTANCE_KM = 10;
  const MIN_SIMILARITY_THRESHOLD = 0.5;
  const MAX_RESULTS = 5;

  if (!targetPost || typeof targetPost !== "object" || !targetPostId) {
    return res.status(400).json({ error: "Invalid targetPost data provided." });
  }
  if (!targetPost.location?.lat || !targetPost.location?.lng) {
    return res
      .status(400)
      .json({ error: "Target post is missing location coordinates." });
  }

  try {
    // Fetch all posts except the target
    const snapshot = await db.collection("posts").get();
    const allPosts = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((p) => p.id !== targetPostId);

    if (allPosts.length === 0) {
      return res.json({
        similarPosts: [],
        message: "No other posts found to compare.",
      });
    }

    const targetDescription = targetPost.description || "";
    const postsWithDescriptions = allPosts.filter(
      (p) => p.description && p.description.length > 0
    );
    const comparisonDescriptions = postsWithDescriptions.map(
      (p) => p.description
    );

    // --- AI Scores ---
    let aiScores = Array(postsWithDescriptions.length).fill(0); // initialize
    if (targetDescription.length > 0 && comparisonDescriptions.length > 0) {
      try {
        const fetchedScores = await fetchBatchEmbeddingsAndScore(
          targetDescription,
          comparisonDescriptions
        );
        if (fetchedScores.length > 0) aiScores = fetchedScores;
      } catch (err) {
        console.error("[Similarity Search] HF API call failed:", err);
      }
    }

    // --- Calculate final similarity ---
    let aiScoreIndex = 0; // keep track of index in aiScores
    const postsWithScore = allPosts.map((post) => {
      let score = 0;
      let locationScore = 0;
      let aiDescriptionScore = 0;
      let attributeMatches = {};

      // Location
      if (post.location?.lat && post.location?.lng) {
        const distance = getDistance(
          targetPost.location.lat,
          targetPost.location.lng,
          post.location.lat,
          post.location.lng
        );
        post.distanceKm = distance.toFixed(2);
        if (distance > MAX_COMPARISON_DISTANCE_KM)
          return { ...post, similarityScore: 0, reason: "Too far" };
        locationScore = Math.max(
          0,
          1 - distance / (MAX_COMPARISON_DISTANCE_KM * 1.5)
        );
        score += locationScore * 0.20;
      } else {
        return { ...post, similarityScore: 0, reason: "Missing Location Data" };
      }

      // AI
      if (
        post.description &&
        postsWithDescriptions.some((p) => p.id === post.id)
      ) {
        aiDescriptionScore = aiScores[aiScoreIndex++] || 0;
        score += aiDescriptionScore * 0.20;
      }

      // Attributes
      if (
        post.coatColor?.toLowerCase() === targetPost.coatColor?.toLowerCase()
      ) {
        score += 0.15;
        attributeMatches.color = 0.15;
      }
      if (post.breed?.toLowerCase() === targetPost.breed?.toLowerCase()) {
        score += 0.17;
        attributeMatches.breed = 0.17;
      }
      if (post.status === targetPost.status) {
        score += 0.1;
        attributeMatches.status = 0.1;
      }
      if (
        post.animalType?.toLowerCase() === targetPost.animalType?.toLowerCase()
      ) {
        score += 0.18;
        attributeMatches.animalType = 0.18;
      }

      return {
        ...post,
        similarityScore: Math.min(1, score),
        locationScore: locationScore.toFixed(4),
        descriptionAiScore: aiDescriptionScore.toFixed(4),
        attributeMatches,
      };
    });

    // Filter, sort, and limit
    const similarPosts = postsWithScore
      .filter((p) => p.similarityScore >= MIN_SIMILARITY_THRESHOLD)
      .sort((a, b) => b.similarityScore - a.similarityScore)
      .slice(0, MAX_RESULTS);

    res.json({ similarPosts });
  } catch (err) {
    console.error("Error finding similar posts:", err);
    res.status(500).json({ error: "Failed to process similarity search." });
  }
});

app.post("/similarity", async (req, res) => {
  res.json({ similarity: [0] });
});

// EXPORT: Attach the secret to the function runtime
export const api = functions.https.onRequest({ secrets: [mySecret] }, app);
