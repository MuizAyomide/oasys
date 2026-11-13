
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";

import {
  AlertCircle,
  BookOpen,
  CalendarDays,
  CheckCircle2,
  Plus,
  RefreshCw,
  Sparkles,
  Users,
} from "lucide-react";

import { getDashboardData } from "../../services/dashboardService";
import { toDateKey, formatFullDate } from "../../utils/date";
import { useAuth } from "../../context/AuthContext";
import { getOasysDateKey } from "../../utils/challengeDate";

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  iconColor,
  loading,
  error,
  index,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm"
    >
      <div className={`mb-5 inline-flex rounded-2xl p-4 ${iconColor}`}>
        <Icon size={28} />
      </div>

      <p className="font-bold text-slate-600">
        {title}
      </p>

      {loading ? (
        <div
          role="status"
          className="mt-4 h-10 w-24 animate-pulse rounded-xl bg-slate-100"
        />
      ) : (
        <p className="mt-3 text-4xl font-black text-indigo-950">
          {value ?? "—"}
        </p>
      )}

      <p className="mt-3 text-sm leading-relaxed text-slate-500">
        {description}
      </p>

      {error && !loading && (
        <p
          role="alert"
          className="mt-3 flex items-start gap-2 text-sm font-semibold text-rose-600"
        >
          <AlertCircle size={16} className="mt-0.5 shrink-0" />
          {error}
        </p>
      )}
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [currentDate, setCurrentDate] = useState(
    () => new Date()
  );

  const loadDashboard = useCallback(async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const now = new Date();
      const dateKey = getOasysDateKey(now);

      const data = await getDashboardData(dateKey);

      setCurrentDate(now);
      setDashboard(data);
      setLastUpdated(new Date());
    } catch (error) {
      console.error("Dashboard loading failed:", error);

      setDashboard({
        totalWords: null,
        todaysWords: [],
        dailyStatus: "error",
        todaysCompletions: null,
        errors: {
          words: error.message,
          daily: error.message,
          completions: error.message,
        },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const totalWords = dashboard?.totalWords ?? null;
  const todaysWords = dashboard?.todaysWords ?? [];
  const todaysCompletions =
    dashboard?.todaysCompletions ?? null;

  const dailyStatus = dashboard?.dailyStatus;

  const stats = [
    {
      title: "Total Words",
      value: totalWords,
      description: "Vocabulary records stored in Firestore.",
      icon: BookOpen,
      iconColor: "bg-indigo-100 text-indigo-700",
      error: dashboard?.errors?.words,
    },
    {
      title: "Today's Words",
      value:
        dailyStatus === "scheduled"
          ? todaysWords.length
          : dailyStatus === "unscheduled"
            ? 0
            : null,
      description: "Words assigned to today's challenge.",
      icon: CalendarDays,
      iconColor: "bg-purple-100 text-purple-700",
      error: dashboard?.errors?.daily,
    },
    {
      title: "Today's Completions",
      value: todaysCompletions,
      description: "Completed attempts recorded in Firebase today.",
      icon: Users,
      iconColor: "bg-emerald-100 text-emerald-700",
      error: dashboard?.errors?.completions,
    },
  ];

  return (
    <div className="space-y-9">
      {/* Dashboard heading */}
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div>
          <p className="mb-2 flex items-center gap-2 font-bold text-indigo-600">
            <Sparkles size={19} />
            OASYS Administration
          </p>

          <h2 className="text-3xl font-black text-indigo-950">
            Welcome Back!
          </h2>

          <p className="mt-3 text-slate-600">
            Manage the daily vocabulary learning experience.
          </p>

          <p className="mt-2 text-sm font-semibold text-slate-500">
            {formatFullDate(currentDate)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => loadDashboard(true)}
          disabled={loading || refreshing}
          className="flex items-center gap-2 rounded-2xl border border-indigo-100 bg-white px-5 py-3 font-bold text-indigo-700 shadow-sm transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            size={19}
            className={refreshing ? "animate-spin" : ""}
          />

          {refreshing ? "Refreshing..." : "Refresh Data"}
        </button>
      </div>

      {/* Statistics */}
      <div className="grid gap-5 md:grid-cols-3">
        {stats.map((stat, index) => (
          <StatCard
            key={stat.title}
            {...stat}
            index={index}
            loading={loading}
          />
        ))}
      </div>

      {/* Today's assigned vocabulary */}
      <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <div className="mb-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-3 text-xl font-black text-indigo-950">
              <CalendarDays
                size={25}
                className="text-indigo-600"
              />
              Today's Five Words
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Vocabulary assigned for {getOasysDateKey(currentDate)}
            </p>
          </div>

          {dailyStatus === "scheduled" && !loading && (
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
              <CheckCircle2 size={17} />
              Scheduled
            </span>
          )}
        </div>

        {loading ? (
          <div role="status" className="grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 5 }, (_, index) => (
              <div
                key={index}
                className="h-20 animate-pulse rounded-2xl bg-slate-100"
              />
            ))}
          </div>
        ) : dailyStatus === "error" ? (
          <div
            role="alert"
            className="flex items-start gap-3 rounded-2xl bg-rose-50 p-5 text-rose-700"
          >
            <AlertCircle size={23} className="shrink-0" />
            <p>
              {dashboard?.errors?.daily ||
                "Unable to load today's vocabulary."}
            </p>
          </div>
        ) : dailyStatus === "unscheduled" ? (
          <div className="rounded-2xl bg-indigo-50 px-6 py-10 text-center">
            <CalendarDays
              size={42}
              className="mx-auto mb-5 text-indigo-500"
            />

            <h4 className="text-xl font-black text-indigo-950">
              No Words Scheduled for Today
            </h4>

            <p className="mx-auto mt-3 max-w-lg leading-relaxed text-slate-600">
              Today's vocabulary has not been assigned in Firestore.
              Daily scheduling and automatic selection will be
              implemented in Phase 5D.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {todaysWords.map((word, index) => (
              <motion.div
                key={word.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.07 }}
                className="flex items-center gap-4 rounded-2xl border border-indigo-50 bg-indigo-50/50 p-5"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-indigo-600 font-black text-white">
                  {index + 1}
                </div>

                <div className="min-w-0">
                  <h4 className="break-words text-lg font-black text-indigo-950">
                    {word.word}
                  </h4>

                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">
                    {word.meaning || "Meaning not provided"}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </section>

      {/* Quick action */}
      <section className="flex flex-wrap items-center justify-between gap-5 rounded-3xl border border-slate-100 bg-white p-7 shadow-sm">
        <div>
          <h3 className="text-xl font-black text-indigo-950">
            Vocabulary Management
          </h3>

          <p className="mt-2 text-slate-600">
            Add and organize the words used in daily challenges.
          </p>
        </div>

        <Link
          to="/admin/words"
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-4 font-extrabold text-white shadow-md shadow-indigo-100 transition hover:bg-indigo-700"
        >
          <Plus size={21} />
          Add New Word
        </Link>
      </section>

      {/* Dashboard footer */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-slate-500">
        <p>
          Signed in as{" "}
          <span className="font-bold text-indigo-700">
            {user?.email || "Administrator"}
          </span>
        </p>

        <p>
          {lastUpdated
            ? `Last refreshed: ${lastUpdated.toLocaleTimeString()}`
            : "Waiting for Firebase data"}
        </p>
      </div>
    </div>
  );
}
