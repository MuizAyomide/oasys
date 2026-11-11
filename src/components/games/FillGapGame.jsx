
import ChoiceQuestion from "./ChoiceQuestion";
import { getOptions } from "../../utils/gameLogic";

export default function FillGapGame({
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
      heading="Which word completes the sentence?"
      prompt={word.gapSentence}
      options={getOptions(words, index, "gap")}
      correctValue={word.word}
      answer={answer}
      onAnswer={onAnswer}
      onNext={onNext}
      nextLabel={nextLabel}
      accent="pink"
    />
  );
}
