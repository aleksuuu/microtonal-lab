import { useEffect, useState, useCallback, useMemo } from "react";
import { ExerciseOptions, IntervalWithNotes, Note, Interval } from "./types";
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
    possibleIntervals: [] as Interval[],
    notesInScale: [] as Note[],
    currInterval: null as IntervalWithNotes | null,
    playArp: true,
    playSim: true,
    numAnswered: 0,
    numCorrect: 0,
    numWrong: 0,
    willMakeInterval: false,
    didSetUp: false,
    didMakeInterval: false,
    willPlayInterval: false,
    currAnswerIsCorrect: false,
    formattedCurrNotes: "",
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

    const intervals =
      exerciseOptions.smallerThanEquave.v && exerciseOptions.largerThanEquave.v
        ? scale.intervals.concat(
            scale.intervals.map((interval) => ({
              name: interval.cents % 1200 ? interval.name : "P8",
              cents: interval.cents + 1200,
            }))
          )
        : exerciseOptions.smallerThanEquave.v
        ? scale.intervals
        : scale.intervals.map((interval) => ({
            name: interval.name,
            cents: interval.cents + 1200,
          }));

    setExerciseState((prevState) => ({
      ...prevState,
      playArp: exerciseOptions.playArp.v,
      playSim: exerciseOptions.playSim.v,
      minFreq: exerciseOptions.minFreq.v,
      maxFreq: exerciseOptions.maxFreq.v,
      numQuestions: exerciseOptions.numQuestions.v,
      infiniteMode: exerciseOptions.infiniteMode.v,
      possibleIntervals: intervals,
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
    console.log(notes);
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

  const getIntervalNameAndSecondNote = useCallback(
    (firstNote: Note): { intervalName: string; secondNote: Note } | null => {
      const direction = Math.random() > 0.5 ? 1 : -1;
      const interval =
        exerciseState.possibleIntervals[
          Math.floor(Math.random() * exerciseState.possibleIntervals.length)
        ];
      const secondNoteCents = firstNote.cents + direction * interval.cents;
      const minDegreeAndCents = getMinDegreeAndCents();
      const maxDegreeAndCents = getMaxDegreeAndCents();
      if (!minDegreeAndCents || !maxDegreeAndCents) {
        console.error("Error accessing min degree and cents");
        return null;
      }
      const availableNotes = getAvailableNotes();
      const secondNote = availableNotes?.find(
        (note) => note.cents === secondNoteCents
      );

      if (
        !secondNote ||
        secondNoteCents > maxDegreeAndCents.cents ||
        secondNoteCents < minDegreeAndCents.cents
      ) {
        return getIntervalNameAndSecondNote(firstNote);
      } else {
        return { intervalName: interval.name, secondNote: secondNote };
      }
    },
    [
      exerciseState.possibleIntervals,
      getMinDegreeAndCents,
      getMaxDegreeAndCents,
      getAvailableNotes,
    ]
  );

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
      }${getEquaveFromCents(secondNote.cents)}`;
    },
    [getEquaveFromCents]
  );

  const makeInterval = useCallback(() => {
    setExerciseState((prevState) => ({ ...prevState, didMakeInterval: false }));
    const availableNotes = getAvailableNotes();
    if (!availableNotes) return;

    let firstNote =
      availableNotes[Math.floor(Math.random() * availableNotes.length)];
    const intervalAndSecondNote = getIntervalNameAndSecondNote(firstNote);
    if (!intervalAndSecondNote) return;

    let playArpForThisInterval = exerciseState.playArp;
    if (exerciseState.playArp && exerciseState.playSim) {
      playArpForThisInterval = Math.random() > 0.5;
    } else if (exerciseState.playSim) {
      playArpForThisInterval = false;
    }

    if (
      !playArpForThisInterval &&
      firstNote.cents > intervalAndSecondNote.secondNote.cents
    ) {
      const tmp = firstNote;
      firstNote = intervalAndSecondNote.secondNote;
      intervalAndSecondNote.secondNote = tmp;
    }

    setExerciseState((prevState) => ({
      ...prevState,
      currInterval: {
        name: intervalAndSecondNote.intervalName,
        firstNote: firstNote,
        secondNote: intervalAndSecondNote.secondNote,
        playArpForThisInterval: playArpForThisInterval,
      },
      numAnswered: prevState.numAnswered + 1,
      currAnswerIsCorrect: false,
      formattedCurrNotes: getFormattedCurrNotes(
        firstNote,
        intervalAndSecondNote.secondNote
      ),
      didMakeInterval: true,
    }));
  }, [
    exerciseState.playArp,
    exerciseState.playSim,
    getAvailableNotes,
    getIntervalNameAndSecondNote,
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

  const verifyAnswer = useCallback(
    (answer: string) => {
      if (!exerciseState.currInterval) {
        console.error("Error accessing current interval.");
        setExerciseState((prevState) => ({
          ...prevState,
          currAnswerIsCorrect: false,
        }));
      } else if (answer === exerciseState.currInterval.name) {
        setExerciseState((prevState) => ({
          ...prevState,
          currAnswerIsCorrect: true,
          numCorrect: prevState.numCorrect + 1,
        }));
      } else {
        setExerciseState((prevState) => ({
          ...prevState,
          currAnswerIsCorrect: false,
          numWrong: prevState.numWrong + 1,
        }));
      }
    },
    [exerciseState.currInterval]
  );

  return {
    ...exerciseState,
    setWillMakeInterval: (value: boolean) =>
      setExerciseState((prevState) => ({
        ...prevState,
        willMakeInterval: value,
      })),
    setWillPlayInterval: (value: boolean) =>
      setExerciseState((prevState) => ({
        ...prevState,
        willPlayInterval: value,
      })),
    setUp,
    verifyAnswer,
  };
};

export default useExerciseMaker;
