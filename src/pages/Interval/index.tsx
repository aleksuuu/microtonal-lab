import Exercise from "../../components/Exercise";
import ExerciseSetUp from "../../components/ExerciseSetUp";
import ExerciseResult from "../../components/ExerciseResult";
import { useState } from "react";
import { useStopwatch } from "react-timer-hook";
import { ExerciseOptions, OptionType } from "../../common/types";
import useExerciseMaker from "../../common/useExerciseMaker";

// run with `npm run dev`

const Interval = () => {
  const [options, setOptions] = useState(
    () => JSON.parse(JSON.stringify(initOptions)) // deep copy
  );
  const setNewOptions = (action: UserAction) => {
    const tmpOptions = { ...options };
    switch (action.id) {
      case OptionType.SCALENAME:
        tmpOptions.scaleName.v = String(action.v);
        break;
      case OptionType.SMALLERTHANEQUAVE:
        tmpOptions.smallerThanEquave.v = Boolean(action.v);
        break;
      case OptionType.LARGERTHANEQUAVE:
        tmpOptions.largerThanEquave.v = Boolean(action.v);
        break;
      case OptionType.PLAYARP:
        tmpOptions.playArp.v = Boolean(action.v);
        break;
      case OptionType.PLAYSIM:
        tmpOptions.playSim.v = Boolean(action.v);
        break;
      case OptionType.MINFREQ:
        tmpOptions.minFreq.v = Number(action.v);
        break;
      case OptionType.MAXFREQ:
        tmpOptions.maxFreq.v = Number(action.v);
        break;
      case OptionType.NUMQUESTIONS:
        tmpOptions.numQuestions.v = Number(action.v);
        break;
      case OptionType.INFINITEMODE:
        tmpOptions.infiniteMode.v = Boolean(action.v);
        break;
      default:
        throw new Error(`Unhandled action id: ${action.id}`);
    }
    setOptions(tmpOptions);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewOptions({
      type: UserActionType.CHECKBOX,
      id: e.target.id,
      v: e.target.checked,
    });
  };
  const handleNumInputChange = (id: string, v: number) => {
    setNewOptions({
      type: UserActionType.NUMINPUT,
      id: id,
      v: v,
    });
  };
  const handleMenuSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setNewOptions({
      type: UserActionType.MENUSELECT,
      id: e.target.id,
      v: e.target.value,
    });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadExercise();
  };

  const {
    totalSeconds,
    reset: stopwatchReset,
    pause: stopwatchPause,
    start: stopwatchUnpause,
  } = useStopwatch({
    autoStart: true,
  });

  const {
    currInterval,
    intervalsInScale,
    setUp: makerSetUp,
    setWillMakeInterval,
    setWillPlayInterval,
    verifyAnswer,
    currAnswerIsCorrect,
    formattedCurrNotes,
    numAnswered,
    details,
    resetStats,
    numQuestions,
    infiniteMode,
    doneWithCurrQuestion,
  } = useExerciseMaker(options);

  const handleBack = () => {
    setExerciseState(ExerciseState.setUp);
    setOptions(initOptions);
    resetStats();
  };

  const reset = () => {
    window.location.reload(); // TODO: not great! but setOptions(initOptions) does not reset the checkboxes for some reason...
  };

  const handleEnd = () => {
    doneWithCurrQuestion();
    setExerciseState(ExerciseState.result);
  };

  const handleNext = () => {
    doneWithCurrQuestion();
    setWillMakeInterval(true);
    setWillPlayInterval(true);
  };

  const handleReplay = () => {
    setWillPlayInterval(true);
  };

  const [error, setError] = useState("");

  enum ExerciseState {
    setUp,
    exercise,
    result,
  }

  const [exerciseState, setExerciseState] = useState(ExerciseState.setUp);

  const loadExercise = () => {
    // console.log("options");
    // console.log(options);
    setError(makerSetUp());

    if (error === "") {
      setWillMakeInterval(true);
      setWillPlayInterval(true);
      stopwatchReset();
      setExerciseState(ExerciseState.exercise);
    }
  };

  let render: JSX.Element;
  switch (exerciseState) {
    case ExerciseState.setUp:
      render = (
        <ExerciseSetUp
          error={error}
          handleSubmit={handleSubmit}
          handleMenuSelectChange={handleMenuSelectChange}
          handleCheckboxChange={handleCheckboxChange}
          handleNumInputChange={handleNumInputChange}
          reset={reset}
        ></ExerciseSetUp>
      );
      break;
    case ExerciseState.exercise:
      render = (
        <Exercise
          scaleName={options.scaleName.v}
          answerIsCorrect={currAnswerIsCorrect}
          currInterval={currInterval}
          handleBack={handleBack}
          handleEnd={handleEnd}
          handleAnswer={verifyAnswer}
          handleReplay={handleReplay}
          handleNext={handleNext}
          totalSeconds={totalSeconds}
          stopwatchPause={stopwatchPause}
          stopwatchUnpause={stopwatchUnpause}
          formattedCurrNotes={formattedCurrNotes}
          numQuestions={numQuestions}
          numAnswered={numAnswered}
          infiniteMode={infiniteMode}
          intervalsInScale={intervalsInScale}
        ></Exercise>
      );
      break;
    case ExerciseState.result:
      render = (
        <ExerciseResult
          details={details}
          totalQuestionsAnswered={numAnswered}
          totalSeconds={totalSeconds}
          reset={handleBack}
        ></ExerciseResult>
      );
      break;
    default:
      render = <p>Nothing to see here!</p>;
  }

  return (
    <>
      <title>Microtonal Lab - Interval</title>
      {render}
    </>
  );
};

enum UserActionType {
  CHECKBOX,
  NUMINPUT,
  MENUSELECT,
  SUBMIT,
}

type UserAction =
  | { type: UserActionType.CHECKBOX; id: string; v: boolean }
  | { type: UserActionType.NUMINPUT; id: string; v: number }
  | { type: UserActionType.MENUSELECT; id: string; v: string };

const initOptions: Readonly<ExerciseOptions> = {
  scaleName: { type: OptionType.SCALENAME, v: "24edo" },
  smallerThanEquave: { type: OptionType.SMALLERTHANEQUAVE, v: true },
  largerThanEquave: { type: OptionType.LARGERTHANEQUAVE, v: false },
  playArp: { type: OptionType.PLAYARP, v: true },
  playSim: { type: OptionType.PLAYSIM, v: true },
  minFreq: { type: OptionType.MINFREQ, v: 220 },
  maxFreq: { type: OptionType.MAXFREQ, v: 659.3 },
  numQuestions: { type: OptionType.NUMQUESTIONS, v: 5 },
  infiniteMode: { type: OptionType.INFINITEMODE, v: true },
};

export default Interval;
