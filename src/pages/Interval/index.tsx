import { lazy, useState, Suspense } from "react";
import { useStopwatch } from "react-timer-hook";
import {
  AllowedScales,
  ExerciseOptions,
  OptionType,
  SynthOscType,
} from "../../common/types";
import useExerciseMaker from "../../common/useExerciseMaker";

const Exercise = lazy(() => import("../../components/Exercise"));
const ExerciseSetUp = lazy(() => import("../../components/ExerciseSetUp"));
const ExerciseResult = lazy(() => import("../../components/ExerciseResult"));

const Interval = () => {
  const [options, setOptions] = useState<ExerciseOptions>(
    () => JSON.parse(JSON.stringify(initOptions)) // deep copy
  );

  const handleChange = (id: OptionType, v: number | string | boolean) => {
    const tmpOptions = { ...options };
    switch (id) {
      case OptionType.OSCTYPE:
        tmpOptions.oscType = v as SynthOscType;
        break;
      case OptionType.SCALENAME:
        tmpOptions.scaleName = v as AllowedScales;
        break;
      case OptionType.SMALLERTHANEQUAVE:
        tmpOptions.smallerThanEquave = Boolean(v);
        break;
      case OptionType.LARGERTHANEQUAVE:
        tmpOptions.largerThanEquave = Boolean(v);
        break;
      case OptionType.PLAYARP:
        tmpOptions.playArp = Boolean(v);
        break;
      case OptionType.PLAYSIM:
        tmpOptions.playSim = Boolean(v);
        break;
      case OptionType.MINFREQ:
        tmpOptions.minFreq = Number(v);
        break;
      case OptionType.MAXFREQ:
        tmpOptions.maxFreq = Number(v);
        break;
      case OptionType.NUMQUESTIONS:
        tmpOptions.numQuestions = Number(v);
        break;
      case OptionType.INFINITEMODE:
        tmpOptions.infiniteMode = Boolean(v);
        break;
      default:
        throw new Error(`Unhandled action id: ${id}`);
    }
    setOptions(tmpOptions);
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
    resetStats();
  };

  const reset = () => {
    setOptions(initOptions);
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
    setError(makerSetUp());
    if (error === "") {
      setWillMakeInterval(true);
      setWillPlayInterval(true);
      stopwatchReset();
      setExerciseState(ExerciseState.exercise);
    }
  };

  let render: React.ReactElement;
  switch (exerciseState) {
    case ExerciseState.setUp:
      render = (
        <ExerciseSetUp
          options={options}
          error={error}
          handleChange={handleChange}
          handleSubmit={handleSubmit}
          reset={reset}
        />
      );
      break;
    case ExerciseState.exercise:
      render = (
        <Exercise
          scaleName={options.scaleName}
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
        />
      );
      break;
    case ExerciseState.result:
      render = (
        <ExerciseResult
          details={details}
          totalQuestionsAnswered={numAnswered}
          totalSeconds={totalSeconds}
          reset={handleBack}
        />
      );
      break;
    default:
      render = <p>Nothing to see here!</p>;
  }

  return (
    <>
      <title>Microtonal Lab - Interval</title>
      <Suspense fallback={<p>Loading…</p>}>{render}</Suspense>
    </>
  );
};

const initOptions: Readonly<ExerciseOptions> = {
  oscType: SynthOscType.PIANO,
  scaleName: AllowedScales.EDO_24,
  smallerThanEquave: true,
  largerThanEquave: false,
  playArp: true,
  playSim: true,
  minFreq: 220,
  maxFreq: 659.3,
  numQuestions: 5,
  infiniteMode: true,
};

export default Interval;
