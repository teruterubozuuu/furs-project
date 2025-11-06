import functions from "firebase-functions";
import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import admin from "firebase-admin";

admin.initializeApp();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/reverse", async (req, res) => {
  const { lat, lon } = req.query;

  if (!lat || !lon) {
    return res.status(400).json({ error: "Missing lat/lon" });
  }

  try {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=en`,
      { headers: { "User-Agent": "FursApp/1.0" } }
    );
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error("Error fetching Nominatim data:", error);
    res.status(500).json({ error: "Failed to fetch from Nominatim" });
  }
});

app.delete("/deleteUser/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    await admin.auth().deleteUser(uid);
    res.json({ message: `User ${uid} deleted from Authentication.` });
  } catch (error) {
    console.error("Error deleting Auth user:", error);
    res.status(500).json({ error: "Failed to delete user from Authentication" });
  }
});

export const api = functions.https.onRequest(app);
