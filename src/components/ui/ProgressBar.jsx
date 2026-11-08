
import { motion } from "motion/react";
import { Star } from "lucide-react";

export default function ProgressBar({
  current = 0,
  total = 5,
}) {
  const percentage =
    total > 0 ? Math.min(100, (current / total) * 100) : 0;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between">
        <span className="flex items-center gap-2 font-extrabold text-indigo-950">
          <Star size={18} className="text-amber-500" />
          Words Explored
        </span>

        <span className="font-black text-indigo-600">
          {current} / {total}
        </span>
      </div>

      <div
        role="progressbar"
        aria-label="Words explored"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={current}
        className="h-4 overflow-hidden rounded-full bg-indigo-100"
      >
        <motion.div
          initial={false}
          animate={{ width: `${percentage}%` }}
          transition={{ type: "spring", stiffness: 110, damping: 20 }}
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-purple-500"
        />
      </div>

      {current === total && total > 0 && (
        <p className="mt-3 text-center text-sm font-bold text-emerald-700">
          Amazing! You've explored all five words!
        </p>
      )}
    </div>
  );
}
