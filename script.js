const quiz = [
  {
    question: "2 + 2?",
    answers: ["3", "4", "5"],
    correct: "4"
  },
  {
    question: "Capital of India?",
    answers: ["Mumbai", "Delhi", "Kolkata"],
    correct: "Delhi"
  },
  {
    question: "Which planet is known as the Red Planet?",
    answers: ["Earth", "Mars", "Venus"],
    correct: "Mars"
  }
];

let current = 0;
let score = 0;
let timeLeft = 10;
let timer;
let highScore = 0;
let playerName = "";
const DEPLOYED_API_URL = "https://quiz-app-1-s9c3.onrender.com";
const API_URL = getApiUrl();

function getApiUrl() {
  const localHosts = ["localhost", "127.0.0.1"];

  if (window.location.protocol === "file:" || localHosts.includes(window.location.hostname)) {
    return "http://localhost:3000";
  }

  return DEPLOYED_API_URL;
}

// Elements
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const resultEl = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");
const timerEl = document.getElementById("timer");
const highScoreEl = document.getElementById("highScore");
const authMessageEl = document.getElementById("authMessage");
const scoreBoardEl = document.getElementById("scoreBoard");
const userStatsEl = document.getElementById("userStats");
const endActionsEl = document.getElementById("endActions");
const resultDashboardEl = document.getElementById("resultDashboard");

timerEl.style.display = "none";
highScoreEl.style.display = "none";

function getAuthInput() {
  return {
    username: document.getElementById("username").value.trim(),
    password: document.getElementById("password").value.trim()
  };
}

function validateAuthInput(username, password) {
  if (!username && !password) {
    setAuthMessage("Please enter username and password", true);
    document.getElementById("username").focus();
    return false;
  }

  if (!username) {
    setAuthMessage("Please enter username", true);
    document.getElementById("username").focus();
    return false;
  }

  if (username.length < 3) {
    alert("Enter valid name");
    document.getElementById("username").focus();
    return false;
  }

  if (!password) {
    setAuthMessage("Please enter password", true);
    document.getElementById("password").focus();
    return false;
  }

  return true;
}

function setAuthMessage(message, isError = false) {
  authMessageEl.textContent = message;
  authMessageEl.className = isError ? "error" : "success";
}

function updateHighScore(value) {
  highScore = Number(value) || 0;
  highScoreEl.textContent = "High Score: " + highScore;
}

async function readResponseMessage(response, fallbackMessage) {
  try {
    const data = await response.json();
    return data.message || fallbackMessage;
  } catch (err) {
    return fallbackMessage;
  }
}

async function signupUser() {
  const { username, password } = getAuthInput();

  if (!validateAuthInput(username, password)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/signup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const message = await readResponseMessage(response, "Signup failed. Check if the backend is running.");
      setAuthMessage(message, true);
      return;
    }

    setAuthMessage("Signup successful. You can login now.");
  } catch (err) {
    console.error("Signup error:", err);
    setAuthMessage(`Cannot reach signup API at ${API_URL}. Start the server or deploy the latest backend.`, true);
  }
}

async function loginUser() {
  const { username, password } = getAuthInput();

  if (!validateAuthInput(username, password)) {
    return;
  }

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ username, password })
    });

    if (!response.ok) {
      const message = await readResponseMessage(response, "Login failed. Check if the backend is running.");
      setAuthMessage(message, true);
      return;
    }

    const data = await response.json();

    playerName = data.username;
    startQuiz();
  } catch (err) {
    console.error("Login error:", err);
    setAuthMessage(`Cannot reach login API at ${API_URL}. Start the server or deploy the latest backend.`, true);
  }
}

// Shuffle function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Start quiz after username
function startQuiz() {
  if (!playerName) {
    alert("Please login first");
    return;
  }

  current = 0;
  score = 0;
  timerEl.style.display = "block";
  highScoreEl.style.display = "block";
  resultDashboardEl.style.display = "none";
  scoreBoardEl.innerHTML = "";
  userStatsEl.innerHTML = "";
  endActionsEl.innerHTML = "";
  document.getElementById("userBox").style.display = "none";
  document.getElementById("quiz").style.display = "block";

  shuffleArray(quiz);
  loadQuestion();
}

// Load question
function loadQuestion() {
  const q = quiz[current];
  questionEl.textContent = q.question;
  answersEl.innerHTML = "";
  resultEl.textContent = "";
  nextBtn.style.display = "none";

  highScoreEl.textContent = "High Score: " + highScore;

  // Shuffle answers
  shuffleArray(q.answers);

  // Timer reset
  timeLeft = 10;
  timerEl.textContent = "Time: " + timeLeft;

  clearInterval(timer);
  timer = setInterval(() => {
    timeLeft--;
    timerEl.textContent = "Time: " + timeLeft;

    if (timeLeft === 0) {
      clearInterval(timer);
      resultEl.textContent = "⏰ Time's up!";
      nextBtn.style.display = "block";

      const buttons = answersEl.querySelectorAll("button");
      buttons.forEach(b => b.disabled = true);

      // Highlight correct
      buttons.forEach(b => {
        if (b.textContent === q.correct) {
          b.classList.add("correct");
        }
      });
    }
  }, 1000);

  // Create answer buttons
  q.answers.forEach(answer => {
    const btn = document.createElement("button");
    btn.textContent = answer;

    btn.onclick = () => {
      clearInterval(timer);

      const buttons = answersEl.querySelectorAll("button");
      buttons.forEach(b => b.disabled = true);

      if (answer === q.correct) {
        resultEl.textContent = "✅ Correct!";
        score++;
        btn.classList.add("correct");
      } else {
        resultEl.textContent = "❌ Wrong!";
        btn.classList.add("wrong");

        buttons.forEach(b => {
          if (b.textContent === q.correct) {
            b.classList.add("correct");
          }
        });
      }

      nextBtn.style.display = "block";
    };

    answersEl.appendChild(btn);
  });
}

// Next button
nextBtn.onclick = async () => {
  clearInterval(timer);
  current++;

  if (current < quiz.length) {
    loadQuestion();
  } else {
    // Save user score locally too
    let scores = JSON.parse(localStorage.getItem("scores")) || [];

    scores.push({
      name: playerName,
      score: score
    });

    localStorage.setItem("scores", JSON.stringify(scores));

    try {
      const response = await fetch(`${API_URL}/save-score`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          name: playerName,
          score: score
        })
      });

      const result = await response.json();
      console.log("Save score response:", result);
    } catch (err) {
      console.error("Save score error:", err);
    }

    await loadLeaderboard();
    await loadUserStats(playerName);
    showEndActions();
    resultDashboardEl.style.display = "block";

    questionEl.textContent = "Quiz Finished!";
    answersEl.innerHTML = "";
    resultEl.textContent = playerName + ", Your Score: " + score;
    timerEl.style.display = "none";
    nextBtn.style.display = "none";
  }
};

async function loadLeaderboard() {
  try {
    const response = await fetch(`${API_URL}/leaderboard`);
    const data = await response.json();

    scoreBoardEl.innerHTML = "<h3>Leaderboard</h3>";

    updateHighScore(data.length ? data[0].score : 0);

    data.forEach((user, index) => {
      scoreBoardEl.innerHTML += `<p>${index + 1}. ${user.name} - ${user.score}</p>`;
    });
  } catch (err) {
    console.error("Error loading leaderboard:", err);
  }
}

function showEndActions() {
  endActionsEl.innerHTML = '<button id="playAgainBtn">Play Again</button>';
  document.getElementById("playAgainBtn").onclick = startQuiz;
}

async function loadUserStats(name) {
  try {
    const response = await fetch(`${API_URL}/user/${encodeURIComponent(name)}`);
    const stats = await response.json();

    if (!response.ok) {
      userStatsEl.innerHTML = "";
      return;
    }

    const lastPlayed = stats.lastPlayed
      ? new Date(stats.lastPlayed).toLocaleString()
      : "Not available";

    userStatsEl.innerHTML = `
      <h3>Your Stats</h3>
      <p>Attempts: ${stats.attempts}</p>
      <p>Best Score: ${stats.best}</p>
      <p>Last Played: ${lastPlayed}</p>
    `;
  } catch (err) {
    console.error("Error loading user stats:", err);
    userStatsEl.innerHTML = "";
  }
}
