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
    console.log(exerciseMaker);
    const err = exerciseMaker.validate();

    setError(err);
    if (err === "") {
      exerciseMaker.makeInterval();
      exerciseMaker.playInterval();
      setExerciseMakerObj(exerciseMaker);
      // setExerciseIsHidden(false);
      reset();
      setExerciseState(ExerciseState.exercise);
    }
  };

  const backToSetUp = () => {
    // setExerciseIsHidden(true);
    setExerciseState(ExerciseState.setUp);
  };

  const [error, setError] = useState("");
  const [exerciseMakerObj, setExerciseMakerObj] = useState(exerciseMaker);

  enum ExerciseState {
    setUp,
    exercise,
    result,
  }

  const [exerciseState, setExerciseState] = useState(ExerciseState.setUp);

  let render: JSX.Element;
  switch (exerciseState) {
    case ExerciseState.setUp:
      render = (
        <ExerciseSetUp
          error={error}
          maker={exerciseMaker}
          onClickStart={loadExercise}
        ></ExerciseSetUp>
      );
      break;
    case ExerciseState.exercise:
      render = (
        <Exercise
          maker={exerciseMakerObj}
          onClickBack={backToSetUp}
          totalSeconds={totalSeconds}
          stopwatchPause={pause}
        ></Exercise>
      );
      break;
    case ExerciseState.result:
      render = <p>test</p>;
      break;
  }

  return <>{render}</>;
};

export default Interval;
