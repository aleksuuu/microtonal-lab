import Button from "../Button";
import Stopwatch from "../Stopwatch";
import "./index.scss";

interface Props {
  totalCorrect: number;
  totalWrong: number;
  totalQuestionsAnswered: number;
  totalSeconds: number;
  reset: () => void;
}

const ExerciseResult = ({
  totalCorrect,
  totalWrong,
  totalQuestionsAnswered,
  totalSeconds,
  reset,
}: Props) => {
  return (
    <div className="exercise-result">
      <h2>Result</h2>
      <ul>
        <li>
          Time: <Stopwatch totalSeconds={totalSeconds}></Stopwatch>
        </li>
        <li>Total Questions Answered: {totalQuestionsAnswered}</li>
        <li>
          Average Number of Attempts:{" "}
          {(totalQuestionsAnswered
            ? (totalCorrect + totalWrong) / totalQuestionsAnswered
            : 0
          ).toFixed(2)}
        </li>
        <Button onClick={reset}>reset</Button>
      </ul>
    </div>
  );
};

export default ExerciseResult;
