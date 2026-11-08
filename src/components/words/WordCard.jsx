
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  BookOpen,
  Lightbulb,
  RotateCcw,
  Sparkles,
} from "lucide-react";

const colors = [
  "from-amber-100 to-orange-50",
  "from-blue-100 to-cyan-50",
  "from-pink-100 to-rose-50",
  "from-emerald-100 to-lime-50",
  "from-purple-100 to-indigo-50",
];

export default function WordCard({
  word,
  index,
  total,
  revealed,
  onReveal,
  onHide,
}) {
  const reduceMotion = useReducedMotion();

  return (
    <div className="mx-auto w-full max-w-2xl">
      <div className="relative min-h-[360px] overflow-hidden rounded-[2rem] border-4 border-white bg-white shadow-xl shadow-indigo-100 sm:min-h-[390px]">
        <div
          className={`absolute inset-0 bg-gradient-to-br ${colors[index % colors.length]}`}
        />

        <div className="absolute right-5 top-5 rounded-full bg-white/80 px-4 py-2 text-sm font-black text-indigo-700">
          {index + 1} / {total}
        </div>

        <AnimatePresence mode="wait" initial={false}>
          {!revealed ? (
            <motion.div
              key={`${word.id}-front`}
              initial={{ opacity: 0, rotateY: -65, scale: 0.95 }}
              animate={{
                opacity: 1,
                rotateY: 0,
                scale: 1,
              }}
              exit={{ opacity: 0, rotateY: 65, scale: 0.95 }}
              transition={{
                duration: reduceMotion ? 0 : 0.35,
              }}
              className="relative flex min-h-[360px] flex-col items-center justify-center px-7 py-14 text-center sm:min-h-[390px]"
            >
              <motion.div
                animate={
                  reduceMotion
                    ? {}
                    : { y: [0, -7, 0] }
                }
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="mb-6 rounded-3xl bg-white p-5 shadow-md"
              >
                <Sparkles size={40} className="text-amber-500" />
              </motion.div>

              <p className="mb-3 text-sm font-black uppercase tracking-[0.2em] text-indigo-500">
                Word {index + 1}
              </p>

              <h2 className="mb-6 break-words text-4xl font-black text-indigo-950 sm:text-6xl">
                {word.word}
              </h2>

              <p className="mb-7 max-w-sm text-slate-600">
                Ready to discover what this word means?
              </p>

              <button
                type="button"
                onClick={onReveal}
                className="flex items-center gap-2 rounded-full bg-indigo-600 px-8 py-4 font-extrabold text-white shadow-lg transition hover:bg-indigo-700"
              >
                <Lightbulb size={21} />
                Reveal Meaning
              </button>
            </motion.div>
          ) : (
            <motion.div
              key={`${word.id}-back`}
              initial={{ opacity: 0, rotateY: 65, scale: 0.95 }}
              animate={{
                opacity: 1,
                rotateY: 0,
                scale: 1,
              }}
              exit={{ opacity: 0, rotateY: -65, scale: 0.95 }}
              transition={{
                duration: reduceMotion ? 0 : 0.35,
              }}
              className="relative flex min-h-[360px] flex-col items-center justify-center px-6 py-12 text-center sm:min-h-[390px]"
            >
              <div className="mb-5 rounded-2xl bg-white p-3 shadow-sm">
                <BookOpen size={28} className="text-indigo-600" />
              </div>

              <h2 className="mb-4 break-words text-3xl font-black text-indigo-950 sm:text-4xl">
                {word.word}
              </h2>

              <div className="w-full max-w-lg rounded-2xl bg-white/85 p-5">
                <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-purple-600">
                  Meaning
                </h3>

                <p className="text-lg font-bold leading-relaxed text-slate-800">
                  {word.meaning}
                </p>
              </div>

              <div className="mt-4 w-full max-w-lg rounded-2xl bg-white/70 p-5">
                <h3 className="mb-2 text-sm font-black uppercase tracking-wider text-emerald-700">
                  Example
                </h3>

                <p className="italic leading-relaxed text-slate-700">
                  "{word.example}"
                </p>
              </div>

              <button
                type="button"
                onClick={onHide}
                className="mt-6 flex items-center gap-2 font-extrabold text-indigo-600 hover:text-indigo-800"
              >
                <RotateCcw size={17} />
                Show Word Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
