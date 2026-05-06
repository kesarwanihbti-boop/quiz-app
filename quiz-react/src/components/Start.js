import { useState } from "react";

export default function Start({ setPlayer }) {
  const [name, setName] = useState("");

  const startQuiz = () => {
    const trimmedName = name.trim();

    if (trimmedName.length < 3) {
      alert("Enter valid name");
      return;
    }

    setPlayer(trimmedName);
  };

  return (
    <section className="rounded-2xl bg-white p-6 text-slate-950 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 sm:p-8">
      <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
        Assessment Login
      </p>
      <h2 className="mt-2 text-3xl font-bold">Enter your candidate name</h2>
      <p className="mt-2 text-slate-500 dark:text-slate-400">
        Start a timed aptitude assessment with section-wise analysis.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <input
          className="min-h-12 flex-1 rounded-xl border border-slate-300 bg-white px-4 text-base outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
          onChange={e => setName(e.target.value)}
          onKeyDown={e => {
            if (e.key === "Enter") startQuiz();
          }}
          placeholder="Candidate name"
          value={name}
        />
        <button
          className="min-h-12 rounded-xl bg-indigo-600 px-6 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
          onClick={startQuiz}
        >
          Start Test
        </button>
      </div>
    </section>
  );
}
