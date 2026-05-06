import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Start from "./components/Start";
import Quiz from "./components/Quiz";
import Leaderboard from "./components/Leaderboard";
import Stats from "./components/Stats";

function App() {
  const [player, setPlayer] = useState("");
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [result, setResult] = useState(null);
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem("quiz-theme");

    if (savedTheme) {
      return savedTheme === "dark";
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  const API = "https://quiz-app-1-s9c3.onrender.com";

  useEffect(() => {
    localStorage.setItem("quiz-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const startPlayer = name => {
    setPlayer(name);
    setScore(0);
    setResult(null);
    setGameOver(false);
  };

  const playAgain = () => {
    setScore(0);
    setResult(null);
    setGameOver(false);
  };

  const finishTest = testResult => {
    setScore(testResult.score);
    setResult(testResult);
    setGameOver(true);
  };

  return (
    <div className={darkMode ? "dark" : ""}>
      <main className="min-h-screen bg-slate-100 px-4 py-6 text-slate-950 transition-colors duration-300 dark:bg-slate-950 dark:text-white sm:px-6">
        <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-6xl flex-col justify-center gap-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
                Quiz App
              </p>
              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                Aptitude Test Platform
              </h1>
            </div>

            <button
              className="w-auto rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800"
              onClick={() => setDarkMode(value => !value)}
            >
              {darkMode ? "Light" : "Dark"}
            </button>
          </div>

          <AnimatePresence mode="wait">
            {!player && (
              <motion.div
                key="start"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.28 }}
              >
                <Start setPlayer={startPlayer} />
              </motion.div>
            )}

            {player && !gameOver && (
              <motion.div
                key="quiz"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.28 }}
              >
                <Quiz
                  API={API}
                  player={player}
                  onFinish={finishTest}
                />
              </motion.div>
            )}

            {gameOver && (
              <motion.section
                key="results"
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.28 }}
                className="space-y-4"
              >
                <div className="rounded-2xl bg-white p-6 text-slate-950 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800">
                  <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
                    Detailed Analysis
                  </p>
                  <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <div>
                      <h2 className="text-3xl font-bold">{player}</h2>
                      <p className="mt-1 text-slate-500 dark:text-slate-400">
                        Final aptitude test report
                      </p>
                    </div>
                    <div className="text-5xl font-black text-indigo-600 dark:text-indigo-300">
                      {score}/{result?.total || 0}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 sm:grid-cols-4">
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Accuracy</p>
                      <p className="text-2xl font-black">{result?.accuracy || 0}%</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Answered</p>
                      <p className="text-2xl font-black">{result?.answered || 0}</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Time Taken</p>
                      <p className="text-2xl font-black">
                        {Math.floor((result?.timeTaken || 0) / 60)}m {(result?.timeTaken || 0) % 60}s
                      </p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
                      <p className="text-sm text-slate-500 dark:text-slate-400">Warnings</p>
                      <p className="text-2xl font-black">{result?.tabWarnings || 0}</p>
                    </div>
                  </div>

                  <div className="mt-5 grid gap-3 md:grid-cols-3">
                    {Object.entries(result?.sectionStats || {}).map(([section, stats]) => (
                      <div
                        className="rounded-xl border border-slate-200 p-3 dark:border-slate-800"
                        key={section}
                      >
                        <p className="font-bold">{section}</p>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                          {stats.correct}/{stats.total} correct
                        </p>
                        <div className="mt-3 grid grid-cols-10 gap-1">
                          {Array.from({ length: 10 }).map((_, itemIndex) => (
                            <span
                              className={`h-2 rounded-full ${
                                itemIndex < Math.round((stats.correct / stats.total) * 10)
                                  ? "bg-indigo-600 dark:bg-indigo-300"
                                  : "bg-slate-200 dark:bg-slate-800"
                              }`}
                              key={itemIndex}
                            />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 lg:grid-cols-[1fr_1.1fr]">
                  <Stats API={API} name={player} />
                  <Leaderboard API={API} />
                </div>

                <button
                  className="rounded-xl bg-indigo-600 px-5 py-3 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
                  onClick={playAgain}
                >
                  Play Again
                </button>
              </motion.section>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

export default App;
