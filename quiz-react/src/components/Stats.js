import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function Stats({ API, name }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch(`${API}/user/${encodeURIComponent(name)}`)
      .then(res => res.json())
      .then(setStats)
      .catch(() => setStats(null));
  }, [API, name]);

  if (!stats) {
    return (
      <div className="rounded-2xl bg-white p-5 text-slate-950 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800">
        Loading stats...
      </div>
    );
  }

  const lastPlayed = stats.lastPlayed
    ? new Date(stats.lastPlayed).toLocaleString()
    : "Not available";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="rounded-2xl bg-white p-5 text-slate-950 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
    >
      <h3 className="text-lg font-bold">Your Stats</h3>
      <div className="mt-4 grid gap-3">
        <div className="rounded-xl bg-slate-50 p-3 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <p className="text-sm text-slate-500 dark:text-slate-400">Attempts</p>
          <p className="text-2xl font-black">{stats.attempts}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <p className="text-sm text-slate-500 dark:text-slate-400">Best Score</p>
          <p className="text-2xl font-black">{stats.best}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <p className="text-sm text-slate-500 dark:text-slate-400">Average Score</p>
          <p className="text-2xl font-black">{stats.average || 0}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3 text-slate-900 dark:bg-slate-950 dark:text-slate-100">
          <p className="text-sm text-slate-500 dark:text-slate-400">Last Played</p>
          <p className="font-semibold">{lastPlayed}</p>
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-3 dark:bg-slate-950">
        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Progress Over Time</p>
        <div className="mt-3 flex h-24 items-end gap-2">
          {(stats.history || []).map((attempt, index) => {
            const level = Math.max(1, Math.round(((attempt.score || 0) / (attempt.total || 10)) * 6));

            return (
              <div className="flex flex-1 flex-col items-center gap-2" key={`${attempt.date}-${index}`}>
                <div className="flex h-16 w-full items-end rounded-lg bg-slate-200 p-1 dark:bg-slate-800">
                  <div
                    className={`w-full rounded-md bg-indigo-600 dark:bg-indigo-300 ${
                      level === 1 ? "h-1/6" :
                      level === 2 ? "h-2/6" :
                      level === 3 ? "h-3/6" :
                      level === 4 ? "h-4/6" :
                      level === 5 ? "h-5/6" :
                      "h-full"
                    }`}
                  />
                </div>
                <span className="text-xs font-bold">{attempt.score}</span>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
