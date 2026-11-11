
import ChoiceQuestion from "./ChoiceQuestion";
import { getOptions } from "../../utils/gameLogic";

export default function MatchingGame({
  words,
  index,
  answer,
  onAnswer,
  onNext,
  nextLabel,
}) {
  const word = words[index];

  return (
    <ChoiceQuestion
      heading="What does this word mean?"
      prompt={word.word}
      options={getOptions(words, index, "matching")}
      correctValue={word.meaning}
      answer={answer}
      onAnswer={onAnswer}
      onNext={onNext}
      nextLabel={nextLabel}
      accent="indigo"
    />
  );
}
