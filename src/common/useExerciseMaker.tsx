import { useCallback, useState } from "react";
import { Option, ExerciseOptions } from "./types";
import scales from "./scales.json";

type Interval = { name: string; cents: number };
type Note = {
  name: string;
  cents: number;
};

const useExerciseMaker = () => {
  const [scaleName, setScaleName] = useState("24edo");
  const [smallerThanOctave, setSmallerThanOctave] = useState(true);
  const [largerThanOctave, setLargerThanOctave] = useState(false);
  const [playArp, setPlayArp] = useState(true);
  const [playSim, setPlaySim] = useState(true);
  const [minFreq, setMinFreq] = useState(220);
  const [maxFreq, setMaxFreq] = useState(659.3);
  const [numQuestions, setNumQuestions] = useState(5);
  const [infiniteMode, setInfiniteMode] = useState(true);
  const initIntervals: Interval[] = [];
  const [possibleIntervals, setPossibleIntervals] = useState(initIntervals);
  const initNotes: Note[] = [];
  const [notesInScale, setNotesInScale] = useState(initNotes);

  // const validate = useCallback(() => )
  const setUp = (exerciseOptions: ExerciseOptions): string => {
    if (
      !exerciseOptions.smallerThanOctave.v &&
      !exerciseOptions.largerThanOctave.v
    ) {
      return "You must select at least one type of intervals.";
    }
    if (!exerciseOptions.playArp.v && !exerciseOptions.playSim.v) {
      return "You must select at least one playing modes.";
    }
    if (exerciseOptions.minFreq.v < 20) {
      return "The minimum frequency is too low.";
    }
    if (exerciseOptions.maxFreq.v > 15000) {
      return "The maximum frequency is too high.";
    }
    if (exerciseOptions.numQuestions.v < 1) {
      return "The number of questions must be at least 1.";
    }
    const scale = scales.scales.find(
      (scale) => scale.name === exerciseOptions.scaleName.v
    );
    if (scale === undefined) {
      return "Can't find requested scale.";
    }
    if (
      exerciseOptions.smallerThanOctave.v &&
      exerciseOptions.largerThanOctave.v
    ) {
      const smallerThanOctave = scale.intervals;
      const largerThanOctave = scale.intervals.map((interval) => ({
        name: interval.name,
        cents: interval.cents + 1200,
      }));
      setPossibleIntervals(smallerThanOctave.concat(largerThanOctave));
    } else if (exerciseOptions.smallerThanOctave.v) {
      setPossibleIntervals(scale.intervals);
    } else {
      setPossibleIntervals(
        scale.intervals.map((interval) => ({
          name: interval.name,
          cents: interval.cents + 1200,
        }))
      );
      console.log(possibleIntervals);
    }
    setNotesInScale(scale.notes);
    return "";
  };
  //   const testOptions: ExerciseOptions = {
  //     scaleName: { id: "scale-name", v: "testtt" },
  //   };
};

export default useExerciseMaker;
