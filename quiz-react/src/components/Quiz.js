import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import questionBank from "../data/questionBank";

const TEST_DURATION_SECONDS = 30 * 60;
const QUESTION_COUNT = 10;

function shuffle(array) {
  return [...array].sort(() => Math.random() - 0.5);
}

function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function buildSectionStats(questions, answers) {
  return questions.reduce((stats, question) => {
    const current = stats[question.section] || {
      total: 0,
      answered: 0,
      correct: 0
    };
    const selected = answers[question.id];

    current.total += 1;
    if (selected) current.answered += 1;
    if (selected === question.answer) current.correct += 1;

    return {
      ...stats,
      [question.section]: current
    };
  }, {});
}

export default function Quiz({ API, player, onFinish }) {
  const [questions, setQuestions] = useState([]);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [review, setReview] = useState({});
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS);
  const [tabWarnings, setTabWarnings] = useState(0);
  const submittedRef = useRef(false);

  useEffect(() => {
    const pickedQuestions = shuffle(questionBank)
      .slice(0, QUESTION_COUNT)
      .map(question => ({
        ...question,
        options: shuffle(question.options)
      }));

    setQuestions(pickedQuestions);
  }, []);

  const finishTest = useCallback(() => {
    if (submittedRef.current || !questions.length) return;

    submittedRef.current = true;

    const score = questions.filter(question => answers[question.id] === question.answer).length;
    const answered = Object.keys(answers).length;
    const timeTaken = TEST_DURATION_SECONDS - timeLeft;
    const result = {
      score,
      total: questions.length,
      answered,
      accuracy: answered ? Math.round((score / answered) * 100) : 0,
      timeTaken,
      sectionStats: buildSectionStats(questions, answers),
      tabWarnings
    };

    fetch(`${API}/save-score`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: player,
        score,
        total: questions.length,
        accuracy: result.accuracy,
        timeTaken,
        sections: result.sectionStats
      })
    }).catch(() => {});

    onFinish(result);
  }, [API, answers, onFinish, player, questions, tabWarnings, timeLeft]);

  useEffect(() => {
    if (!questions.length || submittedRef.current) return undefined;

    if (timeLeft <= 0) {
      finishTest();
      return undefined;
    }

    const interval = setInterval(() => {
      setTimeLeft(value => value - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [finishTest, questions.length, timeLeft]);

  useEffect(() => {
    const preventContextMenu = event => event.preventDefault();
    const warnTabSwitch = () => {
      if (document.hidden && !submittedRef.current) {
        setTabWarnings(value => value + 1);
        alert("Do not switch tabs during the test.");
      }
    };

    document.addEventListener("contextmenu", preventContextMenu);
    document.addEventListener("visibilitychange", warnTabSwitch);

    return () => {
      document.removeEventListener("contextmenu", preventContextMenu);
      document.removeEventListener("visibilitychange", warnTabSwitch);
    };
  }, []);

  const sections = useMemo(
    () => [...new Set(questions.map(question => question.section))],
    [questions]
  );

  if (!questions.length) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-slate-950 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800">
        Preparing assessment...
      </div>
    );
  }

  const question = questions[index];
  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const selectAnswer = option => {
    setAnswers(current => ({
      ...current,
      [question.id]: option
    }));
  };

  const toggleReview = () => {
    setReview(current => ({
      ...current,
      [question.id]: !current[question.id]
    }));
  };

  const jumpToSection = section => {
    const nextIndex = questions.findIndex(item => item.section === section);
    if (nextIndex >= 0) setIndex(nextIndex);
  };

  return (
    <section className="grid gap-4 lg:grid-cols-[1fr_16rem]">
      <div className="rounded-2xl bg-white p-6 text-slate-950 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800 sm:p-8">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-indigo-600 dark:text-indigo-300">
              {question.section}
            </p>
            <h2 className="mt-1 text-xl font-bold">Aptitude Assessment</h2>
          </div>
          <div className="rounded-xl bg-rose-100 px-4 py-2 text-lg font-black text-rose-700 dark:bg-rose-500/15 dark:text-rose-200">
            {formatTime(timeLeft)}
          </div>
        </div>

        <div className="mt-5 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <motion.div
            className="h-full rounded-full bg-indigo-600 dark:bg-indigo-300"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {sections.map(section => (
            <button
              className={`rounded-full px-3 py-1 text-sm font-semibold transition ${
                section === question.section
                  ? "bg-indigo-600 text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800"
              }`}
              key={section}
              onClick={() => jumpToSection(section)}
            >
              {section}
            </button>
          ))}
        </div>

        <div className="min-h-[22rem]">
          <AnimatePresence mode="wait">
            <motion.div
              key={question.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.22 }}
            >
              <div className="mt-6 flex items-center justify-between gap-3 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <span>Question {index + 1} of {questions.length}</span>
                <span>{answeredCount} answered</span>
              </div>

              <h3 className="mt-4 text-2xl font-bold leading-tight">
                {question.question}
              </h3>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {question.options.map(option => {
                  const isSelected = answers[question.id] === option;

                  return (
                    <button
                      className={`min-h-14 rounded-xl border px-4 text-left font-semibold transition ${
                        isSelected
                          ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-300 dark:bg-emerald-500/15 dark:text-emerald-100"
                          : "border-slate-200 bg-slate-50 text-slate-800 hover:border-indigo-300 hover:bg-indigo-50 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:hover:border-indigo-400 dark:hover:bg-indigo-500/10"
                      }`}
                      key={option}
                      onClick={() => selectAnswer(option)}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 pt-4 dark:border-slate-800">
          <button
            className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            disabled={index === 0}
            onClick={() => setIndex(value => Math.max(value - 1, 0))}
          >
            Previous
          </button>

          <button
            className="rounded-xl bg-amber-100 px-4 py-2 font-semibold text-amber-800 transition hover:bg-amber-200 dark:bg-amber-500/15 dark:text-amber-100 dark:hover:bg-amber-500/25"
            onClick={toggleReview}
          >
            {review[question.id] ? "Unmark Review" : "Mark for Review"}
          </button>

          <button
            className="rounded-xl border border-slate-300 px-4 py-2 font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-slate-700 dark:text-slate-100 dark:hover:bg-slate-800"
            disabled={index === questions.length - 1}
            onClick={() => setIndex(value => Math.min(value + 1, questions.length - 1))}
          >
            Next
          </button>

          <button
            className="rounded-xl bg-indigo-600 px-5 py-2 font-bold text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700"
            onClick={finishTest}
          >
            Submit Test
          </button>
        </div>
      </div>

      <aside className="rounded-2xl bg-white p-5 text-slate-950 shadow-xl ring-1 ring-slate-200 dark:bg-slate-900 dark:text-slate-100 dark:ring-slate-800">
        <h3 className="font-bold">Question Panel</h3>
        <div className="mt-4 grid grid-cols-5 gap-2 lg:grid-cols-4">
          {questions.map((item, itemIndex) => {
            const isCurrent = itemIndex === index;
            const isAnswered = Boolean(answers[item.id]);
            const isReview = Boolean(review[item.id]);
            const stateClass = isReview
              ? "bg-amber-400 text-amber-950"
              : isAnswered
                ? "bg-emerald-500 text-white"
                : "bg-rose-500 text-white";

            return (
              <button
                className={`aspect-square rounded-lg text-sm font-black transition ring-offset-2 ring-offset-white dark:ring-offset-slate-900 ${
                  isCurrent ? "ring-2 ring-indigo-500" : ""
                } ${stateClass}`}
                key={item.id}
                onClick={() => setIndex(itemIndex)}
                title={item.section}
              >
                {itemIndex + 1}
              </button>
            );
          })}
        </div>

        <div className="mt-5 grid gap-2 text-sm font-semibold">
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-emerald-500" /> Answered
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-rose-500" /> Not answered
          </span>
          <span className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-400" /> Review
          </span>
        </div>

        <div className="mt-5 rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950">
          <p className="font-bold">Security</p>
          <p className="mt-1 text-slate-500 dark:text-slate-400">
            Tab switches: {tabWarnings}
          </p>
        </div>
      </aside>
    </section>
  );
}
