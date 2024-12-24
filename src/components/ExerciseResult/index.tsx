import Button from "../Button";
import Stopwatch from "../Stopwatch";
import "./index.scss";
import { StatsPerQuestion } from "../../common/types";

interface Props {
  details: StatsPerQuestion[];
  totalQuestionsAnswered: number;
  totalSeconds: number;
  reset: () => void;
}

const ExerciseResult = ({
  details,
  totalQuestionsAnswered,
  totalSeconds,
  reset,
}: Props) => {
  const totalCorrect = (): number => {
    return details.reduce(
      (partialSum, detail) => partialSum + detail.numCorrect,
      0
    );
  };
  const totalWrong = (): number => {
    return details.reduce(
      (partialSum, detail) => partialSum + detail.numWrong,
      0
    );
  };

  const formatDetail = (
    key: number,
    detail: StatsPerQuestion
  ): React.ReactElement => {
    const numAttempts = detail.numCorrect + detail.numWrong;
    return (
      <tr key={key}>
        <td>{detail.interval?.name}</td>
        <td>{detail.numCorrect}</td>
        <td>{numAttempts}</td>
        <td>{((detail.numCorrect / numAttempts) * 100).toFixed(2)}%</td>
      </tr>
    );
  };

  const formatDetails = (): React.ReactElement => {
    const rows = [];
    for (const [index, detail] of details.entries()) {
      rows.push(formatDetail(index, detail));
    }
    return <tbody>{rows}</tbody>;
  };

  const totalAttempts = totalCorrect() + totalWrong();
  return (
    <div className="exercise-result">
      <h2>Result</h2>
      <ul>
        <li>
          Time: <Stopwatch totalSeconds={totalSeconds}></Stopwatch>
        </li>
        <li>Questions Answered: {totalQuestionsAnswered}</li>
        <li>
          Accuracy: {((100 * totalCorrect()) / totalAttempts).toFixed(2)}%
          [Correct Attempts ({totalCorrect()}) / Total Attempts ({totalAttempts}
          )]
          <table>
            <thead>
              <tr>
                <th scope="col">Interval</th>
                <th scope="col">Correct Attempts</th>
                <th scope="col">Total Attempts</th>
                <th scope="col">Accuracy</th>
              </tr>
            </thead>
            {formatDetails()}
          </table>
        </li>
        <Button onClick={reset}>reset</Button>
      </ul>
    </div>
  );
};

export default ExerciseResult;
