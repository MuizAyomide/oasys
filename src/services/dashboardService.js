
import {
  collection,
  doc,
  getCountFromServer,
  getDoc,
  query,
  where,
} from "firebase/firestore";

import { db } from "../firebase/config";

// Count every vocabulary document in Firestore.
export async function getTotalWords() {
  const vocabularyRef = collection(db, "vocabulary");

  const snapshot = await getCountFromServer(vocabularyRef);

  return snapshot.data().count;
}

// Retrieve the five words assigned to a specific date.
export async function getTodaysWords(dateKey) {
  const challengeRef = doc(db, "dailyChallenges", dateKey);

  const challengeSnapshot = await getDoc(challengeRef);

  if (!challengeSnapshot.exists()) {
    return {
      status: "unscheduled",
      words: [],
    };
  }

  const challenge = challengeSnapshot.data();

  if (
    !Array.isArray(challenge.wordIds) ||
    challenge.wordIds.length !== 5 ||
    new Set(challenge.wordIds).size !== 5 ||
    challenge.wordIds.some(
      (id) => typeof id !== "string" || !id.trim()
    )
  ) {
    throw new Error(
      "Today's assignment must contain five unique word IDs."
    );
  }

  const wordSnapshots = await Promise.all(
    challenge.wordIds.map((id) =>
      getDoc(doc(db, "vocabulary", id))
    )
  );

  const missing = wordSnapshots.some(
    (snapshot) => !snapshot.exists()
  );

  if (missing) {
    throw new Error(
      "One or more assigned vocabulary records were not found."
    );
  }

  const words = wordSnapshots.map((snapshot) => ({
    id: snapshot.id,
    ...snapshot.data(),
  }));

  if (
    words.some(
      (item) =>
        typeof item.word !== "string" ||
        !item.word.trim()
    )
  ) {
    throw new Error(
      "One or more assigned records have no valid word."
    );
  }

  return {
    status: "scheduled",
    words,
  };
}

// Count submitted challenge results for the selected date.
//
// Future backend contract:
// - One authoritative completion record per learner per day
// - dateKey is stored as YYYY-MM-DD
// - Records are written only after challenge completion
export async function getTodaysCompletions(dateKey) {
  const resultsRef = collection(db, "challengeResults");

  const todayQuery = query(
    resultsRef,
    where("dateKey", "==", dateKey)
  );

  const snapshot = await getCountFromServer(todayQuery);

  return snapshot.data().count;
}

// Load the three dashboard sections independently.
export async function getDashboardData(dateKey) {
  const results = await Promise.allSettled([
    getTotalWords(),
    getTodaysWords(dateKey),
    getTodaysCompletions(dateKey),
  ]);

  const [wordsResult, dailyResult, completionsResult] = results;

  return {
    totalWords:
      wordsResult.status === "fulfilled"
        ? wordsResult.value
        : null,

    todaysWords:
      dailyResult.status === "fulfilled"
        ? dailyResult.value.words
        : [],

    dailyStatus:
      dailyResult.status === "fulfilled"
        ? dailyResult.value.status
        : "error",

    todaysCompletions:
      completionsResult.status === "fulfilled"
        ? completionsResult.value
        : null,

    errors: {
      words:
        wordsResult.status === "rejected"
          ? wordsResult.reason?.message || "Unable to load words."
          : null,

      daily:
        dailyResult.status === "rejected"
          ? dailyResult.reason?.message || "Unable to load assignment."
          : null,

      completions:
        completionsResult.status === "rejected"
          ? completionsResult.reason?.message || "Unable to load completions."
          : null,
    },
  };
}
