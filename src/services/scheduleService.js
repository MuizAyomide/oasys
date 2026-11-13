
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "../firebase/config";
import { getOasysDateKey, addDaysToKey } from "../utils/challengeDate";

function validateDate(dateKey) {
  const today = getOasysDateKey();

  if (
    typeof dateKey !== "string" ||
    !/^\d{4}-\d{2}-\d{2}$/.test(dateKey) ||
    dateKey < today ||
    dateKey > addDaysToKey(today, 7)
  ) {
    throw new Error("Select a date from today through the next seven days.");
  }
}

export async function getActiveWords() {
  const snapshot = await getDocs(collection(db, "vocabulary"));

  return snapshot.docs
    .map((item) => ({ id: item.id, ...item.data() }))
    .filter((word) =>
      word.active === true &&
      typeof word.word === "string" &&
      word.word.trim()
    )
    .sort((a, b) => a.word.localeCompare(b.word));
}

export async function getSchedule(dateKey) {
  const snapshot = await getDoc(
    doc(db, "dailyChallenges", dateKey)
  );

  return snapshot.exists()
    ? { id: snapshot.id, ...snapshot.data() }
    : null;
}

export async function saveSchedule(dateKey, wordIds) {
  validateDate(dateKey);

  if (
    !Array.isArray(wordIds) ||
    wordIds.length !== 5 ||
    new Set(wordIds).size !== 5 ||
    wordIds.some((id) => typeof id !== "string" || !id.trim())
  ) {
    throw new Error("Choose exactly five different words.");
  }

  const scheduleRef = doc(db, "dailyChallenges", dateKey);
  const wordRefs = wordIds.map((id) => doc(db, "vocabulary", id));

  await runTransaction(db, async (transaction) => {
    const existing = await transaction.get(scheduleRef);

    if (existing.exists() && dateKey <= getOasysDateKey()) {
      throw new Error("Today's published assignment is locked.");
    }

    const wordSnapshots = [];

    for (const ref of wordRefs) {
      wordSnapshots.push(await transaction.get(ref));
    }

    if (wordSnapshots.some(
      (snapshot) => !snapshot.exists() ||
        snapshot.data().active !== true
    )) {
      throw new Error("Every selected word must be active.");
    }

    transaction.set(scheduleRef, {
      dateKey,
      wordIds,
      source: "manual",
      status: "scheduled",
      createdAt: existing.exists()
        ? existing.data().createdAt
        : serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  });

  return { status: "saved", dateKey, wordIds };
}

export async function autoAssignSchedule(dateKey) {
  validateDate(dateKey);

  const words = await getActiveWords();

  if (words.length < 5) {
    throw new Error("At least five active words are required.");
  }

  // Deterministic rotation by date.
  const offset = Number(dateKey.replace(/-/g, "")) % words.length;

  const wordIds = Array.from(
    { length: 5 },
    (_, index) => words[(offset + index) % words.length].id
  );

  const scheduleRef = doc(db, "dailyChallenges", dateKey);
  const wordRefs = wordIds.map((id) => doc(db, "vocabulary", id));

  return runTransaction(db, async (transaction) => {
    const existing = await transaction.get(scheduleRef);

    if (existing.exists()) {
      return {
        status: "existing",
        dateKey,
        wordIds: existing.data().wordIds,
      };
    }

    const wordSnapshots = [];

    for (const ref of wordRefs) {
      wordSnapshots.push(await transaction.get(ref));
    }

    if (wordSnapshots.some(
      (snapshot) => !snapshot.exists() ||
        snapshot.data().active !== true
    )) {
      throw new Error("Selected vocabulary changed. Refresh and retry.");
    }

    transaction.set(scheduleRef, {
      dateKey,
      wordIds,
      source: "automatic",
      status: "scheduled",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return { status: "created", dateKey, wordIds };
  });
}


export async function unscheduleDay(dateKey) {
  // Keep the existing date-window validation.
  validateDate(dateKey);

  const today = getOasysDateKey();

  if (dateKey <= today) {
    throw new Error(
      "Today's challenge cannot be unscheduled. Only future dates can be removed."
    );
  }

  const scheduleRef = doc(
    db,
    "dailyChallenges",
    dateKey
  );

  return runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(scheduleRef);

    if (!snapshot.exists()) {
      return {
        status: "already-unscheduled",
        dateKey,
      };
    }

    // A second client-side check before deleting.
    if (dateKey <= getOasysDateKey()) {
      throw new Error(
        "This date is now locked and cannot be unscheduled."
      );
    }

    transaction.delete(scheduleRef);

    return {
      status: "unscheduled",
      dateKey,
    };
  });
}
