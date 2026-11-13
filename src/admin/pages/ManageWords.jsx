
import { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  Archive,
  ArrowLeft,
  BookOpen,
  CheckCircle2,
  LoaderCircle,
  Pencil,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Trash2,
  X,
} from "lucide-react";

import WordForm from "../components/WordForm";

import {
  createWord,
  deleteWordPermanently,
  getAllWords,
  setWordActive,
  updateWord,
} from "../../services/adminWordService";

export default function ManageWords() {
  const [words, setWords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState("");
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingWord, setEditingWord] = useState(null);

  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [notice, setNotice] = useState("");

  const loadWords = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getAllWords();
      setWords(data);
    } catch (err) {
      console.error("Unable to load vocabulary:", err);
      setError(err.message || "Unable to load vocabulary.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadWords();
  }, [loadWords]);

  const activeCount = words.filter(
    (word) => word.active !== false
  ).length;

  const archivedCount = words.length - activeCount;

  const filteredWords = useMemo(() => {
    const term = search.trim().toLocaleLowerCase("en");

    return words.filter((item) => {
      const active = item.active !== false;

      if (filter === "active" && !active) return false;
      if (filter === "archived" && active) return false;

      if (!term) return true;

      const searchable = [
        item.word,
        item.meaning,
        item.example,
      ]
        .filter(Boolean)
        .join(" ")
        .toLocaleLowerCase("en");

      return searchable.includes(term);
    });
  }, [words, search, filter]);

  function openCreateForm() {
    setEditingWord(null);
    setFormError("");
    setNotice("");
    setFormOpen(true);
  }

  function openEditForm(word) {
    setEditingWord(word);
    setFormError("");
    setNotice("");
    setFormOpen(true);
  }

  function closeForm() {
    if (saving) return;

    setFormOpen(false);
    setEditingWord(null);
    setFormError("");
  }

  async function handleSave(data) {
    if (saving) return;

    setSaving(true);
    setFormError("");
    setNotice("");

    try {
      if (editingWord) {
        await updateWord(editingWord.id, data);
      } else {
        await createWord(data);
      }

      const updatedWords = await getAllWords();
      setWords(updatedWords);

      setFormOpen(false);
      setEditingWord(null);

      setNotice(
        editingWord
          ? "Word updated successfully."
          : "New vocabulary word added successfully."
      );
    } catch (err) {
      console.error("Word save failed:", err);
      setFormError(err.message || "Unable to save the word.");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(word) {
    if (busyId) return;

    const currentlyActive = word.active !== false;

    const question = currentlyActive
      ? `Archive "${word.word}"? It will no longer be eligible for new daily challenges.`
      : `Restore "${word.word}" to the active vocabulary library?`;

    if (!window.confirm(question)) return;

    setBusyId(word.id);
    setError("");
    setNotice("");

    try {
      await setWordActive(word.id, !currentlyActive);

      setWords((previous) =>
        previous.map((item) =>
          item.id === word.id
            ? { ...item, active: !currentlyActive }
            : item
        )
      );

      setNotice(
        currentlyActive
          ? `"${word.word}" was archived.`
          : `"${word.word}" was restored.`
      );
    } catch (err) {
      setError(err.message || "Unable to update status.");
    } finally {
      setBusyId("");
    }
  }

  async function handleDelete(word) {
    if (busyId) return;

    const confirmed = window.confirm(
      `Permanently delete "${word.word}"?\n\n` +
      "This action cannot be undone. Words assigned to " +
      "daily challenges cannot be permanently deleted."
    );

    if (!confirmed) return;

    setBusyId(word.id);
    setError("");
    setNotice("");

    try {
      await deleteWordPermanently(word.id);

      setWords((previous) =>
        previous.filter((item) => item.id !== word.id)
      );

      setNotice(`"${word.word}" was permanently deleted.`);
    } catch (err) {
      setError(err.message || "Unable to delete the word.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-7">
      {/* Heading */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="mb-2 text-sm font-black uppercase tracking-widest text-indigo-500">
            Vocabulary Library
          </p>

          <h2 className="text-3xl font-black text-indigo-950">
            Manage Words
          </h2>

          <p className="mt-3 text-slate-600">
            Create, edit, search and organize OASYS vocabulary.
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateForm}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-4 font-extrabold text-white shadow-md transition hover:bg-indigo-700"
        >
          <Plus size={20} />
          Add New Word
        </button>
      </div>

      {/* Vocabulary counts */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          {
            title: "Total Words",
            value: words.length,
            icon: BookOpen,
          },
          {
            title: "Active Words",
            value: activeCount,
            icon: CheckCircle2,
          },
          {
            title: "Archived Words",
            value: archivedCount,
            icon: Archive,
          },
        ].map((stat) => {
          const Icon = stat.icon;

          return (
            <div
              key={stat.title}
              className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
                <Icon size={24} />
              </div>

              <div>
                <p className="text-2xl font-black text-indigo-950">
                  {loading ? "—" : stat.value}
                </p>

                <p className="text-sm font-semibold text-slate-500">
                  {stat.title}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Notifications */}
      {notice && (
        <div
          role="status"
          className="flex items-center justify-between gap-3 rounded-2xl bg-emerald-50 p-4 text-emerald-800"
        >
          <p className="font-bold">{notice}</p>

          <button
            type="button"
            aria-label="Dismiss message"
            onClick={() => setNotice("")}
          >
            <X size={19} />
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-2xl bg-rose-50 p-4 font-semibold text-rose-700"
        >
          {error}
        </div>
      )}

      {/* Form */}
      {formOpen && (
        <motion.section
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-indigo-100 bg-white p-5 shadow-lg shadow-indigo-100/50 sm:p-8"
        >
          <WordForm
            initialData={editingWord}
            onSave={handleSave}
            onCancel={closeForm}
            saving={saving}
            error={formError}
          />
        </motion.section>
      )}

      {/* Vocabulary table */}
      <section className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 p-5 sm:p-7">
          <div className="relative min-w-0 flex-1 sm:min-w-72">
            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="search"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search word or meaning..."
              aria-label="Search vocabulary"
              className="w-full rounded-xl border-2 border-slate-100 bg-slate-50 py-3 pl-12 pr-4 outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={filter}
            onChange={(event) => setFilter(event.target.value)}
            aria-label="Filter vocabulary by status"
            className="rounded-xl border-2 border-slate-100 bg-white px-4 py-3 font-bold text-slate-700"
          >
            <option value="all">All Words</option>
            <option value="active">Active</option>
            <option value="archived">Archived</option>
          </select>

          <button
            type="button"
            onClick={loadWords}
            disabled={loading}
            aria-label="Refresh vocabulary"
            className="rounded-xl bg-indigo-50 p-3 text-indigo-700 disabled:opacity-40"
          >
            <RefreshCw
              size={22}
              className={loading ? "animate-spin" : ""}
            />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[780px] text-left">
            <thead className="bg-slate-50 text-sm text-slate-500">
              <tr>
                <th className="px-6 py-4">Word</th>
                <th className="px-6 py-4">Meaning</th>
                <th className="px-6 py-4">Difficulty</th>
                <th className="px-6 py-4">Status</th>
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
                    Loading vocabulary...
                  </td>
                </tr>
              ) : filteredWords.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-16 text-center text-slate-500"
                  >
                    <BookOpen
                      size={39}
                      className="mx-auto mb-4 text-indigo-300"
                    />

                    <p className="text-lg font-bold text-indigo-950">
                      {words.length === 0
                        ? "Your vocabulary library is empty."
                        : "No matching words found."}
                    </p>

                    <p className="mt-2 text-sm">
                      {words.length === 0
                        ? "Use Add New Word to begin."
                        : "Try a different search or filter."}
                    </p>
                  </td>
                </tr>
              ) : (
                filteredWords.map((word) => {
                  const active = word.active !== false;
                  const busy = busyId === word.id;

                  return (
                    <tr key={word.id} className="hover:bg-indigo-50/40">
                      <td className="px-6 py-5">
                        <p className="font-black text-indigo-950">
                          {word.word}
                        </p>

                        <p className="mt-1 text-xs text-slate-400">
                          {word.pronunciation || "No pronunciation"}
                        </p>
                      </td>

                      <td className="max-w-xs px-6 py-5">
                        <p className="line-clamp-2 text-sm text-slate-600">
                          {word.meaning}
                        </p>
                      </td>

                      <td className="px-6 py-5">
                        <span className="rounded-full bg-slate-100 px-3 py-2 text-xs font-bold capitalize text-slate-600">
                          {word.difficulty || "easy"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <span
                          className={`rounded-full px-3 py-2 text-xs font-bold ${
                            active
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-100 text-slate-500"
                          }`}
                        >
                          {active ? "Active" : "Archived"}
                        </span>
                      </td>

                      <td className="px-6 py-5">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            title="Edit word"
                            aria-label={`Edit ${word.word}`}
                            disabled={Boolean(busyId)}
                            onClick={() => openEditForm(word)}
                            className="rounded-lg bg-indigo-50 p-2 text-indigo-700 hover:bg-indigo-100 disabled:opacity-40"
                          >
                            <Pencil size={18} />
                          </button>

                          <button
                            type="button"
                            title={active ? "Archive word" : "Restore word"}
                            aria-label={
                              `${active ? "Archive" : "Restore"} ${word.word}`
                            }
                            disabled={Boolean(busyId)}
                            onClick={() => handleToggleActive(word)}
                            className="rounded-lg bg-amber-50 p-2 text-amber-700 hover:bg-amber-100 disabled:opacity-40"
                          >
                            {active ? (
                              <Archive size={18} />
                            ) : (
                              <RotateCcw size={18} />
                            )}
                          </button>

                          <button
                            type="button"
                            title="Permanently delete word"
                            aria-label={`Permanently delete ${word.word}`}
                            disabled={Boolean(busyId)}
                            onClick={() => handleDelete(word)}
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
          Showing {loading ? "—" : filteredWords.length} of{" "}
          {loading ? "—" : words.length} words
        </div>
      </section>

      <p className="flex items-center gap-2 text-sm text-slate-500">
        <ArrowLeft size={16} />
        Archived words remain stored for historical challenge reviews.
      </p>
    </div>
  );
}
