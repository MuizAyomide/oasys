
import { Link, useParams } from "react-router-dom";
import { BookOpen, ArrowLeft, Sparkles } from "lucide-react";

import { fromDateKey, toDateKey } from "../utils/date";
import { getProgress } from "../utils/progress";

export default function DailyWords() {
  const { date } = useParams();

  const parsedDate = fromDateKey(date);
  const todayKey = toDateKey(new Date());

  const completed = getProgress()[date]?.completed === true;

  const isAllowed =
    parsedDate &&
    (date === todayKey || (date < todayKey && completed));

  if (!isAllowed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-indigo-50 px-5 text-center">
        <h1 className="text-3xl font-black text-indigo-950">
          Challenge Unavailable
        </h1>
        <p className="mt-4 text-slate-600">
          Only today's challenge and completed days can be opened.
        </p>
        <Link
          to="/calendar"
          className="mt-6 font-bold text-indigo-600 underline"
        >
          Return to Calendar
        </Link>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-purple-100 to-indigo-100 px-5 text-center">
      <div className="mb-8 rounded-3xl bg-white p-6 shadow-lg">
        <BookOpen size={55} className="text-indigo-600" />
      </div>

      <div className="mb-5 flex items-center gap-2 font-bold text-indigo-600">
        <Sparkles size={18} />
        {date}
      </div>

      <h1 className="text-4xl font-black text-indigo-950 sm:text-5xl">
        Today's Five Words
      </h1>

      <p className="mt-6 max-w-lg text-lg leading-relaxed text-slate-600">
        {completed
          ? "Your completed vocabulary adventure will appear here."
          : "Your five vocabulary words will appear here, ready to explore before starting the mini-games."}
      </p>

      <p className="mt-4 text-sm font-semibold text-indigo-500">
        Word cards and challenge actions arrive in Phase 3.
      </p>

      <Link
        to="/calendar"
        className="mt-9 flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-4 font-bold text-white transition hover:bg-indigo-700"
      >
        <ArrowLeft size={20} />
        Back to Calendar
      </Link>
    </main>
  );
}
