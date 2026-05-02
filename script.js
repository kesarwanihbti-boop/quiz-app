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
let highScore = localStorage.getItem("highScore") || 0;
let playerName = "";

// Elements
const questionEl = document.getElementById("question");
const answersEl = document.getElementById("answers");
const resultEl = document.getElementById("result");
const nextBtn = document.getElementById("nextBtn");
const timerEl = document.getElementById("timer");
const highScoreEl = document.getElementById("highScore");

// Shuffle function
function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Start quiz after username
function startQuiz() {
  const input = document.getElementById("username").value.trim();

  if (!input) {
    alert("Please enter your name");
    return;
  }

  playerName = input;

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
    // Update high score
    if (score > highScore) {
      highScore = score;
      localStorage.setItem("highScore", highScore);
    }

    // Save user score locally too
    let scores = JSON.parse(localStorage.getItem("scores")) || [];

    scores.push({
      name: playerName,
      score: score
    });

    localStorage.setItem("scores", JSON.stringify(scores));

    try {
      const response = await fetch("https://quiz-app-1-s9c3.onrender.com/save-score", {
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

    showScores();
    await loadLeaderboard();

    questionEl.textContent = "Quiz Finished!";
    answersEl.innerHTML = "";
    resultEl.textContent = playerName + ", Your Score: " + score;
    highScoreEl.textContent = "High Score: " + highScore;
    timerEl.style.display = "none";
    nextBtn.style.display = "none";
  }
};

// Show last 5 scores
function showScores() {
  const scoreBoard = document.getElementById("scoreBoard");
  const scores = JSON.parse(localStorage.getItem("scores")) || [];

  scoreBoard.innerHTML = "<h3>Previous Scores:</h3>";

  scores.slice(-5).reverse().forEach(s => {
    scoreBoard.innerHTML += `<p>${s.name}: ${s.score}</p>`;
  });
}

async function loadLeaderboard() {
  try {
    const response = await fetch("https://quiz-app-1-s9c3.onrender.com/leaderboard");
    const data = await response.json();
    const scoreBoard = document.getElementById("scoreBoard");

    scoreBoard.innerHTML = "<h3>🏆 Global Leaderboard</h3>";

    data.forEach((user, index) => {
      scoreBoard.innerHTML += `<p>${index + 1}. ${user.name} - ${user.score}</p>`;
    });
  } catch (err) {
    console.error("Error loading leaderboard:", err);
  }
}