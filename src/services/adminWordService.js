
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";

const wordsRef = collection(db, "vocabulary");

export function normalizeWord(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ");
}

export function validateWord(data) {
  const word = normalizeWord(data.word);
  const meaning = normalizeWord(data.meaning);
  const example = normalizeWord(data.example);
  const gapSentence = normalizeWord(data.gapSentence);
  const spellingHint = normalizeWord(data.spellingHint);
  const pronunciation = normalizeWord(data.pronunciation);

  if (!word || !meaning || !example || !gapSentence) {
    throw new Error(
      "Word, meaning, example and gap sentence are required."
    );
  }

  if (
    word.length > 80 ||
    meaning.length > 500 ||
    example.length > 500 ||
    gapSentence.length > 500 ||
    spellingHint.length > 120 ||
    pronunciation.length > 120
  ) {
    throw new Error("One or more fields exceed their length limit.");
  }

  if (!/_{2,}/.test(gapSentence)) {
    throw new Error(
      "The gap sentence must contain ___ where the word is missing."
    );
  }

  if (gapSentence.match(/_{2,}/g)?.length !== 1) {
    throw new Error(
      "The gap sentence must contain exactly one blank."
    );
  }

  if (!["easy", "medium", "hard"].includes(data.difficulty)) {
    throw new Error("Select a valid difficulty level.");
  }

  return {
    word,
    meaning,
    example,
    gapSentence,
    spellingHint,
    pronunciation,
    difficulty: data.difficulty,
    active: data.active !== false,
    normalizedWord: word.toLocaleLowerCase("en"),
  };
}

export async function getAllWords() {
  const snapshot = await getDocs(wordsRef);

  const words = snapshot.docs.map((item) => ({
    id: item.id,
    ...item.data(),
  }));

  return words.sort((a, b) =>
    String(a.word || "").localeCompare(String(b.word || ""))
  );
}

async function ensureNoDuplicate(word, excludeId = null) {
  // Development-stage duplicate check.
  // A server-enforced uniqueness system can be added if
  // multiple admins need simultaneous editing.
  const allWords = await getAllWords();

  const duplicate = allWords.find(
    (item) =>
      item.id !== excludeId &&
      normalizeWord(item.word).toLocaleLowerCase("en") ===
        word.toLocaleLowerCase("en")
  );

  if (duplicate) {
    throw new Error(`"${word}" already exists in your vocabulary.`);
  }
}

export async function createWord(data) {
  const validated = validateWord(data);

  await ensureNoDuplicate(validated.word);

  const reference = await addDoc(wordsRef, {
    ...validated,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateWord(wordId, data) {
  if (!wordId) throw new Error("Missing word ID.");

  const validated = validateWord(data);

  await ensureNoDuplicate(validated.word, wordId);

  await updateDoc(doc(db, "vocabulary", wordId), {
    ...validated,
    updatedAt: serverTimestamp(),
  });
}

export async function setWordActive(wordId, active) {
  await updateDoc(doc(db, "vocabulary", wordId), {
    active: Boolean(active),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteWordPermanently(wordId) {
  if (!wordId) throw new Error("Missing word ID.");

  // Don't remove words referenced by existing schedules.
  const assignments = query(
    collection(db, "dailyChallenges"),
    where("wordIds", "array-contains", wordId)
  );

  const snapshot = await getDocs(assignments);

  if (!snapshot.empty) {
    throw new Error(
      "This word has been assigned to a daily challenge. Archive it instead."
    );
  }

  await deleteDoc(doc(db, "vocabulary", wordId));
}
