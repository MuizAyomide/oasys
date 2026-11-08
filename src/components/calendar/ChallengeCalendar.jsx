
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";
import {
  ChevronLeft,
  ChevronRight,
  Check,
  Lock,
  Play,
  Star,
} from "lucide-react";

import {
  toDateKey,
  getMonthDays,
  formatMonth,
} from "../../utils/date";

const weekdays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ChallengeCalendar({
  today,
  progress,
}) {
  const navigate = useNavigate();

  const [visibleMonth, setVisibleMonth] = useState(
    () => new Date(today.getFullYear(), today.getMonth(), 1)
  );

  const [selectedDate, setSelectedDate] = useState(
    () => toDateKey(today)
  );

  const year = visibleMonth.getFullYear();
  const month = visibleMonth.getMonth();
  const days = getMonthDays(year, month);

  const todayKey = toDateKey(today);

  const isCurrentMonth =
    year === today.getFullYear() &&
    month === today.getMonth();

  function changeMonth(amount) {
    const nextMonth = new Date(year, month + amount, 1);
    const currentMonth = new Date(
      today.getFullYear(),
      today.getMonth(),
      1
    );

    if (nextMonth > currentMonth) return;

    setVisibleMonth(nextMonth);
    setSelectedDate("");
  }

  function getStatus(date) {
    const key = toDateKey(date);

    if (progress[key]?.completed) return "completed";
    if (key === todayKey) return "today";
    if (key > todayKey) return "future";

    return "missed";
  }

  const selectedStatus = selectedDate
    ? selectedDate === todayKey
      ? progress[selectedDate]?.completed
        ? "completed"
        : "today"
      : progress[selectedDate]?.completed
        ? "completed"
        : "missed"
    : null;

  const selectedScore = selectedDate
    ? progress[selectedDate]?.score
    : null;

  const canOpen =
    selectedStatus === "today" ||
    selectedStatus === "completed";

  function openChallenge() {
    if (!canOpen) return;
    navigate(`/words/${selectedDate}`);
  }

  return (
    <div className="rounded-[2rem] border border-indigo-100 bg-white p-4 shadow-xl shadow-indigo-100/60 sm:p-7">
      {/* Month navigation */}
      <div className="mb-7 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          aria-label="Previous month"
          className="rounded-full bg-indigo-50 p-3 text-indigo-700 transition hover:bg-indigo-100"
        >
          <ChevronLeft size={22} />
        </button>

        <AnimatePresence mode="wait">
          <motion.h2
            key={`${year}-${month}`}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="text-center text-xl font-black text-indigo-950 sm:text-2xl"
          >
            {formatMonth(visibleMonth)}
          </motion.h2>
        </AnimatePresence>

        <button
          type="button"
          onClick={() => changeMonth(1)}
          disabled={isCurrentMonth}
          aria-label="Next month"
          className="rounded-full bg-indigo-50 p-3 text-indigo-700 transition hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-30"
        >
          <ChevronRight size={22} />
        </button>
      </div>

      {/* Calendar weekday headings */}
      <div className="mb-2 grid grid-cols-7 gap-1 text-center sm:gap-2">
        {weekdays.map((day) => (
          <div
            key={day}
            className="py-2 text-xs font-extrabold text-slate-400 sm:text-sm"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar dates */}
      <AnimatePresence mode="wait">
        <motion.div
          key={`${year}-${month}`}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="grid grid-cols-7 gap-1 sm:gap-2"
        >
          {days.map((date, index) => {
            if (!date) {
              return <div key={`empty-${index}`} />;
            }

            const key = toDateKey(date);
            const status = getStatus(date);
            const isSelected = selectedDate === key;

            const styles = {
              completed:
                "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
              today:
                "bg-indigo-600 text-white shadow-lg shadow-indigo-200",
              missed:
                "bg-slate-100 text-slate-500",
              future:
                "bg-slate-50 text-slate-300",
            };

            return (
              <motion.button
                key={key}
                type="button"
                whileHover={
                  status !== "future" ? { scale: 1.06 } : {}
                }
                whileTap={
                  status !== "future" ? { scale: 0.94 } : {}
                }
                disabled={status === "future"}
                onClick={() => setSelectedDate(key)}
                aria-label={`${key}, ${status}`}
                aria-pressed={isSelected}
                className={`
                  relative flex aspect-square min-h-10 flex-col
                  items-center justify-center rounded-xl
                  font-extrabold transition sm:rounded-2xl
                  ${styles[status]}
                  ${isSelected ? "ring-2 ring-amber-400 ring-offset-2" : ""}
                  ${status === "future" ? "cursor-not-allowed" : "cursor-pointer"}
                `}
              >
                <span className="text-sm sm:text-lg">
                  {date.getDate()}
                </span>

                {status === "completed" && (
                  <Check
                    size={13}
                    strokeWidth={3}
                    className="absolute bottom-1"
                  />
                )}

                {status === "today" && (
                  <Star
                    size={12}
                    fill="currentColor"
                    className="absolute bottom-1"
                  />
                )}

                {status === "future" && (
                  <Lock
                    size={11}
                    className="absolute bottom-1"
                  />
                )}
              </motion.button>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {/* Calendar legend */}
      <div className="mt-8 flex flex-wrap justify-center gap-x-5 gap-y-3 border-t border-slate-100 pt-6 text-xs font-bold text-slate-600">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-400" />
          Completed
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-indigo-600" />
          Today
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-300" />
          Missed
        </span>

        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full border bg-slate-50" />
          Upcoming
        </span>
      </div>

      {/* Selected date information */}
      {selectedDate && (
        <motion.div
          key={selectedDate}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-7 rounded-2xl bg-indigo-50 p-5 sm:p-6"
        >
          <h3 className="text-lg font-black text-indigo-950">
            {selectedStatus === "completed"
              ? "Challenge Completed!"
              : selectedStatus === "today"
                ? "Today's Word Adventure"
                : "Challenge Not Completed"}
          </h3>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {selectedStatus === "completed"
              ? `You earned ${selectedScore ?? 0} out of 15 points on ${selectedDate}.`
              : selectedStatus === "today"
                ? "Five words and three fun mini-games are waiting for you!"
                : "This day has passed without a completed challenge."}
          </p>

          {canOpen && (
            <button
              type="button"
              onClick={openChallenge}
              className="mt-5 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-extrabold text-white transition hover:bg-indigo-700"
            >
              <Play size={18} fill="currentColor" />

              {selectedStatus === "completed"
                ? "Review My Words"
                : "Start Today's Challenge"}
            </button>
          )}
        </motion.div>
      )}
    </div>
  );
}
