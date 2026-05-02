const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

mongoose.connect("mongodb://admin:quiz123@ac-uwrmpsn-shard-00-00.0hovm4s.mongodb.net:27017,ac-uwrmpsn-shard-00-01.0hovm4s.mongodb.net:27017,ac-uwrmpsn-shard-00-02.0hovm4s.mongodb.net:27017/?ssl=true&replicaSet=atlas-shkxe3-shard-0&authSource=admin&appName=Cluster0")
  .then(() => console.log("MongoDB connected"))
  .catch(err => console.log("MongoDB error:", err));

const app = express();
app.use(cors());
app.use(express.json());

const scoreSchema = new mongoose.Schema({
  name: { type: String, required: true },
  score: { type: Number, required: true }
});

const Score = mongoose.model("Score", scoreSchema);

// Save score
app.post("/save-score", async (req, res) => {
  try {
    const { name, score } = req.body;
    const savedScore = await Score.create({ name, score });
    res.json({ message: "Saved", id: savedScore._id });
  } catch (err) {
    console.error("Save-score error:", err);
    res.status(500).json({ message: "Save failed" });
  }
});

// Get leaderboard
app.get("/leaderboard", async (req, res) => {
  try {
    const topScores = await Score.find().sort({ score: -1 }).limit(10).lean();
    res.json(topScores);
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Leaderboard failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});