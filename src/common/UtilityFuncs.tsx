import { useEffect, useRef } from "react";
import { noteDegrees, EDO12NOTENAMES, FreqMidiNoteCents } from "./types";

export const midiToFreq = (midiNote: number) => {
  return Math.pow(2, (midiNote - 69) / 12) * 440;
};

export const freqToMidi = (freq: number) => {
  return 12 * Math.log2(freq / 440) + 69;
};

const noteNames = [
  "C",
  "C♯",
  "D",
  "D♯",
  "E",
  "F",
  "F♯",
  "G",
  "G♯",
  "A",
  "A♯",
  "B",
];

export const freqToNoteName = (freq: number) => {
  const midiNote = freqToMidi(freq);
  const rounded = Math.round(midiNote);
  let arrow = "";
  if (midiNote - rounded > 0.05) {
    arrow = "↑";
  } else if (midiNote - rounded < -0.05) {
    arrow = "↓";
  }
  const noteName = noteNames[rounded % noteNames.length];
  const equave = Math.floor(rounded / noteNames.length) - 1;
  return noteName + equave + arrow;
};

export const fromFreq = (freq: number): FreqMidiNoteCents => {
  const midiNote = freqToMidi(freq);
  const rounded = Math.round(midiNote);
  const addCents = (midiNote - rounded) * 100;
  const noteName = noteNames[rounded % noteNames.length];
  const octave = Math.floor(rounded / noteNames.length) - 1;
  return {
    freq: freq,
    midiNote: midiNote,
    noteName: noteName as EDO12NOTENAMES,
    octave: octave,
    addCents: addCents,
  };
};

export const fromNoteNameStringAndCents = (
  noteName: string,
  addCents: number = 0
): FreqMidiNoteCents | null => {
  const validNoteNameAndOctave = getValidNoteNameAndOctave(noteName);
  if (!validNoteNameAndOctave) {
    return null;
  }
  return fromValidNoteNameAndCents(
    validNoteNameAndOctave[0],
    validNoteNameAndOctave[1],
    addCents
  );
};

export const fromValidNoteNameAndCents = (
  noteName: EDO12NOTENAMES,
  octave: number,
  addCents: number = 0
): FreqMidiNoteCents => {
  const noteDegree = noteDegrees[noteName];
  const midiNote = noteDegree + 12 * (octave + 1) + addCents * 0.01; // if C4=60
  const freq = midiToFreq(midiNote);
  return {
    freq: freq,
    midiNote: midiNote,
    noteName: noteName,
    octave: octave,
    addCents: addCents,
  };
};
export const fromMidiNote = (midiNote: number) => {
  const freq = midiToFreq(midiNote);
  return fromFreq(freq);
};

const getValidNoteNameAndOctave = (
  noteName: string
): [EDO12NOTENAMES, number] | null => {
  const match = noteName.match(/^(.*?)(\d+)$/); // Captures everything before the number and the number itself
  if (!match) {
    return null;
  }
  const validName = match[1]
    .replace("#", "♯")
    .replace("b", "♭")
    .toUpperCase() as EDO12NOTENAMES;
  const octave = parseInt(match[2], 10);

  if (Object.values(EDO12NOTENAMES).includes(validName)) {
    return [validName, octave];
  }
  return null;
};

export const getFirstXPartialsAsNotes = (
  baseFreq: number,
  numPartials: number
) => {
  const partials = [];
  for (let i = 0; i < numPartials; i++) {
    partials.push(getXPartialOf(baseFreq, i + 1));
  }
  return partials;
};

export const getXPartialOf = (baseFreq: number, partialNum: number) => {
  return fromFreq(baseFreq * partialNum);
};

export const getImaginaryFundamentals = (
  freq: number,
  min: number = 20,
  max: number = 220
): { partialNum: number; fundamental: FreqMidiNoteCents }[] => {
  const results = [] as {
    partialNum: number;
    fundamental: FreqMidiNoteCents;
  }[];
  if (freq < min) {
    return results;
  }
  freq = Math.round(freq);
  for (let i = min; i <= max; i++) {
    if (freq % i === 0) {
      const partialNum = freq / i;
      results.push({ partialNum: partialNum, fundamental: fromFreq(i) });
    }
  }
  return results;
};

export const centsToFreq = (cents: number) => {
  return midiToFreq(cents * 0.01);
};

export function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value; //assign the value of ref to the argument
  }, [value]); //this code will run when the value of 'value' changes
  return ref.current; //in the end, return the current ref value.
}
