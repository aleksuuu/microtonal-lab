import { useEffect, useState } from "react";
import { ExerciseOptions } from "./types";
import { Synth, PolySynth, now } from "tone";
import scales from "./scales.json";
import { freqToMidi, centsToFreq } from "./UtilityFuncs";

import { IntervalWithNotes, Note, Interval } from "./types";

type DegreeAndCents = {
  degree: number;
  cents: number;
};

const useExerciseMaker = (exerciseOptions: ExerciseOptions) => {
  const [minFreq, setMinFreq] = useState(220);
  const [maxFreq, setMaxFreq] = useState(659.3);
  const [numQuestions, setNumQuestions] = useState(5);
  const [infiniteMode, setInfiniteMode] = useState(true);
  const [possibleIntervals, setPossibleIntervals] = useState<Interval[]>([]);
  const [notesInScale, setNotesInScale] = useState<Note[]>([]);
  const [currInterval, setCurrInterval] = useState<IntervalWithNotes | null>(
    null
  );
  const [playArp, setPlayArp] = useState(true);
  const [playSim, setPlaySim] = useState(true);
  const [numAnswered, setNumAnswered] = useState(0);
  const [numCorrect, setNumCorrect] = useState(0);
  const [numWrong, setNumWrong] = useState(0);

  const [willMakeInterval, setWillMakeInterval] = useState(false);
  const [didSetUp, setDidSetUp] = useState(false);
  const [didMakeInterval, setDidMakeInterval] = useState(false);
  const [willPlayInterval, setWillPlayInterval] = useState(false);
  const [currAnswerIsCorrect, setCurrAnswerIsCorrect] = useState(false);
  const [formattedCurrNotes, setFormattedCurrNotes] = useState("");

  useEffect(() => {
    if (willMakeInterval && didSetUp) {
      console.log(notesInScale);
      makeInterval();
      setWillMakeInterval(false);
    }
  }, [willMakeInterval, didSetUp]);

  useEffect(() => {
    console.log(didMakeInterval);
    if (willPlayInterval && didMakeInterval) {
      console.log(currInterval);
      playInterval();
    }
  }, [willPlayInterval, didMakeInterval]);

  const setUp = (): string => {
    setDidSetUp(false);
    console.log(exerciseOptions);
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
    setPlayArp(exerciseOptions.playArp.v);
    setPlaySim(exerciseOptions.playSim.v);
    setMinFreq(exerciseOptions.minFreq.v);
    setMaxFreq(exerciseOptions.maxFreq.v);
    setNumQuestions(exerciseOptions.numQuestions.v);
    setInfiniteMode(exerciseOptions.infiniteMode.v);

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
        name: interval.cents % 1200 ? interval.name : "P8", // if it's an octave it shouldn't be labeled as a P1
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
    }
    setNotesInScale(scale.notes);
    console.log(scale.notes);
    setDidSetUp(true);
    return "";
  };
  //   const testOptions: ExerciseOptions = {
  //     scaleName: { id: "scale-name", v: "testtt" },
  //   };

  const synth = new PolySynth(Synth, {
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
  }).toDestination();

  //   const getCentsPerEquave = useCallback((): number => {
  //     return getScaleCents()[getScaleCents.length - 1];
  //   }, [notesInScale]);
  const getCentsPerEquave = (): number => {
    return getScaleCents()[getScaleCents().length - 1];
  };

  //   const getScaleCents = useCallback((): number[] => {
  //     return notesInScale.map((note) => note.cents);
  //   }, [notesInScale]);
  const getScaleCents = (): number[] => {
    return notesInScale.map((note) => note.cents);
  };

  const quantizeToScaleDegreeAndCents = (
    freq: number,
    direction: "up" | "down"
  ): DegreeAndCents | null => {
    if (freq <= 0) {
      return null; // Invalid frequency
    }

    // Calculate the MIDI note corresponding to the input frequency
    const midiNote = freqToMidi(freq);

    // The cents per octave of the microtonal scale
    // const centsPerEquave = scale[scale.length - 1];

    // The number of midi notes per octave of the microtonal scale
    const midiNotesPerEquave = getCentsPerEquave() / 100;

    const octaveNum = Math.floor(midiNote / midiNotesPerEquave);

    const scaleDegreeInMidi = midiNote % midiNotesPerEquave;

    const scaleDegreeInCents = scaleDegreeInMidi * 100;
    const scaleCents = getScaleCents();

    if (scaleCents.length === 0) {
      console.error("No cents value available for scale");
      return null;
    }
    let indexOfClosest = getScaleCents().reduce(function (prev, curr, index) {
      return Math.abs(curr - scaleDegreeInCents) <
        Math.abs(prev - scaleDegreeInCents)
        ? index
        : index - 1;
    });

    let closestCents = getScaleCents()[indexOfClosest];

    if (direction === "up" && closestCents < scaleDegreeInCents) {
      if (indexOfClosest < getScaleCents().length - 1) {
        indexOfClosest++;
      } else {
        indexOfClosest = 0;
      }
    } else if (direction === "down" && closestCents > scaleDegreeInCents) {
      if (indexOfClosest > 0) {
        indexOfClosest--;
      } else {
        indexOfClosest = getScaleCents().length - 1;
      }
    }

    closestCents = getScaleCents()[indexOfClosest];

    return { degree: indexOfClosest, cents: closestCents * octaveNum };
  };
  const getMinDegreeAndCents = (): DegreeAndCents | null => {
    return quantizeToScaleDegreeAndCents(minFreq, "up");
  };
  const getMaxDegreeAndCents = (): DegreeAndCents | null => {
    return quantizeToScaleDegreeAndCents(maxFreq, "down");
  };

  const getAvailableNotes = (): Note[] | null => {
    var minDegreeAndCents = getMinDegreeAndCents();
    var maxDegreeAndCents = getMaxDegreeAndCents();
    if (!minDegreeAndCents || !maxDegreeAndCents) {
      return null;
    }
    const getCentsDiffBtwTwoDegrees = (currDegree: number) => {
      const degree = currDegree % (getScaleCents().length - 1);
      return getScaleCents()[degree + 1] - getScaleCents()[degree];
    };

    var notes: Note[] = new Array();
    for (
      var d = minDegreeAndCents.degree, c = minDegreeAndCents.cents;
      c < maxDegreeAndCents.cents;
      d++, c += getCentsDiffBtwTwoDegrees(d)
    ) {
      const currNote = notesInScale[d % (notesInScale.length - 1)];
      notes.push({ name: currNote.name, cents: c });
    }
    return notes;
  };

  const doPlayArpOrSim = (freq1: number, freq2: number, playArp: boolean) => {
    if (playArp) {
      const currTime = now(); // Tone.now() gets the current time of the AudioContext
      synth.triggerAttackRelease(freq1, 0.7, currTime); // freq, dur, start
      synth.triggerAttackRelease(freq2, 1, currTime + 0.7);
    } else {
      synth.triggerAttackRelease([freq1, freq2], 1);
    }
  };

  const getIntervalNameAndSecondNote = (
    firstNote: Note
  ): { intervalName: string; secondNote: Note } | null => {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const interval =
      possibleIntervals[Math.floor(Math.random() * possibleIntervals.length)];
    const secondNoteCents = firstNote.cents + direction * interval.cents;
    const minDegreeAndCents = getMinDegreeAndCents();
    const maxDegreeAndCents = getMaxDegreeAndCents();
    if (!minDegreeAndCents || !maxDegreeAndCents) {
      console.error("Error accessing min degree and cents");
      return null;
    }
    const availableNotes = getAvailableNotes();
    const secondNote = availableNotes?.filter(
      (note) => note.cents == secondNoteCents
    )[0];

    if (
      !secondNote ||
      secondNoteCents > maxDegreeAndCents.cents ||
      secondNoteCents < minDegreeAndCents.cents
    ) {
      return getIntervalNameAndSecondNote(firstNote);
    } else {
      return { intervalName: interval.name, secondNote: secondNote };
    }
  };

  const makeInterval = () => {
    setDidMakeInterval(false);
    const availableNotes = getAvailableNotes();
    if (!availableNotes) {
      return;
    }
    const firstNoteIndex = Math.floor(Math.random() * availableNotes.length);
    let firstNote = availableNotes[firstNoteIndex];
    const intervalAndSecondNote = getIntervalNameAndSecondNote(firstNote);
    if (!intervalAndSecondNote) {
      return;
    }
    var playArpForThisInterval = true;
    if (playArp && playSim) {
      playArpForThisInterval = Math.random() > 0.5;
    } else if (playSim) {
      playArpForThisInterval = false;
    }
    // if playing simultaneously, sort the notes from low to high so that note1.cents < note2.cents
    if (!playArp) {
      if (firstNote.cents > intervalAndSecondNote.secondNote.cents) {
        const tmp = firstNote;
        firstNote = intervalAndSecondNote.secondNote;
        intervalAndSecondNote.secondNote = tmp;
      }
    }

    setCurrInterval({
      name: intervalAndSecondNote.intervalName,
      firstNote: firstNote,
      secondNote: intervalAndSecondNote.secondNote,
      playArpForThisInterval: playArpForThisInterval,
    });
    setNumAnswered(numAnswered + 1);
    setCurrAnswerIsCorrect(false);
    setFormattedCurrNotes(getFormattedCurrNotes());
    setDidMakeInterval(true);
  };

  const playInterval = () => {
    // makeInterval();
    if (!currInterval) {
      console.error("Error accessing current interval.");
      return;
    }
    const freq1 = centsToFreq(currInterval.firstNote.cents);
    const freq2 = centsToFreq(currInterval.secondNote.cents);
    if (currInterval.playArpForThisInterval) {
      doPlayArpOrSim(freq1, freq2, true);
    } else {
      doPlayArpOrSim(freq1, freq2, false);
    }
    setWillPlayInterval(false);
  };

  const getEquaveFromCents = (cents: number): number => {
    return Math.floor(cents / getCentsPerEquave());
  };

  const verifyAnswer = (answer: string) => {
    if (!currInterval) {
      console.error("Error accessing current interval.");
      setCurrAnswerIsCorrect(false);
    } else if (answer == currInterval.name) {
      setCurrAnswerIsCorrect(true);
      setNumCorrect(numCorrect + 1);
    } else {
      setCurrAnswerIsCorrect(false);
      setNumWrong(numWrong + 1);
    }
  };

  const getFormattedCurrNotes = (): string => {
    if (!currInterval) {
      console.error("Error accessing current notes.");
      return "";
    }
    const firstNote = currInterval.firstNote;
    const secondNote = currInterval.secondNote;

    return (
      firstNote.name +
      getEquaveFromCents(firstNote.cents) +
      ", " +
      secondNote.name +
      getEquaveFromCents(secondNote.cents)
    );
  };

  return {
    currInterval,
    possibleIntervals,
    setWillMakeInterval,
    setWillPlayInterval,
    setUp,
    verifyAnswer,
    formattedCurrNotes,
    currAnswerIsCorrect,
    numAnswered,
    numCorrect,
    numWrong,
    numQuestions,
    infiniteMode,
  };
};

export default useExerciseMaker;
