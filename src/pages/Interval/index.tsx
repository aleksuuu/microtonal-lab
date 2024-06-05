import Exercise from "../../components/Exercise";
import ExerciseSetUp from "../../components/ExerciseSetUp";
import ExerciseResult from "../../components/ExerciseResult";
import { useState } from "react";
import { useStopwatch } from "react-timer-hook";
import { ExerciseOptions, OptionType } from "../../common/types";
import useExerciseMaker from "../../common/useExerciseMaker";

// run with `npm run dev`

const Interval = () => {
  // const [options, dispatch] = useReducer(optionsReducer, initOptions);
  const [options, setOptions] = useState(initOptions);
  // const [isSubmitting, setIsSubmitting] = useState(false);
  // useEffect(() => {
  //   if (isSubmitting) {
  //     playInterval();
  //     setIsSubmitting(false);
  //   }
  // }, [isSubmitting]);
  const setNewOptions = (action: UserAction) => {
    var tmpOptions = options;
    switch (action.id) {
      case OptionType.SCALENAME:
        tmpOptions.scaleName.v = String(action.v);
        break;
      case OptionType.SMALLERTHANOCTAVE:
        tmpOptions.smallerThanOctave.v = Boolean(action.v);
        break;
      case OptionType.LARGERTHANOCTAVE:
        tmpOptions.largerThanOctave.v = Boolean(action.v);
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
        throw new Error();
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
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadExercise();
  };

  const {
    totalSeconds,
    reset: stopwatchReset,
    pause: stopwatchPause,
  } = useStopwatch({
    autoStart: true,
  });

  const {
    currInterval,
    possibleIntervals,
    setUp: makerSetUp,
    setWillMakeInterval,
    setWillPlayInterval,
    verifyAnswer,
    currAnswerIsCorrect,
    formattedCurrNotes,
    numAnswered,
    numCorrect,
    numWrong,
    numQuestions,
    infiniteMode,
  } = useExerciseMaker(options);

  const handleBack = () => {
    setExerciseState(ExerciseState.setUp);
  };

  const handleEnd = () => {
    setExerciseState(ExerciseState.result);
  };

  const handleNext = () => {
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
    // TODO: data would not update until submit has been clicked twice??
    // setMakerObj(maker);
    // setMaker(toMaker(options));
    console.log(options);

    // console.log(maker);
    // console.log(makerObj);
    // const err = maker.validate();

    setError(makerSetUp());

    if (error === "") {
      setWillMakeInterval(true);
      setWillPlayInterval(true);
      stopwatchReset();
      setExerciseState(ExerciseState.exercise);
      // setDoPlayInterval(true);
      // playInterval();
      // maker.makeInterval();
      // maker.playInterval();
      // // setMakerObj(maker);
      // stopwatchReset();
      // setExerciseState(ExerciseState.exercise);
    }
  };

  let render: JSX.Element;
  switch (exerciseState) {
    case ExerciseState.setUp:
      render = (
        <ExerciseSetUp
          error={error}
          handleSubmit={handleSubmit}
          handleCheckboxChange={handleCheckboxChange}
          handleNumInputChange={handleNumInputChange}
        ></ExerciseSetUp>
      );
      break;
    case ExerciseState.exercise:
      render = (
        <Exercise
          answerIsCorrect={currAnswerIsCorrect}
          currInterval={currInterval}
          handleBack={handleBack}
          handleEnd={handleEnd}
          handleAnswer={verifyAnswer}
          handleReplay={handleReplay}
          handleNext={handleNext}
          totalSeconds={totalSeconds}
          pause={stopwatchPause}
          formattedCurrNotes={formattedCurrNotes}
          numQuestions={numQuestions}
          numAnswered={numAnswered}
          infiniteMode={infiniteMode}
          possibleIntervals={possibleIntervals}
        ></Exercise>
      );
      break;
    case ExerciseState.result:
      render = (
        <ExerciseResult
          totalCorrect={numCorrect}
          totalWrong={numWrong}
          totalQuestionsAnswered={numAnswered}
          totalSeconds={totalSeconds}
          reset={stopwatchReset}
        ></ExerciseResult>
      );
      break;
  }

  return <>{render}</>;
};

enum UserActionType {
  CHECKBOX,
  NUMINPUT,
  SUBMIT,
}

type UserAction =
  | { type: UserActionType.CHECKBOX; id: string; v: boolean }
  | { type: UserActionType.NUMINPUT; id: string; v: number };

const initOptions: ExerciseOptions = {
  scaleName: { type: OptionType.SCALENAME, v: "24edo" },
  smallerThanOctave: { type: OptionType.SMALLERTHANOCTAVE, v: true },
  largerThanOctave: { type: OptionType.LARGERTHANOCTAVE, v: false },
  playArp: { type: OptionType.PLAYARP, v: true },
  playSim: { type: OptionType.PLAYSIM, v: true },
  minFreq: { type: OptionType.MINFREQ, v: 220 },
  maxFreq: { type: OptionType.MAXFREQ, v: 659.3 },
  numQuestions: { type: OptionType.NUMQUESTIONS, v: 5 },
  infiniteMode: { type: OptionType.INFINITEMODE, v: true },
};

export default Interval;
