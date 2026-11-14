
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/config";

const quizCollection = collection(db, "quizQuestions");

export const GAME_TYPE_LABELS = {
  matching: "Match the Meaning",
  gap: "Fill the Gap",
};

function cleanText(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

export function validateQuizQuestion(data) {
  const wordId = cleanText(data.wordId);
  const gameType = data.gameType;
  const question = cleanText(data.question);

  if (!wordId) {
    throw new Error("Please select a vocabulary word.");
  }

  if (!["matching", "gap"].includes(gameType)) {
    throw new Error("Please select a valid mini-game.");
  }

  if (!question || question.length > 300) {
    throw new Error(
      "Enter a question between 1 and 300 characters."
    );
  }

  if (
    gameType === "gap" &&
    (question.match(/_{3}/g) || []).length !== 1
  ) {
    throw new Error(
      "Fill the Gap questions must contain exactly one ___ blank."
    );
  }

  if (!Array.isArray(data.options) || data.options.length !== 4) {
    throw new Error("Every question requires four answer options.");
  }

  const options = data.options.map(cleanText);

  if (options.some((option) => !option || option.length > 250)) {
    throw new Error(
      "All four options are required and must be under 251 characters."
    );
  }

  const uniqueOptions = new Set(
    options.map((option) => option.toLocaleLowerCase("en"))
  );

  if (uniqueOptions.size !== 4) {
    throw new Error("The four answers must be different.");
  }

  const correctIndex = Number(data.correctIndex);

  if (
    !Number.isInteger(correctIndex) ||
    correctIndex < 0 ||
    correctIndex > 3 ||
    data.correctIndex === ""
  ) {
    throw new Error("Choose the correct answer.");
  }

  return {
    wordId,
    gameType,
    question,
    options,
    correctIndex,
  };
}

async function verifyVocabularyWord(wordId) {
  const snapshot = await getDoc(doc(db, "vocabulary", wordId));

  if (!snapshot.exists()) {
    throw new Error("The selected vocabulary word no longer exists.");
  }

  if (snapshot.data().active !== true) {
    throw new Error(
      "The vocabulary word is archived. Choose an active word."
    );
  }
}

export async function getAllQuizQuestions() {
  const snapshot = await getDocs(quizCollection);

  return snapshot.docs
    .map((item) => ({
      id: item.id,
      ...item.data(),
    }))
    .sort((a, b) =>
      String(a.question || "").localeCompare(
        String(b.question || "")
      )
    );
}

export async function createQuizQuestion(data) {
  const validated = validateQuizQuestion(data);

  await verifyVocabularyWord(validated.wordId);

  const reference = await addDoc(quizCollection, {
    ...validated,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  return reference.id;
}

export async function updateQuizQuestion(questionId, data) {
  if (!questionId) {
    throw new Error("Missing question ID.");
  }

  const validated = validateQuizQuestion(data);

  await verifyVocabularyWord(validated.wordId);

  await updateDoc(doc(db, "quizQuestions", questionId), {
    ...validated,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteQuizQuestion(questionId) {
  if (!questionId) {
    throw new Error("Missing question ID.");
  }

  await deleteDoc(doc(db, "quizQuestions", questionId));
}
