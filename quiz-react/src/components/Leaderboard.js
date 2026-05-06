import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const LEADERBOARD_LIMIT = 5;

export default function Leaderboard({ API }) {
  const [data, setData] = useState([]);

  useEffect(() => {
    fetch(API + "/leaderboard")
      .then(res => res.json())
      .then(scores => setData(scores.slice(0, LEADERBOARD_LIMIT)))
      .catch(() => setData([]));
  }, [API]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: 0.05 }}
      className="rounded-2xl bg-white p-5 text-slate-950 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800"
    >
      <h3 className="text-lg font-bold">Leaderboard</h3>
      <div className="mt-3 max-h-64 space-y-2 overflow-y-auto pr-1">
        {data.map((item, index) => (
          <div
            className="flex items-center justify-between rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:bg-slate-950 dark:text-slate-100"
            key={item.name || index}
          >
            <span className="font-semibold">
              {index + 1}. {item.name}
            </span>
            <span className="rounded-full bg-indigo-100 px-3 py-1 font-bold text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-200">
              {item.score}
            </span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
