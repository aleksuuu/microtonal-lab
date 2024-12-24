import { useEffect, useState, useCallback, useMemo } from "react";
import {
  ExerciseOptions,
  IntervalWithNotes,
  Note,
  Interval,
  StatsPerQuestion,
} from "./types";
import { Synth, PolySynth, now } from "tone";
import scales from "./scales.json";
import { freqToMidi, centsToFreq } from "./UtilityFuncs";

type DegreeAndCents = {
  degree: number;
  cents: number;
};

const useExerciseMaker = (exerciseOptions: ExerciseOptions) => {
  const [exerciseState, setExerciseState] = useState({
    minFreq: 220,
    maxFreq: 659.3,
    numQuestions: 5,
    infiniteMode: true,
    intervalsInScale: [] as Interval[],
    notesInScale: [] as Note[],
    currInterval: null as IntervalWithNotes | null,
    playArp: true,
    playSim: true,
    willMakeInterval: false,
    didSetUp: false,
    didMakeInterval: false,
    willPlayInterval: false,
    currAnswerIsCorrect: false,
    formattedCurrNotes: "",
  });

  const [stats, setStats] = useState({
    numAnswered: 0,
    details: [] as StatsPerQuestion[],
  });

  const [currDetail, setCurrDetail] = useState<StatsPerQuestion>({
    interval: exerciseState.currInterval,
    numCorrect: 0,
    numWrong: 0,
  });

  const synth = useMemo(
    () =>
      new PolySynth(Synth, {
        volume: -15,
        oscillator: {
          type: "triangle",
        },
        envelope: {
          attackCurve: "exponential",
          attack: 0.1,
          decay: 0.4,
          sustain: 0.8,
          release: 1.5,
        },
      }).toDestination(),
    []
  );

  useEffect(() => {
    setCurrDetail({
      interval: exerciseState.currInterval,
      numCorrect: 0,
      numWrong: 0,
    });
  }, [exerciseState.currInterval]);

  useEffect(() => {
    if (exerciseState.willMakeInterval && exerciseState.didSetUp) {
      makeInterval();
      setExerciseState((prevState) => ({
        ...prevState,
        willMakeInterval: false,
      }));
    }
  }, [exerciseState.willMakeInterval, exerciseState.didSetUp]);

  useEffect(() => {
    if (exerciseState.willPlayInterval && exerciseState.didMakeInterval) {
      playInterval();
      setExerciseState((prevState) => ({
        ...prevState,
        willPlayInterval: false, // Reset flag
      }));
    }
  }, [exerciseState.willPlayInterval, exerciseState.didMakeInterval]);

  const setUp = useCallback((): string => {
    setExerciseState((prevState) => ({ ...prevState, didSetUp: false }));

    if (
      !exerciseOptions.smallerThanEquave.v &&
      !exerciseOptions.largerThanEquave.v
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
    if (!scale) {
      return "Can't find requested scale.";
    }

    setExerciseState((prevState) => ({
      ...prevState,
      playArp: exerciseOptions.playArp.v,
      playSim: exerciseOptions.playSim.v,
      minFreq: exerciseOptions.minFreq.v,
      maxFreq: exerciseOptions.maxFreq.v,
      numQuestions: exerciseOptions.numQuestions.v,
      infiniteMode: exerciseOptions.infiniteMode.v,
      intervalsInScale: scale.intervals,
      notesInScale: scale.notes,
      didSetUp: true,
    }));
    return "";
  }, [exerciseOptions]);

  const getScaleCents = useCallback(() => {
    return exerciseState.notesInScale.map((note) => note.cents);
  }, [exerciseState.notesInScale]);

  const getCentsPerEquave = useCallback(() => {
    const scaleCents = getScaleCents();
    return scaleCents[scaleCents.length - 1];
  }, [getScaleCents]);

  const quantizeToScaleDegreeAndCents = useCallback(
    (freq: number, direction: "up" | "down"): DegreeAndCents | null => {
      if (freq <= 0) return null;

      const midiNote = freqToMidi(freq);
      const midiNotesPerEquave = getCentsPerEquave() / 100;
      const equaveNum = Math.floor(midiNote / midiNotesPerEquave);
      const scaleDegreeInMidi = midiNote % midiNotesPerEquave;
      const scaleDegreeInCents = scaleDegreeInMidi * 100;
      const scaleCents = getScaleCents();

      if (scaleCents.length === 0) {
        console.error("No cents value available for scale");
        return null;
      }

      let indexOfClosest = scaleCents.reduce(
        (closestIndex, currValue, currIndex) =>
          Math.abs(currValue - scaleDegreeInCents) <
          Math.abs(scaleCents[closestIndex] - scaleDegreeInCents)
            ? currIndex
            : closestIndex,
        0
      );

      let closestCents = scaleCents[indexOfClosest];

      if (direction === "up" && closestCents < scaleDegreeInCents) {
        indexOfClosest = (indexOfClosest + 1) % scaleCents.length;
      } else if (direction === "down" && closestCents > scaleDegreeInCents) {
        indexOfClosest =
          (indexOfClosest - 1 + scaleCents.length) % scaleCents.length;
      }

      closestCents = scaleCents[indexOfClosest];
      return {
        degree: indexOfClosest,
        cents: closestCents + equaveNum * getCentsPerEquave(),
      };
    },
    [getCentsPerEquave, getScaleCents]
  );

  const getMinDegreeAndCents = useCallback(() => {
    return quantizeToScaleDegreeAndCents(exerciseState.minFreq, "up");
  }, [quantizeToScaleDegreeAndCents, exerciseState.minFreq]);

  const getMaxDegreeAndCents = useCallback(() => {
    return quantizeToScaleDegreeAndCents(exerciseState.maxFreq, "down");
  }, [quantizeToScaleDegreeAndCents, exerciseState.maxFreq]);

  const getAvailableNotes = useCallback((): Note[] | null => {
    const minDegreeAndCents = getMinDegreeAndCents();
    const maxDegreeAndCents = getMaxDegreeAndCents();
    if (!minDegreeAndCents || !maxDegreeAndCents) return null;

    const notes: Note[] = [];
    let c = minDegreeAndCents.cents,
      d = minDegreeAndCents.degree;
    while (c <= maxDegreeAndCents.cents) {
      notes.push({
        ...exerciseState.notesInScale[d % exerciseState.notesInScale.length],
        cents: c,
      });
      let centsIncrem = 0;
      while (centsIncrem % getCentsPerEquave() == 0) {
        // this is necessary because we include the first note of the next equave in the scale, and it needs to be skipped
        centsIncrem = Math.abs(
          getScaleCents()[(d + 1) % getScaleCents().length] -
            getScaleCents()[d % getScaleCents().length]
        );
        d++;
      }
      c += centsIncrem;
    }
    if (!notes) {
      console.error("getAvailableNotes could not get notes.");
      return null;
    }
    return notes;
  }, [
    getMinDegreeAndCents,
    getMaxDegreeAndCents,
    getScaleCents,
    exerciseState.notesInScale,
  ]);

  const doPlayArpOrSim = useCallback(
    (freq1: number, freq2: number, playArp: boolean) => {
      const currTime = now();
      if (playArp) {
        synth.triggerAttackRelease(freq1, 0.7, currTime);
        synth.triggerAttackRelease(freq2, 1, currTime + 0.7);
      } else {
        synth.triggerAttackRelease([freq1, freq2], 1);
      }
    },
    [synth]
  );

  const getIndexOfLargestBelowOrEqual = (
    arr: number[],
    value: number
  ): number => {
    if (arr.length === 0) return -1; // Handle empty array case

    let left = 0;
    let right = arr.length - 1;
    let result = -1;

    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      if (arr[mid] == value) {
        return mid;
      }
      if (arr[mid] < value) {
        result = mid; // Update result since arr[mid] is below the value
        left = mid + 1; // Look in the right half
      } else {
        right = mid - 1; // Look in the left half
      }
    }

    return result;
  };

  const getSecondNoteCents = (
    findValueAboveEquave: boolean,
    firstNoteFromExtreme: number,
    maxCents: number,
    minCents: number,
    direction: number,
    firstNoteCents: number,
    intervalCents: number
  ): number | null => {
    let secondNoteCents = null;
    if (findValueAboveEquave) {
      const maxEquave = Math.ceil(firstNoteFromExtreme / getCentsPerEquave()); // could still exceed max; check again below
      while (
        !secondNoteCents ||
        secondNoteCents > maxCents ||
        secondNoteCents < minCents
      ) {
        let transp = getCentsPerEquave() * Math.ceil(Math.random() * maxEquave); // 1 to maxEquave (inclusive)
        secondNoteCents = firstNoteCents + direction * (intervalCents + transp);
      }
    } else {
      secondNoteCents = firstNoteCents + direction * intervalCents;
    }
    return secondNoteCents;
  };

  const getNextInterval = useCallback((): {
    intervalName: string;
    firstNote: Note;
    secondNote: Note;
  } | null => {
    const availableNotes = getAvailableNotes();
    if (!availableNotes) return null;
    const minCents = getMinDegreeAndCents()?.cents;
    const maxCents = getMaxDegreeAndCents()?.cents;
    if (!minCents || !maxCents) {
      console.error("Error accessing min or max cents");
      return null;
    }

    const direction = Math.random() > 0.5 ? 1 : -1;
    let findValueAboveEquave = false;
    if (exerciseOptions.largerThanEquave.v) {
      if (exerciseOptions.smallerThanEquave.v) {
        findValueAboveEquave = Math.random() < 0.5;
      } else {
        findValueAboveEquave = true;
      }
    }
    const minDistanceFromExtreme = findValueAboveEquave
      ? getCentsPerEquave()
      : 0; // cents; firstNoteFromExtreme needs to be greater than this, not equal
    let firstNoteFromExtreme = 0; // cents
    let firstNote = null;
    while (!firstNote || firstNoteFromExtreme <= minDistanceFromExtreme) {
      // if only larger than equave intervals are allowed, make sure the first note is at least an equave away from the max if dir===1 or max if dir===-1
      firstNote =
        availableNotes[Math.floor(Math.random() * availableNotes.length)];
      firstNoteFromExtreme =
        direction === 1
          ? maxCents - firstNote.cents
          : firstNote.cents - minCents;
    }

    const indexOfLargestIntervalPossible = getIndexOfLargestBelowOrEqual(
      exerciseState.intervalsInScale.map((interval) => interval.cents),
      firstNoteFromExtreme - minDistanceFromExtreme
    ); // e.g, if minDistanceFromExtreme is 1200 (when if and only if greater than equave) and firstNoteFromExtreme is 1500, then the largest interval possible should be 1500-1200=300 and not 1500, that way there is enough transposition space
    let interval = null;
    while (!interval || interval.cents > firstNoteFromExtreme) {
      interval = structuredClone(
        exerciseState.intervalsInScale[
          Math.floor(Math.random() * (indexOfLargestIntervalPossible + 1))
        ]
      ); // deep clone ensures intervalsInScale isn't modified
    }
    const secondNoteCents = getSecondNoteCents(
      findValueAboveEquave,
      firstNoteFromExtreme,
      maxCents,
      minCents,
      direction,
      firstNote.cents,
      interval.cents
    );
    if (!secondNoteCents) {
      console.error("Could not find second note cents.");
      return null;
    }
    const secondNote = availableNotes.find(
      (note) => Math.round(note.cents) === Math.round(secondNoteCents)
    );

    if (!secondNote) {
      // getNextInterval();
      console.error("Could not find second note from available notes");
    }
    return {
      intervalName: interval.name,
      firstNote: firstNote,
      secondNote: secondNote ?? firstNote,
    };
  }, [
    exerciseState.intervalsInScale,
    getMinDegreeAndCents,
    getMaxDegreeAndCents,
    getAvailableNotes,
  ]);

  const getEquaveFromCents = useCallback(
    (cents: number): number => {
      return Math.floor(cents / getCentsPerEquave());
    },
    [getCentsPerEquave]
  );

  const getFormattedCurrNotes = useCallback(
    (firstNote: Note, secondNote: Note): string => {
      return `${firstNote.name}${getEquaveFromCents(firstNote.cents)}, ${
        secondNote.name
      } ${getEquaveFromCents(secondNote.cents)} (${Math.round(
        Math.abs(secondNote.cents - firstNote.cents)
      )}¢)`;
    },
    [getEquaveFromCents]
  );

  const makeInterval = useCallback(() => {
    setExerciseState((prevState) => ({ ...prevState, didMakeInterval: false }));

    const nextInterval = getNextInterval();
    if (!nextInterval) {
      console.error("Could not get next interval.");
      return;
    }

    let playArpForThisInterval = exerciseState.playArp;
    if (exerciseState.playArp && exerciseState.playSim) {
      playArpForThisInterval = Math.random() > 0.5;
    } else if (exerciseState.playSim) {
      playArpForThisInterval = false;
    }

    if (
      !playArpForThisInterval &&
      nextInterval.firstNote.cents > nextInterval.secondNote.cents
    ) {
      const tmp = nextInterval.firstNote;
      nextInterval.firstNote = nextInterval.secondNote;
      nextInterval.secondNote = tmp;
    }

    setExerciseState((prevState) => ({
      ...prevState,
      currInterval: {
        name: nextInterval.intervalName,
        firstNote: nextInterval.firstNote,
        secondNote: nextInterval.secondNote,
        playArpForThisInterval: playArpForThisInterval,
      },
      currAnswerIsCorrect: false,
      formattedCurrNotes: getFormattedCurrNotes(
        nextInterval.firstNote,
        nextInterval.secondNote
      ),
      didMakeInterval: true,
    }));
    setStats((prevStats) => ({
      ...prevStats,
      numAnswered: prevStats.numAnswered + 1,
    }));
  }, [
    exerciseState.playArp,
    exerciseState.playSim,
    getAvailableNotes,
    getNextInterval,
    getFormattedCurrNotes,
  ]);

  const playInterval = useCallback(() => {
    if (!exerciseState.currInterval) {
      console.error("Error accessing current interval.");
      return;
    }
    const freq1 = centsToFreq(exerciseState.currInterval.firstNote.cents);
    const freq2 = centsToFreq(exerciseState.currInterval.secondNote.cents);
    doPlayArpOrSim(
      freq1,
      freq2,
      exerciseState.currInterval.playArpForThisInterval
    );
    setExerciseState((prevState) => ({
      ...prevState,
      willPlayInterval: false,
    }));
  }, [exerciseState.currInterval, doPlayArpOrSim]);

  const resetStats = () => {
    setStats(() => ({
      numAnswered: 0,
      details: [],
    }));
  };

  const doneWithCurrQuestion = () => {
    setStats((prevState) => ({
      ...prevState,
      details: prevState.details.concat(currDetail),
    }));
  };

  const answerIsCorrect = () => {
    setExerciseState((prevState) => ({
      ...prevState,
      currAnswerIsCorrect: true,
    }));
    setCurrDetail((prevState) => ({
      ...prevState,
      numCorrect: 1,
    }));
  };
  const answerIsWrong = () => {
    setExerciseState((prevState) => ({
      ...prevState,
      currAnswerIsCorrect: false,
    }));
    setCurrDetail((prevState) => ({
      ...prevState,
      numWrong: prevState.numWrong + 1,
    }));
  };

  const verifyAnswer = useCallback(
    (answer: string) => {
      if (!exerciseState.currInterval) {
        console.error("Error accessing current interval.");
        setExerciseState((prevState) => ({
          ...prevState,
          currAnswerIsCorrect: false,
        }));
      } else if (answer === exerciseState.currInterval.name) {
        answerIsCorrect();
      } else if (
        (answer === "P8" || answer === "P1") &&
        (exerciseState.currInterval.name === "P8" ||
          exerciseState.currInterval.name === "P1") &&
        exerciseOptions.largerThanEquave
      ) {
        answerIsCorrect();
      } else {
        answerIsWrong();
      }
    },
    [exerciseState.currInterval]
  );

  return {
    ...exerciseState,
    ...stats,
    resetStats,
    setWillMakeInterval: (value: boolean) =>
      setExerciseState((prevState) => ({
        ...prevState,
        willMakeInterval: value,
        didMakeInterval: !value,
      })),
    setWillPlayInterval: (value: boolean) =>
      setExerciseState((prevState) => ({
        ...prevState,
        willPlayInterval: value,
      })),
    setUp,
    verifyAnswer,
    doneWithCurrQuestion,
  };
};

export default useExerciseMaker;
