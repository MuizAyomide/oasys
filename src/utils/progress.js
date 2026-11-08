
const STORAGE_KEY = "oasys_challenge_progress_v1";

export function getProgress() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) return {};

    const parsed = JSON.parse(saved);

    if (
      parsed === null ||
      Array.isArray(parsed) ||
      typeof parsed !== "object"
    ) {
      return {};
    }

    return parsed;
  } catch (error) {
    console.error("Unable to read progress:", error);
    return {};
  }
}

export function saveChallengeResult(dateKey, score) {
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(dateKey) ||
    !Number.isInteger(score) ||
    score < 0 ||
    score > 15
  ) {
    throw new Error("Invalid challenge result");
  }

  const progress = getProgress();

  // A completed challenge keeps its original score.
  if (progress[dateKey]?.completed) {
    return progress;
  }

  progress[dateKey] = {
    completed: true,
    score,
    completedAt: new Date().toISOString(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));

  window.dispatchEvent(new Event("oasys-progress-updated"));

  return progress;
}

export function getProgressStats(progress) {
  const completed = Object.values(progress).filter(
    (item) => item?.completed === true
  );

  const totalPoints = completed.reduce(
    (sum, item) => sum + (Number(item.score) || 0),
    0
  );

  return {
    completedDays: completed.length,
    totalPoints,
    perfectDays: completed.filter((item) => item.score === 15).length,
  };
}
