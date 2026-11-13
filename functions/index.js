/**
 * Import function triggers from their respective submodules:
 *
 * const {onCall} = require("firebase-functions/v2/https");
 * const {onDocumentWritten} = require("firebase-functions/v2/firestore");
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// const {setGlobalOptions} = require("firebase-functions");
// const {onRequest} = require("firebase-functions/https");
// const logger = require("firebase-functions/logger");

// For cost control, you can set the maximum number of containers that can be
// running at the same time. This helps mitigate the impact of unexpected
// traffic spikes by instead downgrading performance. This limit is a
// per-function limit. You can override the limit for each function using the
// `maxInstances` option in the function's options, e.g.
// `onRequest({ maxInstances: 5 }, (req, res) => { ... })`.
// NOTE: setGlobalOptions does not apply to functions using the v1 API. V1
// functions should each use functions.runWith({ maxInstances: 10 }) instead.
// In the v1 API, each function can only serve one request per container, so
// this will be the maximum concurrent request count.
// setGlobalOptions({ maxInstances: 10 });

// Create and deploy your first functions
// https://firebase.google.com/docs/functions/get-started

// exports.helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });


const { onCall, HttpsError } = require("firebase-functions/v2/https");
const { onSchedule } = require("firebase-functions/v2/scheduler");
const { initializeApp } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

initializeApp();

const db = getFirestore();

const REGION = "us-central1";
const TIME_ZONE = "Africa/Lagos";

function dateKeyForLagos(date = new Date()) {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const find = (type) =>
    parts.find((part) => part.type === type).value;

  return `${find("year")}-${find("month")}-${find("day")}`;
}

function daysAfter(dateKey, days) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day + days))
    .toISOString()
    .slice(0, 10);
}

function validDateKey(key) {
  if (typeof key !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(key)) {
    return false;
  }

  const [y, m, d] = key.split("-").map(Number);
  const parsed = new Date(Date.UTC(y, m - 1, d));

  return !Number.isNaN(parsed.getTime()) &&
    parsed.toISOString().slice(0, 10) === key;
}

function assertScheduleWindow(dateKey) {
  const today = dateKeyForLagos();

  if (!validDateKey(dateKey) ||
      dateKey < today ||
      dateKey > daysAfter(today, 7)) {
    throw new HttpsError(
      "invalid-argument",
      "Select a date from today through the next seven days."
    );
  }
}

async function requireAdmin(request) {
  if (!request.auth?.uid) {
    throw new HttpsError(
      "unauthenticated",
      "Administrator login is required."
    );
  }

  const snapshot = await db
    .collection("admins")
    .doc(request.auth.uid)
    .get();

  if (
    !snapshot.exists ||
    snapshot.data().role !== "admin" ||
    snapshot.data().active !== true
  ) {
    throw new HttpsError(
      "permission-denied",
      "Administrator access is required."
    );
  }
}

function chooseFive(words, dateKey) {
  // Stable ordering ensures repeatable selection.
  const sorted = [...words].sort((a, b) =>
    a.id.localeCompare(b.id)
  );

  // Date-based offset rotates the selected vocabulary.
  const numericDate = Number(dateKey.replace(/-/g, ""));
  const offset = numericDate % sorted.length;

  return Array.from(
    { length: 5 },
    (_, index) => sorted[(offset + index) % sorted.length].id
  );
}

async function automaticallyAssign(dateKey) {
  const activeSnapshot = await db
    .collection("vocabulary")
    .where("active", "==", true)
    .get();

  const validWords = activeSnapshot.docs.filter((item) => {
    const data = item.data();
    return (
      typeof data.word === "string" &&
      data.word.trim().length > 0 &&
      typeof data.meaning === "string" &&
      data.meaning.trim().length > 0 &&
      typeof data.example === "string" &&
      typeof data.gapSentence === "string"
    );
  });

  const assignmentRef = db
    .collection("dailyChallenges")
    .doc(dateKey);

  return db.runTransaction(async (transaction) => {
    const existing = await transaction.get(assignmentRef);

    if (existing.exists) {
      return {
        status: "existing",
        dateKey,
        wordIds: existing.data().wordIds,
      };
    }

    if (validWords.length < 5) {
      throw new HttpsError(
        "failed-precondition",
        "At least five active vocabulary words are required."
      );
    }

    const selected = chooseFive(validWords, dateKey);

    // Verify selected words are still active inside the transaction.
    const references = selected.map((id) =>
      db.collection("vocabulary").doc(id)
    );

    const snapshots = await Promise.all(
      references.map((ref) => transaction.get(ref))
    );

    if (snapshots.some(
      (snap) => !snap.exists || snap.data().active !== true
    )) {
      throw new HttpsError(
        "aborted",
        "Vocabulary changed during scheduling. Try again."
      );
    }

    transaction.create(assignmentRef, {
      dateKey,
      wordIds: selected,
      source: "automatic",
      status: "scheduled",
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    return {
      status: "created",
      dateKey,
      wordIds: selected,
    };
  });
}

// Automatic daily assignment.
// Runs at 12:05 AM Lagos time.
exports.createDailyChallenge = onSchedule(
  {
    schedule: "5 0 * * *",
    timeZone: TIME_ZONE,
    region: REGION,
    retryCount: 3,
  },
  async () => {
    const today = dateKeyForLagos();

    try {
      const result = await automaticallyAssign(today);
      console.log("Daily challenge:", result);
    } catch (error) {
      console.error("Daily scheduling failed:", error);
      throw error;
    }
  }
);

// Admin can request automatic assignment for an empty date.
exports.autoAssignWords = onCall(
  { region: REGION },
  async (request) => {
    await requireAdmin(request);

    const dateKey = request.data?.dateKey;
    assertScheduleWindow(dateKey);

    return automaticallyAssign(dateKey);
  }
);

// Admin manually assigns exactly five words.
exports.saveDailySchedule = onCall(
  { region: REGION },
  async (request) => {
    await requireAdmin(request);

    const dateKey = request.data?.dateKey;
    const wordIds = request.data?.wordIds;

    assertScheduleWindow(dateKey);

    if (
      !Array.isArray(wordIds) ||
      wordIds.length !== 5 ||
      new Set(wordIds).size !== 5 ||
      wordIds.some(
        (id) => typeof id !== "string" || !id.trim()
      )
    ) {
      throw new HttpsError(
        "invalid-argument",
        "Select exactly five different words."
      );
    }

    const ref = db.collection("dailyChallenges").doc(dateKey);

    return db.runTransaction(async (transaction) => {
      const existing = await transaction.get(ref);

      const today = dateKeyForLagos();

      // A started or published daily challenge is immutable.
      if (existing.exists && dateKey <= today) {
        throw new HttpsError(
          "failed-precondition",
          "Today's existing schedule is locked."
        );
      }

      const wordRefs = wordIds.map((id) =>
        db.collection("vocabulary").doc(id)
      );

      const snapshots = await Promise.all(
        wordRefs.map((wordRef) => transaction.get(wordRef))
      );

      if (snapshots.some(
        (snap) => !snap.exists ||
          snap.data().active !== true
      )) {
        throw new HttpsError(
          "failed-precondition",
          "Every selected word must exist and be active."
        );
      }

      // Validate date again in case midnight passed.
      if (dateKey < dateKeyForLagos()) {
        throw new HttpsError(
          "failed-precondition",
          "This date is no longer available."
        );
      }

      transaction.set(ref, {
        dateKey,
        wordIds,
        source: "manual",
        status: "scheduled",
        createdAt: existing.exists
          ? existing.data().createdAt
          : FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });

      return {
        status: "saved",
        dateKey,
        wordIds,
      };
    });
  }
);