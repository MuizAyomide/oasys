
import { Link } from "react-router-dom";
import { BookOpen, CalendarDays, Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <header className="relative z-20 w-full">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 md:px-10">
        <Link to="/" className="flex items-center gap-3">
          <div className="rounded-2xl bg-indigo-600 p-3 text-white shadow-md">
            <BookOpen size={26} />
          </div>

          <div>
            <span className="block text-2xl font-black tracking-tight text-indigo-950">
              OASYS
            </span>
            <span className="block text-xs font-bold tracking-widest text-indigo-500">
              FIVE WORDS CHALLENGE
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <span className="hidden items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-sm md:flex">
            <Sparkles size={17} />
            Little steps. Lasting words.
          </span>

          <Link
            to="/calendar"
            className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3 font-bold text-white shadow-md transition hover:bg-indigo-700"
          >
            <CalendarDays size={18} />
            <span className="hidden sm:inline">My Calendar</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
