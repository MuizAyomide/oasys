
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "motion/react";

import {
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  Gamepad2,
  Pencil,
  Puzzle,
  SpellCheck,
  Star,
  Trophy,
} from "lucide-react";

import MatchingGame from "../components/games/MatchingGame";
import FillGapGame from "../components/games/FillGapGame";
import SpellingGame from "../components/games/SpellingGame";

import { getDailyWords } from "../services/wordService";
import { fromDateKey, toDateKey } from "../utils/date";
import {
  getProgress,
  saveChallengeResult,
} from "../utils/progress";

import {
  GAME_TYPES,
  isCorrectAnswer,
  calculateScores,
  isChallengeFinished,
} from "../utils/gameLogic";

import {
  getChallengeSession,
  saveGameSession,
  clearGameSession,
} from "../utils/challengeSession";

const gameComponents = {
  matching: MatchingGame,
  gap: FillGapGame,
  spelling: SpellingGame,
};

const gameMeta = [
  {
    title: "Match the Meaning",
    icon: Puzzle,
    color: "text-amber-600",
  },
  {
    title: "Fill the Gap",
    icon: Pencil,
    color: "text-pink-600",
  },
  {
    title: "Spell It",
    icon: SpellCheck,
    color: "text-emerald-600",
  },
];

export default function Challenge() {
  const { date } = useParams();
  const navigate = useNavigate();

  const [words, setWords] = useState([]);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const todayKey = toDateKey(new Date());
  const validDate = fromDateKey(date) !== null;
  const completed = getProgress()[date]?.completed === true;

  const allowed =
    validDate && date === todayKey && !completed;

  useEffect(() => {
    let active = true;

    async function initialize() {
      if (!allowed) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError("");

      try {
        const dailyWords = await getDailyWords(date);

        if (active) {
          if (dailyWords.length !== 5) {
            throw new Error("Exactly five words are required.");
          }

          setWords(dailyWords);

          setSession(
            getChallengeSession(date, dailyWords)
          );
        }
      } catch (err) {
        if (active) {
          setError(
            err.message || "Unable to prepare the challenge."
          );
        }
      } finally {
        if (active) setLoading(false);
      }
    }

    initialize();

    return () => {
      active = false;
    };
  }, [date, allowed]);

  function updateSession(nextSession) {
    saveGameSession(nextSession);
    setSession(nextSession);
  }

  function submitAnswer(value) {
    if (!session) return;

    const { gameIndex, wordIndex } = session.cursor;
    const gameType = GAME_TYPES[gameIndex];
    const word = words[wordIndex];

    if (!gameType || !word) return;

    // Once answered, the question cannot award points again.
    if (session.answers[gameType][wordIndex] !== null) {
      return;
    }

    const correct = isCorrectAnswer(
      gameType,
      word,
      value
    );

    const updatedAnswers = {
      ...session.answers,
      [gameType]: session.answers[gameType].map(
        (entry, index) =>
          index === wordIndex
            ? { value, correct }
            : entry
      ),
    };

    updateSession({
      ...session,
      answers: updatedAnswers,
    });
  }

  function nextQuestion() {
    if (!session) return;

    const { gameIndex, wordIndex } = session.cursor;
    const gameType = GAME_TYPES[gameIndex];

    if (session.answers[gameType][wordIndex] === null) {
      return;
    }

    if (wordIndex < 4) {
      updateSession({
        ...session,
        cursor: {
          gameIndex,
          wordIndex: wordIndex + 1,
        },
      });

      return;
    }

    if (gameIndex < 2) {
      updateSession({
        ...session,
        cursor: {
          gameIndex: gameIndex + 1,
          wordIndex: 0,
        },
      });

      return;
    }

    finishChallenge();
  }

  function finishChallenge() {
    if (!session) return;

    if (!isChallengeFinished(session.answers)) {
      return;
    }

    if (getProgress()[date]?.completed) {
      navigate(`/results/${date}`, { replace: true });
      return;
    }

    const scores = calculateScores(session.answers);

    try {
      saveChallengeResult(date, scores.total, {
  matching: scores.matching,
  gap: scores.gap,
  spelling: scores.spelling,
});
      clearGameSession(date);

      navigate(`/results/${date}`, {
        replace: true,
      });
    } catch (err) {
      setError(
        err.message || "Unable to save your results."
      );
    }
  }

  if (!allowed) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-indigo-50 px-5 text-center">
        <Trophy size={52} className="mb-5 text-indigo-600" />

        <h1 className="text-3xl font-black text-indigo-950">
          {completed
            ? "Challenge Already Completed"
            : "Challenge Unavailable"}
        </h1>

        <p className="mt-4 max-w-md text-slate-600">
          {completed
            ? "You've already completed this day's challenge. Your results are saved."
            : "Only today's challenge is available to play."}
        </p>

        <Link
          to={completed ? `/results/${date}` : "/calendar"}
          className="mt-7 rounded-full bg-indigo-600 px-7 py-4 font-bold text-white"
        >
          {completed ? "View My Results" : "Back to Calendar"}
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
        <p className="text-xl font-bold text-indigo-700">
          Preparing your word games...
        </p>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-indigo-50 px-5 text-center">
        <h1 className="text-2xl font-black text-indigo-950">
          Something went wrong.
        </h1>

        <p className="mt-4 text-slate-600">{error}</p>

        <Link
          to="/calendar"
          className="mt-6 font-bold text-indigo-600 underline"
        >
          Back to Calendar
        </Link>
      </main>
    );
  }

  if (!session || words.length !== 5) {
    return null;
  }

  const { gameIndex, wordIndex } = session.cursor;
  const gameType = GAME_TYPES[gameIndex];
  const GameComponent = gameComponents[gameType];

  const answer = session.answers[gameType][wordIndex];
  const scores = calculateScores(session.answers);

  const answeredCount = GAME_TYPES.reduce(
    (sum, type) =>
      sum +
      session.answers[type].filter(
        (entry) => entry !== null
      ).length,
    0
  );

  const isLastQuestion =
    gameIndex === 2 && wordIndex === 4;

  const isLastInGame = wordIndex === 4;
  const nextLabel = isLastQuestion
    ? "See My Results"
    : isLastInGame
      ? "Next Mini-Game"
      : "Next Question";

  const ActiveIcon = gameMeta[gameIndex].icon;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 px-5 pb-20">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-4 py-7">
        <Link
          to={`/words/${date}`}
          className="flex items-center gap-2 font-extrabold text-indigo-700"
        >
          <ArrowLeft size={20} />
          <span className="hidden sm:inline">Back to Words</span>
          <span className="sm:hidden">Words</span>
        </Link>

        <span className="flex items-center gap-2 font-black text-indigo-950">
          <Gamepad2 className="text-indigo-600" />
          OASYS
        </span>
      </header>

      <main className="mx-auto max-w-3xl">
        {/* Game heading */}
        <div className="mb-8 text-center">
          <motion.div
            key={gameType}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-3xl bg-white shadow-lg shadow-indigo-100"
          >
            <ActiveIcon
              size={38}
              className={gameMeta[gameIndex].color}
            />
          </motion.div>

          <span className="rounded-full bg-white px-5 py-2 text-sm font-black text-indigo-600 shadow-sm">
            Game {gameIndex + 1} of 3
          </span>

          <h1 className="mt-5 text-3xl font-black text-indigo-950 sm:text-4xl">
            {gameMeta[gameIndex].title}
          </h1>

          <p className="mt-3 font-semibold text-slate-500">
            Question {wordIndex + 1} of 5
          </p>
        </div>

        {/* Overall progress */}
        <div className="mb-7 rounded-3xl bg-white p-5 shadow-md shadow-indigo-100/60">
          <div className="mb-3 flex items-center justify-between">
            <span className="flex items-center gap-2 font-extrabold text-indigo-950">
              <BookOpen size={19} />
              Challenge Progress
            </span>

            <span className="font-black text-indigo-600">
              {answeredCount} / 15
            </span>
          </div>

          <div
            role="progressbar"
            aria-label="Challenge questions completed"
            aria-valuemin={0}
            aria-valuemax={15}
            aria-valuenow={answeredCount}
            className="h-3 overflow-hidden rounded-full bg-indigo-100"
          >
            <motion.div
              animate={{
                width: `${(answeredCount / 15) * 100}%`,
              }}
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
            />
          </div>

          <div className="mt-5 flex items-center justify-between border-t border-indigo-50 pt-4">
            <span className="flex items-center gap-2 text-sm font-extrabold text-amber-600">
              <Star size={18} fill="currentColor" />
              Total Score
            </span>

            <span className="text-xl font-black text-indigo-950">
              {scores.total} / 15
            </span>
          </div>
        </div>

        {/* Mini-game progress indicators */}
        <div className="mb-7 grid grid-cols-3 gap-2">
          {gameMeta.map((game, index) => {
            const type = GAME_TYPES[index];
            const finished = session.answers[type].every(
              (item) => item !== null
            );

            return (
              <div
                key={type}
                className={`rounded-2xl p-3 text-center ${
                  index === gameIndex
                    ? "bg-indigo-600 text-white"
                    : finished
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-white text-slate-400"
                }`}
              >
                <p className="text-xs font-black">
                  Game {index + 1}
                </p>

                <p className="mt-1 text-lg font-black">
                  {finished ? (
                    <CheckCircle2
                      className="mx-auto"
                      size={21}
                    />
                  ) : (
                    `${scores[type]} / 5`
                  )}
                </p>
              </div>
            );
          })}
        </div>

        {/* Active mini-game */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${gameType}-${wordIndex}`}
            initial={{ opacity: 0, x: 25 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -25 }}
            transition={{ duration: 0.25 }}
          >
            <GameComponent
              words={words}
              index={wordIndex}
              answer={answer}
              onAnswer={submitAnswer}
              onNext={nextQuestion}
              nextLabel={nextLabel}
            />
          </motion.div>
        </AnimatePresence>

        <p className="mt-8 text-center text-sm font-semibold text-slate-500">
          Take your time. Every word is an opportunity to learn!
        </p>
      </main>
    </div>
  );
}
