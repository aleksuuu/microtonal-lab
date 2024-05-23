import "./index.scss";

interface Props {
  totalCorrect: number;
  totalWrong: number;
  totalQuestionsAnswered: number;
  totalSeconds: number;
}

const ExerciseResult = ({
  totalCorrect,
  totalWrong,
  totalQuestionsAnswered,
  totalSeconds,
}: Props) => {
  return (
    <p>
      {totalCorrect} {totalWrong} {totalQuestionsAnswered} {totalSeconds}
    </p>
  );
};

export default ExerciseResult;
