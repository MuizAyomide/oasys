
export const GAME_TYPES = [
  "matching",
  "gap",
  "spelling",
];

export const GAME_INFO = {
  matching: {
    title: "Match the Meaning",
    description: "Choose the correct meaning.",
  },
  gap: {
    title: "Fill the Gap",
    description: "Complete the sentence.",
  },
  spelling: {
    title: "Spell It",
    description: "Type the correct word.",
  },
};

// Create four possible answers from the day's five words.
// The correct answer is placed in a different position.
export function getOptions(words, index, gameType) {
  const current = words[index];

  const getValue = (word) =>
    gameType === "matching" ? word.meaning : word.word;

  const correct = getValue(current);

  const distractors = words
    .filter((word) => word.id !== current.id)
    .map(getValue)
    .filter((value) => value !== correct);

  const uniqueDistractors = [...new Set(distractors)];

  if (uniqueDistractors.length < 3) {
    throw new Error(
      "At least four distinct choices are required."
    );
  }

  // Deterministic ordering prevents choices changing on rerender.
  const offset = (index * 2 + (gameType === "gap" ? 1 : 0)) %
    uniqueDistractors.length;

  const rotated = [
    ...uniqueDistractors.slice(offset),
    ...uniqueDistractors.slice(0, offset),
  ];

  const options = rotated.slice(0, 3);
  const correctPosition =
    (index + (gameType === "matching" ? 1 : 2)) % 4;

  options.splice(correctPosition, 0, correct);

  return options;
}

export function normalizeAnswer(value) {
  return String(value).trim().toLocaleLowerCase("en");
}

export function isCorrectAnswer(gameType, word, answer) {
  const expected =
    gameType === "matching"
      ? word.meaning
      : word.word;

  return normalizeAnswer(answer) === normalizeAnswer(expected);
}

export function calculateScores(answers) {
  const scores = {};

  for (const type of GAME_TYPES) {
    scores[type] = (answers[type] || []).filter(
      (answer) => answer?.correct === true
    ).length;
  }

  const total = GAME_TYPES.reduce(
    (sum, type) => sum + scores[type],
    0
  );

  return {
    ...scores,
    total,
    maximum: 15,
  };
}

export function isChallengeFinished(answers) {
  return GAME_TYPES.every(
    (type) =>
      Array.isArray(answers[type]) &&
      answers[type].length === 5 &&
      answers[type].every((answer) => answer !== null)
  );
}
