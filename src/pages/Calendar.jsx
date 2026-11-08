
import { Link } from "react-router-dom";
import { CalendarDays, ArrowLeft } from "lucide-react";

export default function Calendar() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-indigo-50 px-5 text-center">
      <CalendarDays size={70} className="mb-6 text-indigo-600" />

      <h1 className="text-4xl font-black text-indigo-950">
        Your Challenge Calendar
      </h1>

      <p className="mt-5 max-w-md text-lg text-slate-600">
        This is where you'll explore today's challenge,
        revisit completed days, and track your learning journey.
      </p>

      <Link
        to="/"
        className="mt-8 flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-4 font-bold text-white"
      >
        <ArrowLeft size={20} />
        Back to Welcome
      </Link>
    </main>
  );
}
