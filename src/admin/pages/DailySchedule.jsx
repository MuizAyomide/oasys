
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Lock,
  RefreshCw,
  Save,
  Search,
  Sparkles,
  WandSparkles,
  Trash2,
} from "lucide-react";

import {
  getActiveWords,
  getSchedule,
  saveSchedule,
  autoAssignSchedule,
  unscheduleDay,
} from "../../services/scheduleService";

import {
  getOasysDateKey,
  getScheduleDates,
  formatScheduleDate,
} from "../../utils/challengeDate";

export default function DailySchedule() {

  const [dates, setDates] = useState(() => getScheduleDates());
  const [selectedDate, setSelectedDate] = useState(
    () => getOasysDateKey()
  );

  const [words, setWords] = useState([]);
  const [schedules, setSchedules] = useState({});
  const [selectedWords, setSelectedWords] = useState([]);

  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const today = getOasysDateKey();
  const currentSchedule = schedules[selectedDate] || null;

  const isLocked = Boolean(
    currentSchedule && selectedDate <= today
  );

  const filteredWords = useMemo(() => {
    const term = search.trim().toLowerCase();

    return words.filter((item) =>
      item.word.toLowerCase().includes(term) ||
      String(item.meaning || "")
        .toLowerCase()
        .includes(term)
    );
  }, [words, search]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const nextDates = getScheduleDates();
      const availableWords = await getActiveWords();

      const records = await Promise.all(
        nextDates.map(async (date) => ({
          date,
          schedule: await getSchedule(date),
        }))
      );

      const scheduleMap = Object.fromEntries(
        records.map((record) => [
          record.date,
          record.schedule,
        ])
      );

      setDates(nextDates);
      setWords(availableWords);
      setSchedules(scheduleMap);

      setSelectedDate((previous) =>
        nextDates.includes(previous)
          ? previous
          : nextDates[0]
      );
    } catch (err) {
      console.error("Schedule loading error:", err);
      setError(err.message || "Unable to load schedule.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setSelectedWords(
      schedules[selectedDate]?.wordIds || []
    );
    setSearch("");
  }, [selectedDate, schedules]);

  function toggleWord(wordId) {
    if (saving || isLocked) return;

    setSelectedWords((previous) => {
      if (previous.includes(wordId)) {
        return previous.filter((id) => id !== wordId);
      }

      if (previous.length >= 5) {
        return previous;
      }

      return [...previous, wordId];
    });
  }

  async function refreshSelectedSchedule() {
    const updated = await getSchedule(selectedDate);

    setSchedules((previous) => ({
      ...previous,
      [selectedDate]: updated,
    }));

    return updated;
  }

  async function handleSave() {
    if (saving || isLocked) return;

    if (selectedWords.length !== 5) {
      setError("Please select exactly five words.");
      return;
    }

    setSaving(true);
    setError("");
    setNotice("");

    try {
      await saveSchedule(selectedDate, selectedWords);
      await refreshSelectedSchedule();

      setNotice(
        `Five words were scheduled for ${selectedDate}.`
      );
    } catch (err) {
      setError(err.message || "Unable to save schedule.");
    } finally {
      setSaving(false);
    }
  }

  async function handleAutoAssign() {
    if (saving || currentSchedule) return;

    if (words.length < 5) {
      setError(
        "Add at least five active vocabulary words first."
      );
      return;
    }





    setSaving(true);
    setError("");
    setNotice("");

    try {
      const result = await autoAssignSchedule(selectedDate);
      await refreshSelectedSchedule();

      setNotice(
        result.status === "existing"
          ? "A schedule already exists for this date."
          : `Five words were automatically assigned for ${selectedDate}.`
      );
    } catch (err) {
      setError(err.message || "Automatic assignment failed.");
    } finally {
      setSaving(false);
    }
  }

  async function handleUnschedule() {
  if (saving || !currentSchedule || isLocked) return;

  const confirmed = window.confirm(
    `Remove the five scheduled words for ${selectedDate}?\n\n` +
    "This date will become unscheduled and can be assigned again."
  );

  if (!confirmed) return;

  setSaving(true);
  setError("");
  setNotice("");

  try {
    await unscheduleDay(selectedDate);

    setSchedules((previous) => ({
      ...previous,
      [selectedDate]: null,
    }));

    setSelectedWords([]);

    setNotice(
      `${selectedDate} has been unscheduled successfully.`
    );
  } catch (err) {
    console.error("Unschedule failed:", err);

    setError(
      err.message || "Unable to unschedule this date."
    );
  } finally {
    setSaving(false);
  }
}

  const selectedWordDetails = selectedWords.map(
    (wordId) => {
      const activeWord = words.find(
        (word) => word.id === wordId
      );

      return {
        id: wordId,
        label: activeWord?.word || "Archived or missing word",
      };
    }
  );

  return (
    <div className="space-y-8">
      <div>
        <p className="mb-2 flex items-center gap-2 text-sm font-black uppercase tracking-widest text-indigo-600">
          <CalendarDays size={19} />
          Daily Challenge Management
        </p>

        <h2 className="text-3xl font-black text-indigo-950">
          Daily Word Schedule
        </h2>

        <p className="mt-3 max-w-2xl text-slate-600">
          Assign exactly five vocabulary words to each day.
          Unscheduled dates can receive an automatic selection.
        </p>

        <p className="mt-2 text-sm font-semibold text-indigo-500">
          Official OASYS time zone: Africa/Lagos
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="flex items-start gap-3 rounded-2xl bg-rose-50 p-5 text-rose-700"
        >
          <AlertCircle size={22} className="shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {notice && (
        <div
          role="status"
          className="flex items-start gap-3 rounded-2xl bg-emerald-50 p-5 text-emerald-700"
        >
          <CheckCircle2 size={22} className="shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="button"
          onClick={loadData}
          disabled={loading || saving}
          className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 font-bold text-indigo-700 shadow-sm disabled:opacity-50"
        >
          <RefreshCw
            size={18}
            className={loading ? "animate-spin" : ""}
          />
          Refresh Schedule
        </button>
      </div>

      {/* Eight-day schedule */}
      <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-7">
        <h3 className="mb-5 text-xl font-black text-indigo-950">
          Choose a Date
        </h3>

        {loading ? (
          <p className="py-8 text-center text-slate-500">
            Loading your schedule...
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {dates.map((date, index) => {
              const schedule = schedules[date];
              const selected = date === selectedDate;

              return (
                <button
                  key={date}
                  type="button"
                  onClick={() => {
                    setSelectedDate(date);
                    setError("");
                    setNotice("");
                  }}
                  disabled={saving}
                  aria-pressed={selected}
                  className={`rounded-2xl border-2 p-4 text-left transition ${
                    selected
                      ? "border-indigo-600 bg-indigo-50"
                      : "border-slate-100 bg-white hover:border-indigo-200"
                  }`}
                >
                  <p className="mb-2 text-xs font-black uppercase text-indigo-500">
                    {index === 0
                      ? "Today"
                      : index === 1
                        ? "Tomorrow"
                        : `Day ${index + 1}`}
                  </p>

                  <p className="text-sm font-extrabold text-indigo-950">
                    {formatScheduleDate(date)}
                  </p>

                  <span
                    className={`mt-3 inline-block rounded-full px-3 py-1 text-xs font-bold ${
                      schedule
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    }`}
                  >
                    {schedule ? "Scheduled" : "Not Scheduled"}
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </section>

      {!loading && (
        <motion.section
          key={selectedDate}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm sm:p-8"
        >
          <div className="mb-7 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-2xl font-black text-indigo-950">
                {formatScheduleDate(selectedDate)}
              </h3>

              <p className="mt-2 text-sm text-slate-500">
                {currentSchedule
                  ? `Assignment source: ${currentSchedule.source || "manual"}`
                  : "No assignment has been saved."}
              </p>
            </div>

            {isLocked && (
              <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 font-bold text-slate-600">
                <Lock size={17} />
                Locked for Today
              </span>
            )}
          </div>

          {/* Selected vocabulary */}
          <div className="mb-7 rounded-2xl bg-indigo-50 p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h4 className="font-black text-indigo-950">
                Selected Words
              </h4>

              <span className="font-black text-indigo-600">
                {selectedWords.length} / 5
              </span>
            </div>

            
<div className="flex min-h-12 flex-wrap gap-2">
  {selectedWordDetails.length > 0 ? (
    selectedWordDetails.map((word, index) => (
      <span
        key={word.id}
        className="inline-flex items-center gap-3 rounded-full bg-white px-4 py-2 text-sm font-bold text-indigo-700 shadow-sm"
      >
        <span>
          {index + 1}. {word.label}
        </span>

        {!isLocked && (
          <button
            type="button"
            disabled={saving}
            onClick={() => toggleWord(word.id)}
            aria-label={`Remove ${word.label}`}
            className="flex h-6 w-6 items-center justify-center rounded-full bg-rose-50 text-rose-600 transition hover:bg-rose-100 disabled:opacity-40"
          >
            ×
          </button>
        )}
      </span>
    ))
  ) : (
    <p className="text-sm text-slate-500">
      No words selected yet.
    </p>
  )}
</div>

          </div>

          {/* Vocabulary selector */}
          <div className="mb-7">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h4 className="font-black text-indigo-950">
                Choose From Active Vocabulary
              </h4>

              <span className="text-sm font-bold text-slate-500">
                {words.length} active words
              </span>
            </div>

            <div className="relative mb-4">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search vocabulary..."
                aria-label="Search active vocabulary"
                className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-3 pl-12 pr-4 outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid max-h-80 grid-cols-1 gap-3 overflow-y-auto sm:grid-cols-2">
              {filteredWords.map((word) => {
                const selected = selectedWords.includes(word.id);

                return (
                  <button
                    key={word.id}
                    type="button"
                    disabled={
                      saving ||
                      isLocked ||
                      (!selected && selectedWords.length >= 5)
                    }
                    onClick={() => toggleWord(word.id)}
                    aria-pressed={selected}
                    className={`flex items-center justify-between gap-3 rounded-xl border-2 p-4 text-left transition disabled:cursor-not-allowed disabled:opacity-50 ${
                      selected
                        ? "border-indigo-500 bg-indigo-50"
                        : "border-slate-100 hover:border-indigo-200"
                    }`}
                  >
                    <div className="min-w-0">
                      <p className="font-black text-indigo-950">
                        {word.word}
                      </p>

                      <p className="mt-1 line-clamp-2 text-xs text-slate-500">
                        {word.meaning}
                      </p>
                    </div>

                    <div
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 ${
                        selected
                          ? "border-indigo-600 bg-indigo-600 text-white"
                          : "border-slate-200"
                      }`}
                    >
                      {selected && <CheckCircle2 size={17} />}
                    </div>
                  </button>
                );
              })}
            </div>

            {filteredWords.length === 0 && (
              <p className="py-6 text-center text-slate-500">
                No matching active words found.
              </p>
            )}
          </div>

          
{/* Scheduling Actions */}
<div className="flex flex-wrap items-center gap-3 border-t border-slate-100 pt-6">

  {/* Save new or edited schedule */}
  {!isLocked && (
    <button
      type="button"
      onClick={handleSave}
      disabled={
        saving ||
        loading ||
        selectedWords.length !== 5
      }
      className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-4 font-extrabold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Save size={19} />

      {saving
        ? "Processing..."
        : currentSchedule
          ? "Update Schedule"
          : "Save Five Words"}
    </button>
  )}

  {/* Automatically assign an unscheduled date */}
  {!currentSchedule && !isLocked && (
    <button
      type="button"
      onClick={handleAutoAssign}
      disabled={saving || loading || words.length < 5}
      className="inline-flex items-center gap-2 rounded-full bg-amber-100 px-7 py-4 font-extrabold text-amber-800 transition hover:bg-amber-200 disabled:opacity-40"
    >
      <WandSparkles size={20} />
      Auto Assign Five Words
    </button>
  )}

  {/* Remove an existing future schedule */}
  {currentSchedule && !isLocked && (
    <button
      type="button"
      onClick={handleUnschedule}
      disabled={saving || loading}
      className="inline-flex items-center gap-2 rounded-full border-2 border-rose-200 bg-rose-50 px-7 py-4 font-extrabold text-rose-700 transition hover:bg-rose-100 disabled:cursor-not-allowed disabled:opacity-40"
    >
      <Trash2 size={19} />
      Unschedule Day
    </button>
  )}
</div>

{/* Today's assignment is locked */}
{isLocked && (
  <div className="mt-5 flex items-center gap-3 rounded-xl bg-slate-100 p-4 text-sm font-semibold text-slate-600">
    <Lock size={19} className="shrink-0" />
    Today's five words are already published and cannot be changed.
  </div>
)}


          {isLocked && (
            <p className="mt-5 flex items-center gap-2 text-sm font-semibold text-slate-500">
              <Lock size={17} />
              Today's existing assignment cannot be edited.
            </p>
          )}
        </motion.section>
      )}

      <div className="flex items-start gap-3 rounded-2xl bg-purple-50 p-5 text-purple-800">
        <Sparkles size={21} className="mt-0.5 shrink-0" />

        <p className="text-sm leading-relaxed">
          Unsheduled days will receive an automatic assignment
          when their daily Cloud Function runs, provided at
          least five eligible vocabulary words exist.
        </p>
      </div>
    </div>
  );
}
