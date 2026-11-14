
import { useEffect, useState } from "react";
import {
  BookOpen,
  CheckCircle2,
  Save,
  X,
} from "lucide-react";

const emptyQuestion = {
  wordId: "",
  gameType: "matching",
  question: "",
  options: ["", "", "", ""],
  correctIndex: "",
};

const letters = ["A", "B", "C", "D"];

export default function QuizForm({
  words,
  initialData = null,
  onSave,
  onCancel,
  saving = false,
  error = "",
}) {
  const [form, setForm] = useState(emptyQuestion);

  const editing = Boolean(initialData?.id);

  useEffect(() => {
    if (!initialData) {
      setForm({
        ...emptyQuestion,
        options: ["", "", "", ""],
      });
      return;
    }

    setForm({
      wordId: initialData.wordId || "",
      gameType: initialData.gameType || "matching",
      question: initialData.question || "",
      options: Array.isArray(initialData.options)
        ? [...initialData.options]
        : ["", "", "", ""],
      correctIndex:
        Number.isInteger(initialData.correctIndex)
          ? String(initialData.correctIndex)
          : "",
    });
  }, [initialData]);

  function updateField(name, value) {
    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function updateOption(index, value) {
    setForm((previous) => ({
      ...previous,
      options: previous.options.map((option, i) =>
        i === index ? value : option
      ),
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    if (saving) return;

    onSave({
      ...form,
      correctIndex:
        form.correctIndex === ""
          ? ""
          : Number(form.correctIndex),
    });
  }

  const activeWords = words.filter(
    (word) => word.active === true
  );

  const selectedWord = words.find(
    (word) => word.id === form.wordId
  );

  const selectableWords = [...activeWords];

  if (
    selectedWord &&
    !selectableWords.some((word) => word.id === selectedWord.id)
  ) {
    selectableWords.unshift(selectedWord);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-5">
        <div>
          <h2 className="text-2xl font-black text-indigo-950">
            {editing ? "Edit Quiz Question" : "Add Quiz Question"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Link one question to a vocabulary word.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          aria-label="Close form"
          className="rounded-xl bg-slate-100 p-3 text-slate-600"
        >
          <X size={20} />
        </button>
      </div>

      {/* Vocabulary selection */}
      <div>
        <label
          htmlFor="quiz-word"
          className="mb-2 block font-extrabold text-slate-700"
        >
          Vocabulary Word *
        </label>

        <select
          id="quiz-word"
          required
          value={form.wordId}
          onChange={(event) =>
            updateField("wordId", event.target.value)
          }
          className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none focus:border-indigo-500"
        >
          <option value="">Select a word</option>

          {selectableWords.map((word) => (
            <option
              key={word.id}
              value={word.id}
              disabled={word.active !== true}
            >
              {word.word}
              {word.active !== true ? " (Archived)" : ""}
            </option>
          ))}
        </select>

        {selectedWord && (
          <div className="mt-3 flex items-start gap-2 rounded-xl bg-indigo-50 p-4 text-sm text-indigo-800">
            <BookOpen size={18} className="mt-0.5 shrink-0" />

            <p>
              <strong>Meaning:</strong>{" "}
              {selectedWord.meaning}
            </p>
          </div>
        )}
      </div>

      {/* Game type */}
      <div>
        <label
          htmlFor="quiz-game-type"
          className="mb-2 block font-extrabold text-slate-700"
        >
          Mini-Game *
        </label>

        <select
          id="quiz-game-type"
          value={form.gameType}
          onChange={(event) =>
            updateField("gameType", event.target.value)
          }
          className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none focus:border-indigo-500"
        >
          <option value="matching">Match the Meaning</option>
          <option value="gap">Fill the Gap</option>
        </select>
      </div>

      {/* Question */}
      <div>
        <label
          htmlFor="quiz-question"
          className="mb-2 block font-extrabold text-slate-700"
        >
          Question *
        </label>

        <textarea
          id="quiz-question"
          rows={3}
          required
          maxLength={300}
          value={form.question}
          onChange={(event) =>
            updateField("question", event.target.value)
          }
          placeholder={
            form.gameType === "matching"
              ? "What does the word Curious mean?"
              : "The ___ child asked many questions."
          }
          className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-4 text-slate-900 outline-none focus:border-indigo-500"
        />

        {form.gameType === "gap" && (
          <p className="mt-2 text-sm text-slate-500">
            Use three underscores (___) for the missing word.
          </p>
        )}
      </div>

      {/* Options */}
      <fieldset className="space-y-4">
        <legend className="mb-2 font-extrabold text-slate-700">
          Four Answer Options *
        </legend>

        <p className="text-sm text-slate-500">
          Enter four different answers, then select the correct one.
        </p>

        {form.options.map((option, index) => {
          const selected =
            form.correctIndex === String(index);

          return (
            <div
              key={index}
              className={`rounded-2xl border-2 p-4 ${
                selected
                  ? "border-emerald-400 bg-emerald-50"
                  : "border-slate-100 bg-slate-50"
              }`}
            >
              <div className="mb-3 flex items-center justify-between">
                <label
                  htmlFor={`quiz-option-${index}`}
                  className="font-black text-indigo-950"
                >
                  Option {letters[index]}
                </label>

                {selected && (
                  <CheckCircle2
                    size={20}
                    className="text-emerald-600"
                  />
                )}
              </div>

              <input
                id={`quiz-option-${index}`}
                type="text"
                required
                maxLength={250}
                value={option}
                onChange={(event) =>
                  updateOption(index, event.target.value)
                }
                placeholder={`Enter option ${letters[index]}`}
                className="w-full rounded-xl border-2 border-white bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
              />

              <label className="mt-3 flex cursor-pointer items-center gap-3 text-sm font-bold text-slate-700">
                <input
                  type="radio"
                  name="correctAnswer"
                  value={String(index)}
                  checked={selected}
                  onChange={() =>
                    updateField("correctIndex", String(index))
                  }
                  className="h-5 w-5 accent-emerald-600"
                />
                Mark as correct answer
              </label>
            </div>
          );
        })}
      </fieldset>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 p-4 font-semibold text-rose-700"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-6">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-full border-2 border-slate-200 px-6 py-3 font-extrabold text-slate-600"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving || activeWords.length === 0}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3 font-extrabold text-white transition hover:bg-indigo-700 disabled:opacity-40"
        >
          <Save size={19} />
          {saving
            ? "Saving..."
            : editing
              ? "Save Changes"
              : "Add Question"}
        </button>
      </div>
    </form>
  );
}
