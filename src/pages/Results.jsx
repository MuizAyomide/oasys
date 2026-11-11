
import { Link, useParams } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";

import {
  ArrowLeft,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Medal,
  Puzzle,
  Sparkles,
  SpellCheck,
  Pencil,
  Star,
  Trophy,
} from "lucide-react";

import { getProgress } from "../utils/progress";
import { fromDateKey } from "../utils/date";

const gameCards = [
  {
    key: "matching",
    name: "Match the Meaning",
    icon: Puzzle,
    color: "bg-amber-100 text-amber-700",
  },
  {
    key: "gap",
    name: "Fill the Gap",
    icon: Pencil,
    color: "bg-pink-100 text-pink-700",
  },
  {
    key: "spelling",
    name: "Spell It",
    icon: SpellCheck,
    color: "bg-emerald-100 text-emerald-700",
  },
];

function getResultMessage(score) {
  if (score === 15) {
    return {
      title: "Perfect Score!",
      message: "You got every answer right. Fantastic work!",
    };
  }

  if (score >= 11) {
    return {
      title: "Amazing Work!",
      message: "You've learned so much today. Keep it up!",
    };
  }

  if (score >= 6) {
    return {
      title: "Great Effort!",
      message: "You're making progress with every new word!",
    };
  }

  return {
    title: "You're Growing!",
    message: "Every word you practice helps you learn more!",
  };
}

export default function Results() {
  const { date } = useParams();
  const reduceMotion = useReducedMotion();

  const validDate = fromDateKey(date) !== null;
  const result = validDate ? getProgress()[date] : null;

  if (!result?.completed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-indigo-50 px-5 text-center">
        <Trophy size={54} className="mb-5 text-indigo-600" />

        <h1 className="text-3xl font-black text-indigo-950">
          No Completed Result Found
        </h1>

        <p className="mt-4 text-slate-600">
          Finish all three mini-games to see your results.
        </p>

        <Link
          to="/calendar"
          className="mt-7 rounded-full bg-indigo-600 px-7 py-4 font-bold text-white"
        >
          Return to Calendar
        </Link>
      </main>
    );
  }

  const score = result.score;
  const percentage = Math.round((score / 15) * 100);
  const feedback = getResultMessage(score);

  return (
    <div className="min-h-screen overflow-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 px-5 py-10">
      <main className="mx-auto max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0.4, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              type: "spring",
              stiffness: 160,
              damping: 12,
            }}
            className="mx-auto mb-7 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-amber-100 shadow-xl shadow-amber-100"
          >
            <Trophy
              size={62}
              className="text-amber-500"
            />
          </motion.div>

          <span className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-2 font-black text-indigo-600 shadow-sm">
            <CheckCircle2 size={18} />
            Daily Challenge Completed
          </span>

          <h1 className="mt-6 text-4xl font-black text-indigo-950 sm:text-6xl">
            {feedback.title}
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            {feedback.message}
          </p>
        </motion.div>

        {/* Final score */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mx-auto mt-12 max-w-md rounded-[2rem] bg-white p-9 text-center shadow-xl shadow-indigo-100"
        >
          <Star
            size={34}
            fill="currentColor"
            className="mx-auto mb-4 text-amber-500"
          />

          <p className="font-black uppercase tracking-widest text-indigo-500">
            Your Daily Score
          </p>

          <div className="mt-4 flex items-end justify-center gap-2">
            <span className="text-7xl font-black text-indigo-950">
              {score}
            </span>

            <span className="mb-3 text-3xl font-black text-slate-400">
              / 15
            </span>
          </div>

          <p className="mt-3 text-lg font-bold text-slate-600">
            {percentage}% Correct
          </p>

          <div
            role="progressbar"
            aria-label="Final score percentage"
            aria-valuemin={0}
            aria-valuemax={15}
            aria-valuenow={score}
            className="mt-7 h-5 overflow-hidden rounded-full bg-indigo-100"
          >
            <motion.div
              initial={reduceMotion ? false : { width: 0 }}
              animate={{ width: `${percentage}%` }}
              transition={{ duration: reduceMotion ? 0 : 1 }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>
        </motion.div>

        {/* Mini-game breakdown */}
        <section className="mt-14">
          <h2 className="mb-7 text-center text-2xl font-black text-indigo-950 sm:text-3xl">
            Your Mini-Game Results
          </h2>

          <div className="grid gap-5 sm:grid-cols-3">
            {gameCards.map((game, index) => {
              const Icon = game.icon;
              const gameScore =
                result.gameScores?.[game.key];

              return (
                <motion.div
                  key={game.key}
                  initial={{ opacity: 0, y: 25 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.12 }}
                  className="rounded-3xl bg-white p-7 text-center shadow-md shadow-indigo-100/50"
                >
                  <div
                    className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl ${game.color}`}
                  >
                    <Icon size={30} />
                  </div>

                  <h3 className="min-h-12 font-black text-indigo-950">
                    {game.name}
                  </h3>

                  <p className="mt-4 text-3xl font-black text-indigo-600">
                    {typeof gameScore === "number"
                      ? `${gameScore} / 5`
                      : "—"}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Completion message */}
        <div className="mt-12 rounded-[2rem] bg-indigo-600 p-8 text-center text-white shadow-lg shadow-indigo-200 sm:p-10">
          <Medal size={44} className="mx-auto mb-5 text-amber-300" />

          <h2 className="text-2xl font-black sm:text-3xl">
            Today's Adventure Is Complete!
          </h2>

          <p className="mx-auto mt-4 max-w-lg leading-relaxed text-indigo-100">
            You've practiced five vocabulary words across
            three challenges. Your results are saved to
            your calendar on this device.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/calendar"
              className="flex items-center gap-2 rounded-full bg-white px-7 py-4 font-black text-indigo-700"
            >
              <CalendarDays size={20} />
              My Calendar
            </Link>

            <Link
              to={`/words/${date}`}
              className="flex items-center gap-2 rounded-full border-2 border-white/40 px-7 py-4 font-black text-white"
            >
              <BookOpen size={20} />
              Review Words
            </Link>
          </div>
        </div>

        <div className="mt-10 text-center">
          <Link
            to="/"
            className="inline-flex items-center gap-2 font-bold text-indigo-600"
          >
            <ArrowLeft size={19} />
            Back to OASYS
          </Link>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2 text-sm font-bold text-indigo-500">
          <Sparkles size={18} />
          Little steps. Lasting words.
        </div>
      </main>
    </div>
  );
}
