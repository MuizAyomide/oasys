
import { sampleWords } from "../data/sampleWords";
import { fromDateKey } from "../utils/date";

// Temporary development implementation.
// Firebase will later store five assigned word IDs per date.
export async function getDailyWords(dateKey) {
  const date = fromDateKey(dateKey);

  if (!date) {
    throw new Error("Invalid challenge date");
  }

  const words = sampleWords.slice(0, 5);

  if (words.length !== 5) {
    throw new Error("A daily challenge requires five words");
  }

  if (new Set(words.map((word) => word.id)).size !== 5) {
    throw new Error("Daily vocabulary contains duplicate words");
  }

  return words;
}
