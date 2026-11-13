
import { useEffect, useState } from "react";
import { Save, X } from "lucide-react";

const emptyWord = {
  word: "",
  meaning: "",
  example: "",
  gapSentence: "",
  spellingHint: "",
  pronunciation: "",
  difficulty: "easy",
  active: true,
};

function TextField({
  label,
  name,
  value,
  onChange,
  required = false,
  placeholder = "",
  maxLength = 500,
  multiline = false,
  helper = "",
}) {
  const commonProps = {
    id: name,
    name,
    value,
    onChange,
    required,
    maxLength,
    placeholder,
    className:
      "w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-indigo-500",
  };

  return (
    <div>
      <label
        htmlFor={name}
        className="mb-2 block text-sm font-extrabold text-slate-700"
      >
        {label}
        {required && <span className="ml-1 text-rose-500">*</span>}
      </label>

      {multiline ? (
        <textarea
          {...commonProps}
          rows={3}
        />
      ) : (
        <input
          {...commonProps}
          type="text"
        />
      )}

      {helper && (
        <p className="mt-2 text-xs leading-relaxed text-slate-500">
          {helper}
        </p>
      )}
    </div>
  );
}

export default function WordForm({
  initialData = null,
  onSave,
  onCancel,
  saving = false,
  error = "",
}) {
  const [form, setForm] = useState(emptyWord);

  const editing = Boolean(initialData?.id);

  useEffect(() => {
    if (!initialData) {
      setForm({ ...emptyWord });
      return;
    }

    setForm({
      word: initialData.word || "",
      meaning: initialData.meaning || "",
      example: initialData.example || "",
      gapSentence: initialData.gapSentence || "",
      spellingHint: initialData.spellingHint || "",
      pronunciation: initialData.pronunciation || "",
      difficulty: initialData.difficulty || "easy",
      active: initialData.active !== false,
    });
  }, [initialData]);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();
    if (saving) return;
    onSave(form);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex items-center justify-between gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-2xl font-black text-indigo-950">
            {editing ? "Edit Word" : "Add New Word"}
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Complete the vocabulary details below.
          </p>
        </div>

        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          aria-label="Close form"
          className="rounded-xl bg-slate-100 p-3 text-slate-600 hover:bg-slate-200"
        >
          <X size={21} />
        </button>
      </div>

      <TextField
        label="Vocabulary Word"
        name="word"
        value={form.word}
        onChange={handleChange}
        placeholder="e.g. Curious"
        maxLength={80}
        required
      />

      <TextField
        label="Meaning"
        name="meaning"
        value={form.meaning}
        onChange={handleChange}
        placeholder="What does this word mean?"
        required
        multiline
      />

      <TextField
        label="Example Sentence"
        name="example"
        value={form.example}
        onChange={handleChange}
        placeholder="The curious child asked many questions."
        required
        multiline
      />

      <TextField
        label="Fill-the-Gap Sentence"
        name="gapSentence"
        value={form.gapSentence}
        onChange={handleChange}
        placeholder="The ___ child asked many questions."
        required
        multiline
        helper="Replace the missing vocabulary word with three underscores (___). This is used in the Fill the Gap mini-game."
      />

      <TextField
        label="Spelling Hint (Optional)"
        name="spellingHint"
        value={form.spellingHint}
        onChange={handleChange}
        placeholder="C _ R I O U S"
        maxLength={120}
        helper="Used in Spell It. Leave blank if you don't want a hint."
      />

      <TextField
        label="Pronunciation (Optional)"
        name="pronunciation"
        value={form.pronunciation}
        onChange={handleChange}
        placeholder="Enter a verified pronunciation"
        maxLength={120}
        helper="Optional reference text. Audio playback is not part of Phase 5C."
      />

      <div>
        <label
          htmlFor="difficulty"
          className="mb-2 block text-sm font-extrabold text-slate-700"
        >
          Difficulty
        </label>

        <select
          id="difficulty"
          name="difficulty"
          value={form.difficulty}
          onChange={handleChange}
          className="w-full rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none focus:border-indigo-500"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <label className="flex items-center gap-3 rounded-xl bg-indigo-50 p-4">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(event) =>
            setForm((previous) => ({
              ...previous,
              active: event.target.checked,
            }))
          }
          className="h-5 w-5 accent-indigo-600"
        />

        <span className="font-bold text-indigo-950">
          Active — available for future daily challenges
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-xl bg-rose-50 p-4 text-sm font-semibold text-rose-700"
        >
          {error}
        </p>
      )}

      <div className="flex flex-wrap justify-end gap-3 border-t border-slate-100 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="rounded-full border border-slate-200 px-6 py-3 font-extrabold text-slate-600 hover:bg-slate-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-7 py-3 font-extrabold text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          <Save size={19} />
          {saving
            ? "Saving..."
            : editing
              ? "Save Changes"
              : "Add Word"}
        </button>
      </div>
    </form>
  );
}
