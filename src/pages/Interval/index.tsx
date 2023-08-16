import Exercise from "../../components/Exercise";
import ExerciseSetUp from "../../components/ExerciseSetUp";
import { ExerciseMaker } from "../../common/ExerciseMaker";
import { useState } from "react";
import { useStopwatch } from "react-timer-hook";

const Interval = () => {
  let exerciseMaker = new ExerciseMaker(
    "24edo",
    true,
    false,
    true,
    true,
    220,
    659.3,
    5,
    true
  );
  const { totalSeconds, reset, pause } = useStopwatch({
    autoStart: true,
  });

  const loadExercise = () => {
    const err = exerciseMaker.validate();
    setError(err);
    if (err === "") {
      exerciseMaker.makeInterval();
      exerciseMaker.playInterval();
      setExerciseMakerObj(exerciseMaker);
      setExerciseIsHidden(false);
      reset();
    }
  };

  const [exerciseIsHidden, setExerciseIsHidden] = useState(true);
  const [error, setError] = useState("");
  const [exerciseMakerObj, setExerciseMakerObj] = useState(exerciseMaker);

  return (
    <>
      <ExerciseSetUp
        error={error}
        maker={exerciseMaker}
        hidden={!exerciseIsHidden}
        onClickStart={loadExercise}
      ></ExerciseSetUp>
      <Exercise
        maker={exerciseMakerObj}
        hidden={exerciseIsHidden}
        onClickBack={() => setExerciseIsHidden(true)}
        totalSeconds={totalSeconds}
        stopwatchPause={pause}
      ></Exercise>
    </>
  );
};

export default Interval;
