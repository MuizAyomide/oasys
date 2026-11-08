
import { motion, useReducedMotion } from "motion/react";

const words = [
  { text: "Explore", top: "12%", left: "8%", color: "#FFD166" },
  { text: "Imagine", top: "22%", left: "76%", color: "#A7F3D0" },
  { text: "Discover", top: "68%", left: "5%", color: "#FBCFE8" },
  { text: "Brilliant", top: "73%", left: "77%", color: "#BFDBFE" },
  { text: "Curious", top: "45%", left: "83%", color: "#DDD6FE" },
];

export default function AnimatedWords() {
  const reduceMotion = useReducedMotion();

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {words.map((word, index) => (
        <motion.div
          key={word.text}
          className="absolute hidden rounded-2xl px-5 py-3 font-bold shadow-lg sm:block"
          style={{
            top: word.top,
            left: word.left,
            backgroundColor: word.color,
            color: "#26375D",
            rotate: index % 2 ? 9 : -9,
          }}
          animate={
            reduceMotion
              ? {}
              : { y: [0, -18, 0], rotate: [-5, 5, -5] }
          }
          transition={{
            duration: 4 + index,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          {word.text}
        </motion.div>
      ))}
    </div>
  );
}
