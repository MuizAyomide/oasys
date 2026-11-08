
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import ChallengeCalendar from "../components/calendar/ChallengeCalendar";
import { formatFullDate } from "../utils/date";
import { getProgress, getProgressStats } from "../utils/progress";

export default function Calendar() {
  const [today, setToday] = useState(() => new Date());
  const [progress, setProgress] = useState(getProgress);

  useEffect(() => {
    function refreshProgress() {
      setProgress(getProgress());
      setToday(new Date());
    }

    window.addEventListener("storage", refreshProgress);
    window.addEventListener(
      "oasys-progress-updated",
      refreshProgress
    );

    // Refresh when a learner returns to the tab.
    function handleVisibility() {
      if (document.visibilityState === "visible") {
        refreshProgress();
      }
    }

    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );

    return () => {
      window.removeEventListener("storage", refreshProgress);
      window.removeEventListener(
        "oasys-progress-updated",
        refreshProgress
      );
      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );
    };
  }, []);

  const stats = getProgressStats(progress);

  const cards = [
    {
      title: "Days Completed",
      value: stats.completedDays,
      icon: CheckCircle2,
      color: "bg-emerald-100 text-emerald-700",
    },
    {
      title: "Total Points",
      value: stats.totalPoints,
      icon: Trophy,
      color: "bg-amber-100 text-amber-700",
    },
    {
      title: "Perfect Days",
      value: stats.perfectDays,
      icon: Star,
      color: "bg-purple-100 text-purple-700",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="px-5 py-6 md:px-10">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-extrabold text-indigo-700 transition hover:text-indigo-900"
          >
            <ArrowLeft size={20} />
            Back Home
          </Link>

          <div className="flex items-center gap-2 font-black text-indigo-950">
            <Sparkles size={22} className="text-indigo-600" />
            OASYS
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-24 pt-8 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-12 text-center"
        >
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-indigo-600 shadow-sm">
            <CalendarDays size={19} />
            Your Daily Learning Journey
          </div>

          <h1 className="text-4xl font-black text-indigo-950 sm:text-5xl">
            Your Word Adventure
            <span className="mt-2 block text-purple-600">
              Calendar
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-slate-600">
            Every day is a new chance to discover five
            amazing words. Keep learning and watch
            your progress grow!
          </p>

          <p className="mt-5 font-bold text-indigo-500">
            {formatFullDate(today)}
          </p>
        </motion.div>

        {/* Progress cards */}
        <div className="mb-10 grid grid-cols-1 gap-4 sm:grid-cols-3">
          {cards.map((card, index) => {
            const Icon = card.icon;

            return (
              <motion.div
                key={card.title}
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center gap-5 rounded-3xl bg-white p-6 shadow-md shadow-indigo-100/60"
              >
                <div
                  className={`rounded-2xl p-4 ${card.color}`}
                >
                  <Icon size={28} />
                </div>

                <div>
                  <p className="text-3xl font-black text-indigo-950">
                    {card.value}
                  </p>

                  <p className="text-sm font-bold text-slate-500">
                    {card.title}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Interactive calendar */}
        <div className="mx-auto max-w-3xl">
          <ChallengeCalendar
            today={today}
            progress={progress}
          />
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-12 text-center text-lg font-extrabold text-indigo-500"
        >
          Little steps. Lasting words.
        </motion.p>
      </main>
    </div>
  );
}
