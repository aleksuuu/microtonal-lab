import Exercise from "../../components/Exercise";
import ExerciseSetUp from "../../components/ExerciseSetUp";
import { ExerciseMaker } from "../../common/ExerciseMaker";
import { useRef, useState } from "react";
import { CanUseStopwatch } from "../../components/Stopwatch";

const Interval = () => {
  const ref = useRef<CanUseStopwatch>(null);
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

  const loadExercise = () => {
    const err = exerciseMaker.validate();
    setError(err);
    if (err === "") {
      exerciseMaker.makeInterval();
      exerciseMaker.playInterval();
      setExerciseMakerObj(exerciseMaker);
      setExerciseIsHidden(false);
      ref.current?.reset();
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
        ref={ref}
        onClickBack={() => setExerciseIsHidden(true)}
      ></Exercise>
    </>
  );
};

export default Interval;
