import Exercise from "../../components/Exercise";
import ExerciseSetUp from "../../components/ExerciseSetUp";
import ExerciseResult from "../../components/ExerciseResult";
import { ExerciseMaker } from "../../common/ExerciseMaker";
import { useState } from "react";
import { useStopwatch } from "react-timer-hook";
import { useReducer } from "react";
import { Option } from "../../common/types";

// run with `npm run dev`

const Interval = () => {
  const [options, dispatch] = useReducer(optionsReducer, initialOptions);
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    dispatch({
      type: UserActionType.CHECKBOX,
      id: e.target.id,
      checked: e.target.checked,
    });
  };
  const handleNumInputChange = (id: string, v: number) => {
    dispatch({
      type: UserActionType.NUMINPUT,
      id: id,
      v: v,
    });
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loadExercise();
    // dispatch({
    //   type: UserActionType.SUBMIT,
    // });
    // var m = toMaker(options);
    // console.log(m);
    // setMaker(m);
  };

  // const maker = new ExerciseMaker(
  //   "24edo",
  //   true,
  //   false,
  //   true,
  //   true,
  //   220,
  //   659.3,
  //   5,
  //   true
  // );
  const {
    totalSeconds,
    reset: stopwatchReset,
    pause: stopwatchPause,
  } = useStopwatch({
    autoStart: true,
  });

  const backToSetUp = () => {
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
  const [maker, setMaker] = useState(new ExerciseMaker());

  const [totalCorrect, setTotalCorrect] = useState(0);
  const [totalWrong, setTotalWrong] = useState(0);
  const [totalQuestionsAnswered, setTotalQuestionsAnswered] = useState(0);

  enum ExerciseState {
    setUp,
    exercise,
    result,
  }

  const [exerciseState, setExerciseState] = useState(ExerciseState.setUp);

  const loadExercise = () => {
    // TODO: data would not update until submit has been clicked twice??
    // setMakerObj(maker);
    setMaker(toMaker(options));
    console.log(options);
    console.log(maker);
    // console.log(makerObj);
    const err = maker.validate();

    setError(err);
    if (err === "") {
      maker.makeInterval();
      maker.playInterval();
      // setMakerObj(maker);
      stopwatchReset();
      setExerciseState(ExerciseState.exercise);
    }
  };

  // const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  //   // Prevent the browser from reloading the page
  //   e.preventDefault();

  //   // Read the form data
  //   const form = e.target;
  //   const formData = new FormData(form as HTMLFormElement);

  //   const formJson = Object.fromEntries(formData.entries());
  //   console.log(formJson);
  // };

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
          maker={maker}
          onClickBack={backToSetUp}
          onClickEnd={endExercise}
          onAnswer={onAnswer}
          onNext={onNext}
          totalSeconds={totalSeconds}
          pause={stopwatchPause}
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
  | { type: UserActionType.CHECKBOX; id: string; checked: boolean }
  | { type: UserActionType.NUMINPUT; id: string; v: number }
  | { type: UserActionType.SUBMIT };

const optionsReducer = (options: Option[], action: UserAction): Option[] => {
  switch (action.type) {
    case UserActionType.CHECKBOX:
      return options.map((o) => {
        if (o.id === action.id) {
          return { id: action.id, v: action.checked };
        } else {
          return o;
        }
      });
    case UserActionType.NUMINPUT:
      return options.map((o) => {
        if (o.id === action.id) {
          return { id: action.id, v: action.v };
        } else {
          return o;
        }
      });
    case UserActionType.SUBMIT:
      return options;
    default:
      throw new Error();
  }
};

const toMaker = (options: Option[]): ExerciseMaker => {
  const maker = new ExerciseMaker();
  for (var option of options) {
    switch (option.id) {
      case "scale-name":
        maker.scaleName = String(option.v);
        break;
      case "smaller-than-octave":
        maker.intervalsSmallerThanOctave = Boolean(option.v);
        break;
      case "larger-than-octave":
        maker.intervalsLargerThanOctave = Boolean(option.v);
        break;
      case "play-arp":
        maker.playArp = Boolean(option.v);
        break;
      case "play-sim":
        maker.playSim = Boolean(option.v);
        break;
      case "min-freq":
        maker.minFreq = Number(option.v);
        break;
      case "max-freq":
        maker.maxFreq = Number(option.v);
        break;
      case "num-questions":
        maker.numQuestions = Number(option.v);
        break;
      case "infinite":
        maker.infiniteMode = Boolean(option.v);
        break;
      default:
        throw new Error();
    }
  }
  return maker;
};

const initialOptions = [
  { id: "scale-name", v: "24edo" },
  { id: "smaller-than-octave", v: true },
  { id: "larger-than-octave", v: false },
  { id: "play-arp", v: true },
  { id: "play-sim", v: true },
  { id: "min-freq", v: 220 },
  { id: "max-freq", v: 659.3 },
  { id: "num-questions", v: 5 },
  { id: "infinite", v: true },
];

export default Interval;
