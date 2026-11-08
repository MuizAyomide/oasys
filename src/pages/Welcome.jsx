
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Gamepad2,
  Sparkles,
  Star,
  Trophy,
} from "lucide-react";

import Navbar from "../components/layout/Navbar";
import AnimatedWords from "../components/ui/AnimatedWords";

const features = [
  {
    icon: BookOpen,
    title: "Learn 5 Words",
    description: "Discover five exciting words and what they mean.",
    color: "bg-amber-100 text-amber-700",
  },
  {
    icon: Gamepad2,
    title: "Play 3 Mini-Games",
    description: "Match meanings, fill gaps, and spell new words.",
    color: "bg-pink-100 text-pink-700",
  },
  {
    icon: Trophy,
    title: "Earn 15 Points",
    description: "Complete your daily challenge and track your progress.",
    color: "bg-emerald-100 text-emerald-700",
  },
];

export default function Welcome() {
  return (
    <div className="min-h-screen overflow-x-hidden bg-[#f9fff7]">
      <Navbar />

      <main>
        <section className="relative flex min-h-[82vh] items-center justify-center overflow-hidden px-5 py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-green-50 to-gray-100" />

          <AnimatedWords />

          <div className="relative z-10 mx-auto max-w-4xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-indigo-100 bg-white px-5 py-3 text-sm font-bold text-indigo-600 shadow-sm">
                <Sparkles size={18} />
                A New Word Adventure Every Day!
              </div>

              <h1 className="text-5xl font-black leading-tight tracking-tight text-indigo-950 sm:text-6xl lg:text-7xl">
                Welcome to
                <span className="mt-3 block text-indigo-600">
                  OASYS
                </span>
                <span className="mt-2 block text-3xl text-purple-600 sm:text-5xl">
                  FIVE WORDS CHALLENGE
                </span>
              </h1>

              <p className="mx-auto mt-8 max-w-2xl text-lg leading-relaxed text-slate-600 sm:text-xl">
                Five new words. Three fun mini-games.
                One exciting challenge every day!
                Explore, play, and grow your vocabulary
                one word at a time.
              </p>

              <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Link
                  to="/calendar"
                  className="group flex w-full items-center justify-center gap-3 rounded-full bg-indigo-600 px-9 py-5 text-lg font-extrabold text-white shadow-xl shadow-indigo-200 transition hover:-translate-y-1 hover:bg-indigo-700 sm:w-auto"
                >
                  Start Today's Adventure
                  <ArrowRight
                    size={22}
                    className="transition group-hover:translate-x-1"
                  />
                </Link>

                <a
                  href="#how-it-works"
                  className="flex w-full items-center justify-center gap-2 rounded-full border-2 border-indigo-200 bg-white px-8 py-5 text-lg font-bold text-indigo-700 transition hover:bg-indigo-50 sm:w-auto"
                >
                  <Brain size={21} />
                  How It Works
                </a>
              </div>

              <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
                <div className="rounded-full bg-white px-5 py-3 font-bold text-indigo-700 shadow-sm">
                  5 Words Daily
                </div>

                <div className="rounded-full bg-white px-5 py-3 font-bold text-purple-700 shadow-sm">
                  3 Mini-Games
                </div>

                <div className="flex items-center gap-2 rounded-full bg-white px-5 py-3 font-bold text-amber-600 shadow-sm">
                  <Star size={18} fill="currentColor" />
                  15 Points
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <section
          id="how-it-works"
          className="scroll-mt-10 px-5 py-24 md:px-10"
        >
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.6 }}
              className="mb-14 text-center"
            >
              <p className="mb-3 font-bold uppercase tracking-widest text-indigo-500">
                Your Daily Adventure
              </p>

              <h2 className="text-4xl font-black text-indigo-950 md:text-5xl">
                Learn. Play. Grow.
              </h2>

              <p className="mx-auto mt-5 max-w-xl text-lg text-slate-600">
                Building your vocabulary can be fun!
                Just follow these three simple steps.
              </p>
            </motion.div>

            <div className="grid gap-7 md:grid-cols-3">
              {features.map((feature, index) => {
                const Icon = feature.icon;

                return (
                  <motion.div
                    key={feature.title}
                    initial={{ opacity: 0, y: 40 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, amount: 0.2 }}
                    transition={{ delay: index * 0.12, duration: 0.5 }}
                    whileHover={{ y: -8 }}
                    className="rounded-[2rem] border border-indigo-50 bg-white p-9 text-center shadow-lg shadow-indigo-100/50"
                  >
                    <div
                      className={`mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-3xl ${feature.color}`}
                    >
                      <Icon size={36} />
                    </div>

                    <h3 className="mb-4 text-2xl font-extrabold text-indigo-950">
                      {feature.title}
                    </h3>

                    <p className="leading-relaxed text-slate-600">
                      {feature.description}
                    </p>
                  </motion.div>
                );
              })}
            </div>
          </div>
        </section>

        <section className="bg-indigo-600 px-5 py-20 text-center text-white">
          <Sparkles className="mx-auto mb-5" size={36} />

          <h2 className="text-3xl font-black md:text-5xl">
            Ready for Your First Challenge?
          </h2>

          <p className="mx-auto mt-5 max-w-xl text-lg text-indigo-100">
            Every great word adventure starts with one small step.
          </p>

          <Link
            to="/calendar"
            className="mt-8 inline-flex items-center gap-3 rounded-full bg-white px-9 py-4 text-lg font-extrabold text-indigo-700 transition hover:scale-105"
          >
            Let's Play
            <ArrowRight size={22} />
          </Link>
        </section>
      </main>

      <footer className="bg-indigo-950 px-5 py-8 text-center text-sm text-indigo-200">
        OASYS FIVE WORDS CHALLENGE
        <span className="mt-2 block">
          Little steps. Lasting words.
        </span>
      </footer>
    </div>
  );
}
