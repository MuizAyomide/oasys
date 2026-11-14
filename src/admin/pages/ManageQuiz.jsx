
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";

import {
  BookOpen,
  CheckCircle2,
  ListChecks,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import QuizForm from "../components/QuizForm";

import { getAllWords } from "../../services/adminWordService";

import {
  createQuizQuestion,
  deleteQuizQuestion,
  getAllQuizQuestions,
  updateQuizQuestion,
  GAME_TYPE_LABELS,
} from "../../services/adminQuizService";

export default function ManageQuiz() {
  const [questions, setQuestions] = useState([]);
  const [words, setWords] = useState([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState("");

  const [search, setSearch] = useState("");
  const [gameFilter, setGameFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [quizData, vocabularyData] = await Promise.all([
        getAllQuizQuestions(),
        getAllWords(),
      ]);

      setQuestions(quizData);
      setWords(vocabularyData);
    } catch (err) {
      console.error("Failed to load quiz data:", err);
      setError(err.message || "Unable to load quiz questions.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const wordMap = useMemo(
    () => new Map(words.map((word) => [word.id, word])),
    [words]
  );

  const filteredQuestions = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("en");

    return questions.filter((item) => {
      if (
        gameFilter !== "all" &&
        item.gameType !== gameFilter
      ) {
        return false;
      }

      if (!term) return true;

      const vocabularyWord = wordMap.get(item.wordId);

      const searchable = [
        vocabularyWord?.word,
        item.question,
        ...(item.options || []),
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("en");

      return searchable.includes(term);
    });
  }, [questions, search, gameFilter, wordMap]);

  const matchingCount = questions.filter(
    (item) => item.gameType === "matching"
  ).length;

  const gapCount = questions.filter(
    (item) => item.gameType === "gap"
  ).length;

  function openAddForm() {
    setEditingQuestion(null);
    setFormError("");
    setNotice("");
    setFormOpen(true);
  }

  function openEditForm(question) {
    setEditingQuestion(question);
    setFormError("");
    setNotice("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingQuestion(null);
    setFormError("");
  }

  async function handleSave(data) {
    if (saving) return;

    setSaving(true);
    setFormError("");
    setNotice("");

    const editing = Boolean(editingQuestion);

    try {
      if (editing) {
        await updateQuizQuestion(editingQuestion.id, data);
      } else {
        await createQuizQuestion(data);
      }

      const updated = await getAllQuizQuestions();
      setQuestions(updated);

      setEditingQuestion(null);
      setFormOpen(false);

      setNotice(
        editing
          ? "Quiz question updated successfully."
          : "Quiz question added successfully."
      );
    } catch (err) {
      console.error("Quiz save failed:", err);
      setFormError(err.message || "Unable to save question.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(question) {
    if (busyId) return;

    const confirmed = window.confirm(
      `Permanently delete this question?\n\n${question.question}\n\n` +
      "This action cannot be undone."
    );

    if (!confirmed) return;

    setBusyId(question.id);
    setError("");
    setNotice("");

    try {
      await deleteQuizQuestion(question.id);

      setQuestions((previous) =>
        previous.filter((item) => item.id !== question.id)
      );

      setNotice("Quiz question deleted successfully.");
    } catch (err) {
      console.error("Quiz deletion failed:", err);
      setError(err.message || "Unable to delete question.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-7">
      {/* Page heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-black uppercase tracking-widest text-indigo-500">
            Question Library
          </p>

          <h2 className="text-3xl font-black text-indigo-950">
            Manage Quiz
          </h2>

          <p className="mt-3 text-slate-600">
            Create and manage questions linked to OASYS vocabulary.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          disabled={loading || words.every((w) => w.active !== true)}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-4 font-extrabold text-white shadow-md hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={20} />
          Add Question
        </button>
      </div>

      {/* Summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            label: "Total Questions",
            value: questions.length,
            icon: ListChecks,
          },
          {
            label: "Matching Questions",
            value: matchingCount,
            icon: BookOpen,
          },
          {
            label: "Fill the Gap Questions",
            value: gapCount,
            icon: CheckCircle2,
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.label}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Icon size={25} />
              </div>

              <div>
                <p className="text-3xl font-black text-indigo-950">
                  {loading ? "—" : stat.value}
                </p>

                <p className="text-sm font-semibold text-slate-500">
                  {stat.label}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4 font-bold text-emerald-700"
        >
          {notice}
          <button
            type="button"
            aria-label="Dismiss notification"
            onClick={() => setNotice("")}
          >
            <X size={18} />
          </button>
        </div>
      )}

      {error && (
        <p
          role="alert"
          className="rounded-2xl bg-rose-50 p-5 font-semibold text-rose-700"
        >
          {error}
        </p>
      )}

      {/* Add/Edit form */}
      {formOpen && (
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-lg shadow-indigo-100/50 sm:p-8"
        >
          <QuizForm
            words={words}
            initialData={editingQuestion}
            onSave={handleSave}
            onCancel={closeForm}
            saving={saving}
            error={formError}
          />
        </motion.section>
      )}

      {/* Search and filters */}
      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-wrap gap-3 border-b border-slate-100 p-5 sm:p-7">
          <div className="relative min-w-0 flex-1 sm:min-w-64">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search questions or words..."
              aria-label="Search quiz questions"
              className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-3 pl-12 pr-4 outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={gameFilter}
            onChange={(event) => setGameFilter(event.target.value)}
            aria-label="Filter by mini-game"
            className="rounded-xl border-2 border-slate-100 bg-white px-4 py-3 font-bold text-slate-700"
          >
            <option value="all">All Mini-Games</option>
            <option value="matching">Match the Meaning</option>
            <option value="gap">Fill the Gap</option>
          </select>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            aria-label="Refresh questions"
            className="rounded-xl bg-indigo-50 p-3 text-indigo-700 disabled:opacity-40"
          >
            <RefreshCw
              size={21}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4">Word</th>
                <th className="px-6 py-4">Mini-Game</th>
                <th className="px-6 py-4">Question</th>
                <th className="px-6 py-4">Correct Answer</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-16 text-center">
                    <LoaderCircle
                      size={30}
                      className="mx-auto mb-3 animate-spin text-indigo-600"
                    />
                    Loading quiz questions...
                  </td>
                </tr>
              ) : filteredQuestions.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    <ListChecks
                      size={40}
                      className="mx-auto mb-4 text-indigo-300"
                    />

                    <p className="text-lg font-black text-indigo-950">
                      {questions.length === 0
                        ? "No quiz questions yet."
                        : "No matching questions found."}
                    </p>

                    <p className="mt-2 text-sm">
                      {questions.length === 0
                        ? "Use Add Question to create your first question."
                        : "Try another search or filter."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredQuestions.map((item) => {
                  const linkedWord = wordMap.get(item.wordId);
                  const answer = item.options?.[item.correctIndex];
                  const busy = busyId === item.id;

                  return (
                    <tr key={item.id} className="hover:bg-indigo-50/40">
                      <td className="px-6 py-5">
                        <p className="font-black text-indigo-950">
                          {linkedWord?.word || "Missing word"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-indigo-50 px-3 py-2 text-xs font-bold text-indigo-700">
                          {GAME_TYPE_LABELS[item.gameType] ||
                            item.gameType}
                        </span>
                      </td>

                      <td className="max-w-sm px-6 py-5">
                        <p className="line-clamp-3 text-sm text-slate-700">
                          {item.question}
                        </p>
                      </td>

                      <td className="max-w-xs px-6 py-5">
                        <p className="line-clamp-2 text-sm font-bold text-emerald-700">
                          {answer || "Not configured"}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Edit question"
                            aria-label={`Edit question: ${item.question}`}
                            disabled={Boolean(busyId)}
                            onClick={() => openEditForm(item)}
                            className="rounded-lg bg-indigo-50 p-2 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            title="Delete question"
                            aria-label={`Delete question: ${item.question}`}
                            disabled={Boolean(busyId)}
                            onClick={() => handleDelete(item)}
                            className="rounded-lg bg-rose-50 p-2 text-rose-700 hover:bg-rose-100 disabled:opacity-40"
                          >
                            {busy ? (
                              <LoaderCircle
                                size={18}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2 size={18} />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-6 py-4 text-sm text-slate-500">
          Showing {loading ? "—" : filteredQuestions.length} of{" "}
          {loading ? "—" : questions.length} questions
        </div>
      </section>
    </div>
  );
}
