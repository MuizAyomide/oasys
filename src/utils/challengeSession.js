
import { GAME_TYPES } from "./gameLogic";

const PREFIX = "oasys_game_session_v1_";

export function createChallengeSession(date, words) {
  return {
    date,
    wordIds: words.map((word) => word.id),
    cursor: {
      gameIndex: 0,
      wordIndex: 0,
    },
    answers: {
      matching: Array(5).fill(null),
      gap: Array(5).fill(null),
      spelling: Array(5).fill(null),
    },
  };
}

export function getChallengeSession(date, words) {
  const fresh = createChallengeSession(date, words);

  try {
    const raw = localStorage.getItem(PREFIX + date);
    if (!raw) return fresh;

    const saved = JSON.parse(raw);

    if (
      saved.date !== date ||
      JSON.stringify(saved.wordIds) !==
        JSON.stringify(fresh.wordIds)
    ) {
      return fresh;
    }

    const validAnswers = GAME_TYPES.every((type) => {
      const entries = saved.answers?.[type];

      return (
        Array.isArray(entries) &&
        entries.length === 5 &&
        entries.every(
          (answer) =>
            answer === null ||
            (typeof answer?.value === "string" &&
              typeof answer?.correct === "boolean")
        )
      );
    });

    const { gameIndex, wordIndex } = saved.cursor || {};

    const validCursor =
      Number.isInteger(gameIndex) &&
      gameIndex >= 0 &&
      gameIndex < 3 &&
      Number.isInteger(wordIndex) &&
      wordIndex >= 0 &&
      wordIndex < 5;

    if (!validAnswers || !validCursor) return fresh;

    return saved;
  } catch {
    return fresh;
  }
}

export function saveGameSession(session) {
  localStorage.setItem(
    PREFIX + session.date,
    JSON.stringify(session)
  );
}

export function clearGameSession(date) {
  localStorage.removeItem(PREFIX + date);
}
