
import { Link, useParams } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  Gamepad2,
  Puzzle,
  Pencil,
  SpellCheck,
  Trophy,
} from "lucide-react";

import { fromDateKey, toDateKey } from "../utils/date";
import { getProgress } from "../utils/progress";

const games = [
  {
    title: "Match the Meaning",
    description: "Connect each word to its correct meaning.",
    icon: Puzzle,
    color: "bg-amber-100 text-amber-700",
  },
  {
    title: "Fill the Gap",
    description: "Choose the word that completes the sentence.",
    icon: Pencil,
    color: "bg-pink-100 text-pink-700",
  },
  {
    title: "Spell It",
    description: "Put letters together to spell each word.",
    icon: SpellCheck,
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function Challenge() {
  const { date } = useParams();
  const todayKey = toDateKey(new Date());

  const validDate = fromDateKey(date) !== null;
  const completed = getProgress()[date]?.completed === true;

  if (!validDate || date !== todayKey || completed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-indigo-50 px-5 text-center">
        <h1 className="text-3xl font-black text-indigo-950">
          Challenge Unavailable
        </h1>
        <p className="mt-4 text-slate-600">
          Only today's unfinished challenge can be played.
        </p>
        <Link to="/calendar" className="mt-6 font-bold text-indigo-600 underline">
          Return to Calendar
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-100 px-5 py-10">
      <div className="mx-auto max-w-5xl">
        <Link
          to={`/words/${date}`}
          className="inline-flex items-center gap-2 font-bold text-indigo-700"
        >
          <ArrowLeft size={20} />
          Back to Words
        </Link>

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-14 text-center"
        >
          <Gamepad2 size={52} className="mx-auto mb-6 text-indigo-600" />

          <h1 className="text-4xl font-black text-indigo-950 sm:text-5xl">
            Challenge Time!
          </h1>

          <p className="mt-5 text-lg text-slate-600">
            Three exciting mini-games are coming next.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {games.map((game, index) => {
            const Icon = game.icon;

            return (
              <motion.div
                key={game.title}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.12 }}
                className="rounded-3xl bg-white p-8 text-center shadow-lg shadow-indigo-100/60"
              >
                <div
                  className={`mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl ${game.color}`}
                >
                  <Icon size={36} />
                </div>

                <h2 className="text-xl font-black text-indigo-950">
                  {game.title}
                </h2>

                <p className="mt-3 text-slate-600">
                  {game.description}
                </p>

                <span className="mt-5 inline-block rounded-full bg-indigo-50 px-5 py-2 font-black text-indigo-600">
                  5 Points
                </span>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 flex items-center justify-center gap-3 text-xl font-black text-indigo-700">
          <Trophy className="text-amber-500" size={30} />
          15 Total Points Available
        </div>

        <p className="mt-5 text-center text-sm text-slate-500">
          Game interactions and scoring will be added in Phase 4.
        </p>
      </div>
    </main>
  );
}
