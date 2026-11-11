
import { motion } from "motion/react";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export default function ChoiceQuestion({
  heading,
  prompt,
  options,
  correctValue,
  answer,
  onAnswer,
  onNext,
  nextLabel,
  accent = "indigo",
}) {
  const answered = answer !== null;

  const accentClass =
    accent === "pink"
      ? "text-pink-600"
      : "text-indigo-600";

  return (
    <div className="rounded-[2rem] bg-white p-5 shadow-xl shadow-indigo-100/60 sm:p-9">
      <p
        className={`mb-3 text-center text-sm font-black uppercase tracking-widest ${accentClass}`}
      >
        {heading}
      </p>

      <h2 className="mb-8 text-center text-2xl font-black leading-relaxed text-indigo-950 sm:text-3xl">
        {prompt}
      </h2>

      <div className="grid gap-3">
        {options.map((option, index) => {
          const correctOption = option === correctValue;
          const selected = answer?.value === option;

          let style =
            "border-slate-100 bg-slate-50 text-slate-700 hover:border-indigo-200 hover:bg-indigo-50";

          if (answered) {
            style = "border-slate-100 bg-slate-50 text-slate-500";

            if (correctOption) {
              style =
                "border-emerald-400 bg-emerald-50 text-emerald-800";
            } else if (selected) {
              style =
                "border-rose-400 bg-rose-50 text-rose-800";
            }
          }

          return (
            <motion.button
              key={`${index}-${option}`}
              type="button"
              disabled={answered}
              onClick={() => onAnswer(option)}
              whileTap={!answered ? { scale: 0.98 } : {}}
              className={`flex min-h-16 w-full items-center gap-4 rounded-2xl border-2 p-4 text-left font-bold transition disabled:cursor-default ${style}`}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white font-black shadow-sm">
                {String.fromCharCode(65 + index)}
              </span>

              <span className="flex-1">{option}</span>

              {answered && correctOption && (
                <CheckCircle2
                  size={22}
                  className="shrink-0 text-emerald-600"
                />
              )}

              {answered && selected && !correctOption && (
                <XCircle
                  size={22}
                  className="shrink-0 text-rose-600"
                />
              )}
            </motion.button>
          );
        })}
      </div>

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
          <p className="text-lg font-black">
            {answer.correct
              ? "Wonderful! +1 Point!"
              : "Good try! Let's learn from this."}
          </p>

          {!answer.correct && (
            <p className="mt-2 text-sm">
              Correct answer: <strong>{correctValue}</strong>
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
