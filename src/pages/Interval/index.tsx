import Exercise from "../../components/Exercise";
import ExerciseSetUp from "../../components/ExerciseSetUp";
import ExerciseResult from "../../components/ExerciseResult";
import { ExerciseMaker } from "../../common/ExerciseMaker";
import { useState } from "react";
import { useStopwatch } from "react-timer-hook";

// run with `npm run dev`

// TODO: useState until validation

const Interval = () => {
  const maker = new ExerciseMaker(
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

  const backToSetUp = () => {
    // setExerciseIsHidden(true);
    setExerciseState(ExerciseState.setUp);
  };

  const endExercise = () => {
    setExerciseState(ExerciseState.result);
  };

  const onAnswer = (isCorrect: boolean) => {
    setTotalCorrect(totalCorrect + Number(isCorrect));
    setTotalWrong(totalWrong + Number(!isCorrect));
  };

  const onNext = () => {
    setTotalQuestionsAnswered(totalQuestionsAnswered + 1);
  };

  const [error, setError] = useState("");
  const [makerObj, setMakerObj] = useState(maker);

  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);

  enum ExerciseState {
    setUp,
    exercise,
    result,
  }

  const [exerciseState, setExerciseState] = useState(ExerciseState.setUp);
  const [numQuestionsIsDisabled, setNumQuestionsIsDisabled] = useState(true);

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.id) {
      case "smaller-than-octave":
        maker.intervalsSmallerThanOctave = e.target.checked;
        break;
      case "larger-than-octave":
        maker.intervalsLargerThanOctave = e.target.checked;
        break;
      case "play-arp":
        maker.playArp = e.target.checked;
        break;
      case "play-sim":
        maker.playSim = e.target.checked;
        break;
      case "infinite":
        maker.infiniteMode = e.target.checked;
        setNumQuestionsIsDisabled(maker.infiniteMode);
        // if (maker.infiniteMode) {
        //   setNumQuestionsInitValue(maker.numQuestions); // not sure why this is necessary but it is
        // }
        break;
    }
  };
  const handleNumInputChange = (id: string, v: number) => {
    switch (id) {
      case "min-freq":
        maker.minFreq = v;
        break;
      case "max-freq":
        maker.maxFreq = v;
        break;
      case "num-questions":
        maker.numQuestions = v;
        break;
    }
  };

  const loadExercise = () => {
    setMakerObj(maker);
    console.log(makerObj);
    const err = maker.validate();

    setError(err);
    if (err === "") {
      maker.makeInterval();
      maker.playInterval();
      setMakerObj(maker);
      // setExerciseIsHidden(false);
      reset();
      setExerciseState(ExerciseState.exercise);
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent the browser from reloading the page
    e.preventDefault();

    // Read the form data
    const form = e.target;
    const formData = new FormData(form as HTMLFormElement);

    const formJson = Object.fromEntries(formData.entries());
    console.log(formJson);
  };

  let render: JSX.Element;
  switch (exerciseState) {
    case ExerciseState.setUp:
      render = (
        <ExerciseSetUp
          error={error}
          handleSubmit={handleSubmit}
          maker={maker} // contains default values
          numQuestionsIsDisabled={numQuestionsIsDisabled}
          onClickStart={loadExercise}
          onCheckboxChange={handleCheckboxChange}
          onNumInputChange={handleNumInputChange}
        ></ExerciseSetUp>
      );
      break;
    case ExerciseState.exercise:
      render = (
        <Exercise
          maker={makerObj}
          onClickBack={backToSetUp}
          onClickEnd={endExercise}
          onAnswer={onAnswer}
          onNext={onNext}
          totalSeconds={totalSeconds}
          pause={pause}
        ></Exercise>
      );
      break;
    case ExerciseState.result:
      render = (
        <ExerciseResult
          totalCorrect={totalCorrect}
          totalWrong={totalWrong}
          totalQuestionsAnswered={totalQuestionsAnswered}
          totalSeconds={totalSeconds}
          reset={reset}
        ></ExerciseResult>
      );
      break;
  }

  return <>{render}</>;
};

export default Interval;
