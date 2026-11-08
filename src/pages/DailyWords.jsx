
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Gamepad2,
  Sparkles,
  Star,
} from "lucide-react";

import WordCard from "../components/words/WordCard";
import ProgressBar from "../components/ui/ProgressBar";
import { getDailyWords } from "../services/wordService";
import { fromDateKey, toDateKey } from "../utils/date";
import { getProgress } from "../utils/progress";

export default function DailyWords() {
  const { date } = useParams();
  const navigate = useNavigate();

  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [mode, setMode] = useState("intro");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [exploredIds, setExploredIds] = useState([]);

  const todayKey = toDateKey(new Date());
  const completed = getProgress()[date]?.completed === true;

  const allowed =
    fromDateKey(date) !== null &&
    (date === todayKey || (date < todayKey && completed));

  useEffect(() => {
    let active = true;

    async function loadWords() {
      if (!allowed) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const dailyWords = await getDailyWords(date);

        if (active) {
          setWords(dailyWords);
          setCurrentIndex(0);
          setRevealed(false);
          setExploredIds([]);
          setMode("intro");
        }
      } catch (err) {
        if (active) {
          setError(err.message || "Unable to load words");
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    loadWords();

    return () => {
      active = false;
    };
  }, [date, allowed]);

  function revealMeaning() {
    const currentWord = words[currentIndex];

    if (!currentWord) return;

    setRevealed(true);

    setExploredIds((previous) => {
      if (previous.includes(currentWord.id)) {
        return previous;
      }

      return [...previous, currentWord.id];
    });
  }

  function changeWord(direction) {
    const next = currentIndex + direction;

    if (next < 0 || next >= words.length) return;

    setCurrentIndex(next);
    setRevealed(false);
  }

  function startChallenge() {
    if (completed) return;

    navigate(`/challenge/${date}`);
  }

  if (!allowed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-indigo-50 px-5 text-center">
        <h1 className="text-3xl font-black text-indigo-950">
          Challenge Unavailable
        </h1>

        <p className="mt-4 max-w-md text-slate-600">
          You can explore today's words or review a completed day.
        </p>

        <Link
          to="/calendar"
          className="mt-7 font-bold text-indigo-600 underline"
        >
          Back to Calendar
        </Link>
      </main>
    );
  }

  if (loading) {
    return (
      <main
        role="status"
        className="flex min-h-screen items-center justify-center bg-indigo-50"
      >
        <div className="text-center">
          <Sparkles
            size={40}
            className="mx-auto mb-4 animate-pulse text-indigo-600"
          />
          <p className="font-bold text-indigo-900">
            Gathering your words...
          </p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center px-5 text-center">
        <h1 className="text-2xl font-black text-indigo-950">
          We couldn't load your words.
        </h1>

        <p className="mt-3 text-slate-600">{error}</p>

        <Link
          to="/calendar"
          className="mt-6 font-bold text-indigo-600 underline"
        >
          Return to Calendar
        </Link>
      </main>
    );
  }

  const activeWord = words[currentIndex];

  if (!activeWord) {
    return <p className="p-10 text-center">No words available.</p>;
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      <header className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-6">
        <Link
          to="/calendar"
          className="flex items-center gap-2 font-extrabold text-indigo-700"
        >
          <ArrowLeft size={20} />
          Calendar
        </Link>

        <span className="flex items-center gap-2 font-black text-indigo-950">
          <Sparkles size={20} className="text-indigo-600" />
          OASYS
        </span>
      </header>

      <main className="mx-auto max-w-6xl px-5 pb-20 pt-9">
        <AnimatePresence mode="wait">
          {mode === "intro" ? (
            <motion.section
              key="intro"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -25 }}
              transition={{ duration: 0.35 }}
              className="mx-auto max-w-4xl text-center"
            >
              <div className="mx-auto mb-7 flex h-24 w-24 items-center justify-center rounded-[2rem] bg-white shadow-xl shadow-indigo-100">
                <BookOpen size={49} className="text-indigo-600" />
              </div>

              <span className="inline-flex rounded-full bg-white px-5 py-2 font-bold text-indigo-600 shadow-sm">
                {date}
              </span>

              <h1 className="mt-7 text-4xl font-black text-indigo-950 sm:text-6xl">
                Today's
                <span className="mt-2 block text-purple-600">
                  Five Words!
                </span>
              </h1>

              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
                Five exciting words are waiting to be discovered!
                Explore their meanings, see how they're used,
                and get ready for three fun mini-games.
              </p>

              <div className="mt-12 grid gap-5 sm:grid-cols-2">
                <motion.button
                  type="button"
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setMode("explore")}
                  className="rounded-[2rem] border-2 border-indigo-100 bg-white p-8 text-left shadow-lg shadow-indigo-100/50"
                >
                  <BookOpen
                    size={38}
                    className="mb-6 text-indigo-600"
                  />

                  <h2 className="mb-3 text-2xl font-black text-indigo-950">
                    Explore the Words
                  </h2>

                  <p className="mb-6 leading-relaxed text-slate-600">
                    Discover meanings and example sentences
                    before you play.
                  </p>

                  <span className="flex items-center gap-2 font-black text-indigo-600">
                    Let's Explore <ArrowRight size={19} />
                  </span>
                </motion.button>

                <motion.button
                  type="button"
                  whileHover={{ y: -6 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={startChallenge}
                  disabled={completed}
                  className="rounded-[2rem] bg-indigo-600 p-8 text-left text-white shadow-lg shadow-indigo-200 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Gamepad2 size={39} className="mb-6" />

                  <h2 className="mb-3 text-2xl font-black">
                    {completed
                      ? "Challenge Completed"
                      : "Start the Challenge"}
                  </h2>

                  <p className="mb-6 leading-relaxed text-indigo-100">
                    {completed
                      ? "You've already finished this day's games. You can still review the words."
                      : "Ready to play? Jump straight into three mini-games and earn up to 15 points!"}
                  </p>

                  <span className="flex items-center gap-2 font-black">
                    {completed ? "Already Finished" : "Let's Play"}
                    {!completed && <ArrowRight size={19} />}
                    {completed && <CheckCircle2 size={19} />}
                  </span>
                </motion.button>
              </div>

              <div className="mt-10 flex flex-wrap justify-center gap-3">
                {words.map((word, index) => (
                  <span
                    key={word.id}
                    className="rounded-full bg-white px-4 py-2 text-sm font-bold text-indigo-600 shadow-sm"
                  >
                    <Star
                      size={12}
                      className="mr-1 inline text-amber-500"
                    />
                    Word {index + 1}
                  </span>
                ))}
              </div>
            </motion.section>
          ) : (
            <motion.section
              key="explore"
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mx-auto max-w-3xl"
            >
              <div className="mb-9 text-center">
                <p className="mb-3 font-black uppercase tracking-widest text-indigo-500">
                  Your Vocabulary Adventure
                </p>

                <h1 className="text-3xl font-black text-indigo-950 sm:text-4xl">
                  Let's Explore!
                </h1>

                <p className="mt-3 text-slate-600">
                  Reveal each word's meaning to learn something new.
                </p>
              </div>

              <div className="mb-9 rounded-3xl bg-white p-6 shadow-md shadow-indigo-100/50">
                <ProgressBar
                  current={exploredIds.length}
                  total={words.length}
                />
              </div>

              <div className="mb-7 flex flex-wrap justify-center gap-2">
                {words.map((word, index) => (
                  <button
                    key={word.id}
                    type="button"
                    onClick={() => {
                      setCurrentIndex(index);
                      setRevealed(false);
                    }}
                    aria-label={`Go to word ${index + 1}`}
                    aria-current={
                      currentIndex === index ? "step" : undefined
                    }
                    className={`flex h-11 w-11 items-center justify-center rounded-2xl font-black transition ${
                      currentIndex === index
                        ? "bg-indigo-600 text-white shadow-md"
                        : exploredIds.includes(word.id)
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-white text-indigo-400"
                    }`}
                  >
                    {exploredIds.includes(word.id) &&
                    currentIndex !== index ? (
                      <CheckCircle2 size={20} />
                    ) : (
                      index + 1
                    )}
                  </button>
                ))}
              </div>

              <div key={activeWord.id}>
                <WordCard
                  word={activeWord}
                  index={currentIndex}
                  total={words.length}
                  revealed={revealed}
                  onReveal={revealMeaning}
                  onHide={() => setRevealed(false)}
                />
              </div>

              <div className="mt-8 flex items-center justify-between gap-3">
                <button
                  type="button"
                  disabled={currentIndex === 0}
                  onClick={() => changeWord(-1)}
                  className="flex items-center gap-2 rounded-full bg-white px-5 py-4 font-extrabold text-indigo-700 shadow-sm disabled:opacity-40 sm:px-7"
                >
                  <ChevronLeft size={20} />
                  Previous
                </button>

                <button
                  type="button"
                  disabled={currentIndex === words.length - 1}
                  onClick={() => changeWord(1)}
                  className="flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-4 font-extrabold text-white shadow-md disabled:opacity-40 sm:px-7"
                >
                  Next
                  <ChevronRight size={20} />
                </button>
              </div>

              <div className="mt-10 rounded-[2rem] bg-white p-6 text-center shadow-md shadow-indigo-100/50 sm:p-8">
                <h2 className="text-2xl font-black text-indigo-950">
                  {exploredIds.length === words.length
                    ? "You've Explored Every Word!"
                    : "Ready for the Next Step?"}
                </h2>

                <p className="mx-auto mt-3 max-w-md text-slate-600">
                  {completed
                    ? "You can keep reviewing these words whenever you like."
                    : "You can start the games now, or continue reviewing until you're ready."}
                </p>

                <div className="mt-6 flex flex-wrap justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => setMode("intro")}
                    className="rounded-full border-2 border-indigo-100 px-6 py-3 font-black text-indigo-700"
                  >
                    Back to Choices
                  </button>

                  {!completed && (
                    <button
                      type="button"
                      onClick={startChallenge}
                      className="flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3 font-black text-white shadow-md transition hover:bg-indigo-700"
                    >
                      <Gamepad2 size={20} />
                      Start Challenge
                      <ArrowRight size={18} />
                    </button>
                  )}
                </div>
              </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
