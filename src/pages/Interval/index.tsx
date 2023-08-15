import Exercise from "../../components/Exercise";
import ExerciseSetUp from "../../components/ExerciseSetUp";
import { ExerciseMaker } from "../../common/ExerciseMaker";
import { useState } from "react";

const Interval = () => {
  let exerciseMaker = new ExerciseMaker(
    "24edo",
    true,
    false,
    true,
    true,
    130.8,
    523.3,
    5,
    true
  );

  const loadExercise = () => {
    const err = exerciseMaker.validate();
    setError(err);
    if (err === "") {
      // exerciseMaker.makeInterval();
      setExerciseMakerObj(exerciseMaker);
      setExerciseIsHidden(false);
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
      ></Exercise>
    </>
  );
};

export default Interval;
