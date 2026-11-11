
import { useState } from "react";
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  Keyboard,
  Lightbulb,
  XCircle,
} from "lucide-react";

export default function SpellingGame({
  words,
  index,
  answer,
  onAnswer,
  onNext,
  nextLabel,
}) {
  const [input, setInput] = useState("");

  const word = words[index];
  const answered = answer !== null;

  function handleSubmit(event) {
    event.preventDefault();

    if (answered || !input.trim()) return;

    onAnswer(input.trim());
  }

  return (
    <div className="rounded-[2rem] bg-white p-6 shadow-xl shadow-indigo-100/60 sm:p-10">
      <div className="mb-5 flex justify-center">
        <div className="rounded-3xl bg-emerald-100 p-5 text-emerald-700">
          <Keyboard size={38} />
        </div>
      </div>

      <p className="text-center text-sm font-black uppercase tracking-widest text-emerald-600">
        Spell the mystery word!
      </p>

      <h2 className="mx-auto mt-5 max-w-lg text-center text-xl font-extrabold leading-relaxed text-indigo-950 sm:text-2xl">
        {word.meaning}
      </h2>

      <div className="mt-7 rounded-2xl bg-amber-50 p-5 text-center">
        <p className="flex items-center justify-center gap-2 font-bold text-amber-800">
          <Lightbulb size={20} />
          Spelling Hint
        </p>

        <p className="mt-3 break-words font-mono text-xl font-black tracking-widest text-amber-900 sm:text-2xl">
          {word.spellingHint}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8">
        <label
          htmlFor="spelling-answer"
          className="mb-3 block text-center font-bold text-slate-700"
        >
          Type your answer
        </label>

        <input
          id="spelling-answer"
          type="text"
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          disabled={answered}
          value={answered ? answer.value : input}
          onChange={(event) => setInput(event.target.value)}
          placeholder="Type the word here..."
          className="w-full rounded-2xl border-2 border-indigo-100 bg-indigo-50 px-5 py-5 text-center text-xl font-extrabold text-indigo-950 outline-none transition focus:border-indigo-500 disabled:opacity-75"
        />

        {!answered && (
          <button
            type="submit"
            disabled={!input.trim()}
            className="mt-5 w-full rounded-full bg-indigo-600 px-7 py-4 font-extrabold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Check My Spelling
          </button>
        )}
      </form>

      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          role="status"
          className={`mt-7 rounded-2xl p-5 ${
            answer.correct
              ? "bg-emerald-50 text-emerald-800"
              : "bg-rose-50 text-rose-800"
          }`}
        >
          <div className="flex items-center gap-3">
            {answer.correct ? (
              <CheckCircle2 size={26} />
            ) : (
              <XCircle size={26} />
            )}

            <p className="text-lg font-black">
              {answer.correct
                ? "Excellent Spelling! +1 Point!"
                : "Nice effort! Keep practicing!"}
            </p>
          </div>

          {!answer.correct && (
            <p className="mt-3">
              The correct spelling is{" "}
              <strong>{word.word}</strong>.
            </p>
          )}

          <button
            type="button"
            onClick={onNext}
            className="mt-5 flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-extrabold text-white transition hover:bg-indigo-700"
          >
            {nextLabel}
            <ArrowRight size={19} />
          </button>
        </motion.div>
      )}
    </div>
  );
}
