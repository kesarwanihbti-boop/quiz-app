const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

if (process.env.MONGODB_URI) {
  mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB connected"))
    .catch(err => console.log(err));
} else {
  console.log("MONGODB_URI is missing. Database routes will not work.");
}

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

app.get("/", (req, res) => {
  res.send("Quiz API is running 🚀");
});

function requireDatabase(req, res, next) {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      message: "Database is not connected. Check MONGODB_URI and restart the server."
    });
  }

  next();
}

const scoreSchema = new mongoose.Schema({
  name: String,
  score: Number,
  total: Number,
  accuracy: Number,
  timeTaken: Number,
  sections: mongoose.Schema.Types.Mixed,
  date: { type: Date, default: Date.now }
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

const Score = mongoose.model("Score", scoreSchema);
const User = mongoose.model("User", userSchema);
const LEADERBOARD_LIMIT = 5;

// Create user
app.post("/signup", requireDatabase, async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }

    const existingUser = await User.findOne({ username });

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    await User.create({ username, password });
    res.json({ message: "Signup successful" });
  } catch (err) {
    console.error("Signup error:", err);
    res.status(500).json({ message: "Signup failed" });
  }
});

// Login user
app.post("/login", requireDatabase, async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username, password });

    if (!user) {
      return res.status(401).json({ message: "Invalid username or password" });
    }

    res.json({ message: "Login successful", username: user.username });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Login failed" });
  }
});

// Save score
app.post("/save-score", requireDatabase, async (req, res) => {
  try {
    const { name, score, total, accuracy, timeTaken, sections } = req.body;
    const savedScore = await Score.create({
      name,
      score,
      total,
      accuracy,
      timeTaken,
      sections
    });
    res.json({ message: "Saved", id: savedScore._id });
  } catch (err) {
    console.error("Save-score error:", err);
    res.status(500).json({ message: "Save failed" });
  }
});

// Get leaderboard
app.get("/leaderboard", requireDatabase, async (req, res) => {
  try {
    const data = await Score.aggregate([
      { $sort: { score: -1 } },
      {
        $group: {
          _id: "$name",
          score: { $max: "$score" }
        }
      },
      { $sort: { score: -1 } },
      { $limit: LEADERBOARD_LIMIT }
    ]);

    res.json(data.map(d => ({ name: d._id, score: d.score })));
  } catch (err) {
    console.error("Leaderboard error:", err);
    res.status(500).json({ message: "Leaderboard failed" });
  }
});

// Get scores for one user
app.get("/user/:name", requireDatabase, async (req, res) => {
  try {
    const data = await Score.find({ name: req.params.name }).sort({ date: -1 }).lean();

    if (!data.length) {
      return res.json({
        attempts: 0,
        best: 0,
        average: 0,
        lastPlayed: null,
        history: []
      });
    }

    res.json({
      attempts: data.length,
      best: Math.max(...data.map(item => item.score || 0)),
      average: Math.round(data.reduce((sum, item) => sum + (item.score || 0), 0) / data.length),
      lastPlayed: data[0].date,
      history: data.slice(0, 5).map(item => ({
        score: item.score || 0,
        total: item.total || null,
        accuracy: item.accuracy || 0,
        date: item.date
      })).reverse()
    });
  } catch (err) {
    console.error("User stats error:", err);
    res.status(500).json({ message: "User stats failed" });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
