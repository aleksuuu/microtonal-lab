import { besselj } from "bessel";
import {
  noteDegrees,
  EDO12NOTENAMES,
  FreqMidiNoteCents,
  ScalaScale,
  ScalaNote,
  ScalaNoteTypes,
  CommonFundamental,
  CommonPartial,
  FMPredictionParams,
} from "./types";

// FM

export const predictFM = (params: FMPredictionParams): FreqMidiNoteCents[] => {
  const {
    carrierFreq,
    modulatorFreq,
    modulationIdx,
    minFreq,
    maxFreq,
    minAmp,
  } = params;
  const notes: FreqMidiNoteCents[] = [];
  if (modulationIdx < 0 || minFreq >= maxFreq || minFreq < 0 || minAmp < 0)
    return notes;
  // HELPER FUNCTIONS
  const getSideband = (n: number) => {
    const freq = carrierFreq + n * modulatorFreq;
    const amp = Math.abs(besselj(modulationIdx, n)); // The amplitude of each sideband is proportional to the Bessel function of the first kind of order n
    return { freq: freq, amp: amp };
  };
  const addSidebandToResult = (sideband: { freq: number; amp: number }) => {
    let { freq, amp } = sideband;
    if (freq < 0) freq = Math.abs(freq);
    const sameNoteIdx = notes.findIndex((n) => n.freq === freq);
    if (sameNoteIdx !== -1) {
      // if the frequency already exists, it would be 180 degrees out of phase)
      notes[sameNoteIdx].amp = Math.abs(notes[sameNoteIdx].amp ?? 0 - amp);
      if ((notes[sameNoteIdx].amp ?? 0) < minAmp) notes.splice(sameNoteIdx, 1);
      return;
    }
    if (amp < minAmp) {
      // filter out amps lower than minAmp
      return;
    }
    const note = fromFreq(freq, true);
    note.amp = amp;
    notes.push(note);
  };
  const getN = (sidebandFreq: number) => {
    return Math.floor((sidebandFreq - carrierFreq) / modulatorFreq);
  };
  // END OF HELPER FUNCTIONS

  let n = getN(maxFreq);
  let sideband = getSideband(n);
  while (sideband.freq > minFreq) {
    addSidebandToResult(sideband);
    n--;
    sideband = getSideband(n);
  }
  n = getN(-minFreq);
  sideband = getSideband(n);
  while (sideband.freq > -maxFreq) {
    addSidebandToResult(sideband);
    n--;
    sideband = getSideband(n);
  }
  notes.sort((a, b) => a.freq - b.freq);
  return notes;
};

// END OF FM

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

export const fromFreq = (
  freq: number,
  generateId: boolean = false
): FreqMidiNoteCents => {
  const midiNote = freqToMidi(freq);
  const rounded = Math.round(midiNote);
  const addCents = (midiNote - rounded) * 100;
  const noteName = noteNames[Math.abs(rounded % noteNames.length)];
  const octave = Math.floor(rounded / noteNames.length) - 1;
  if (generateId) {
    return {
      freq: freq,
      midiNote: midiNote,
      noteName: noteName as EDO12NOTENAMES,
      octave: octave,
      addCents: addCents,
      id: `n${crypto.randomUUID()}`,
    };
  }
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
  const capitalized = match[1].charAt(0).toUpperCase() + match[1].slice(1);
  const validName = capitalized
    .replace("#", "♯")
    .replace("b", "♭") as EDO12NOTENAMES;

  if (Object.values(EDO12NOTENAMES).includes(validName)) {
    const octave = parseInt(match[2], 10);
    return [validName, octave];
  }
  return null;
};

export const getCommonPartials = (
  baseFreqs: number[],
  min: number = 110,
  max: number = 880,
  tolerance: number = 10 // cents
) => {
  const results = [] as CommonPartial[];
  if (min >= max || baseFreqs.length < 1 || Math.max(...baseFreqs) > max) {
    return results;
  }
  // helper functions
  const findPartialInArr = (
    partialMidi: number,
    array: { partialNum: number; partial: number }[],
    toleranceMidi: number
  ) => {
    return array.find(
      (e) => Math.abs(freqToMidi(e.partial) - partialMidi) <= toleranceMidi
    );
  };
  // end of helper functions

  const actualMin = min < Math.min(...baseFreqs) ? Math.min(...baseFreqs) : min;
  const allPartials = [];
  for (const baseFreq of baseFreqs) {
    let partialNum = 1;
    let partial = baseFreq;
    let partials = [];
    while (partial < actualMin) {
      partialNum++;
      partial = baseFreq * partialNum;
    }
    while (partial <= max) {
      partials.push({ partialNum: partialNum, partial: partial });
      partialNum++;
      partial = baseFreq * partialNum;
    }
    allPartials.push(partials);
  }
  if (allPartials.length < 1) return results;
  const partialsForFirstFreq = allPartials[0];
  if (allPartials.length === 1) {
    return partialsForFirstFreq.map((v) => ({
      partialNums: [v.partialNum],
      partial: fromFreq(v.partial, true),
    }));
  }
  const toleranceMidi = tolerance / 100; // cents to MIDI
  for (const p of partialsForFirstFreq) {
    const partials = [p.partial];
    const partialNums = [p.partialNum];
    const partialMidi = freqToMidi(p.partial);
    for (const partial of allPartials.slice(1)) {
      const potentialPartial = findPartialInArr(
        partialMidi,
        partial,
        toleranceMidi
      );
      if (potentialPartial === undefined) break;
      partials.push(potentialPartial.partial);
      partialNums.push(potentialPartial.partialNum);
    }
    if (partials.length !== allPartials.length) continue;
    const averagePartial = partials.reduce((a, b) => a + b) / partials.length;
    const formattedPartial = fromFreq(averagePartial, true);
    results.push({ partialNums: partialNums, partial: formattedPartial });
  }
  return results;
};

export const getCommonFundamentals = (
  freqs: number[],
  min: number = 20,
  max: number = 220,
  tolerance: number = 10 // cents
): CommonFundamental[] => {
  const results = [] as CommonFundamental[];
  if (min >= max || freqs.length < 1 || Math.min(...freqs) < min) {
    return results;
  }
  // helper functions
  const findFundamentalInArr = (
    fundamentalMidi: number,
    array: { partialNum: number; fundamental: number }[],
    toleranceMidi: number
  ) => {
    return array.find(
      (e) =>
        Math.abs(freqToMidi(e.fundamental) - fundamentalMidi) <= toleranceMidi
    );
  };
  const getAllPotentialFundamentals = (
    freqs: number[],
    min: number,
    max: number
  ) => {
    const allPotentialFundamentals: {
      partialNum: number;
      fundamental: number;
    }[][] = [];
    for (const freq of freqs) {
      const resultsForFreq = [];
      let fund = freq;
      let partial = 1;
      while (fund > max) {
        partial++;
        fund = freq / partial;
      }
      while (fund >= min) {
        resultsForFreq.push({ partialNum: partial, fundamental: fund });
        partial++;
        fund = freq / partial;
      }
      allPotentialFundamentals.push(resultsForFreq);
    }
    return allPotentialFundamentals;
  };
  // end of helper functions

  const actualMax = max > Math.max(...freqs) ? Math.max(...freqs) : max;
  const allPotentialFundamentals = getAllPotentialFundamentals(
    freqs,
    min,
    actualMax
  );
  if (allPotentialFundamentals.length < 1) return results;
  const fundamentalsForFirstFreq = allPotentialFundamentals[0];
  if (allPotentialFundamentals.length === 1)
    return fundamentalsForFirstFreq.map((f) => ({
      partialNums: [f.partialNum],
      fundamental: fromFreq(f.fundamental, true),
    }));
  const toleranceMidi = tolerance / 100; // cents to MIDI
  for (const f of fundamentalsForFirstFreq) {
    const fundamentals = [f.fundamental];
    const partialNums = [f.partialNum];
    const fundamentalMidi = freqToMidi(f.fundamental);
    for (const fundamentalsForFreq of allPotentialFundamentals.slice(1)) {
      const potentialFund = findFundamentalInArr(
        fundamentalMidi,
        fundamentalsForFreq,
        toleranceMidi
      );
      if (potentialFund === undefined) break;
      fundamentals.push(potentialFund.fundamental);
      partialNums.push(potentialFund.partialNum);
    }
    if (fundamentals.length !== allPotentialFundamentals.length) continue; // allPotentialFundamentals.length should be the number of input frequencies
    const averageFundamental =
      fundamentals.reduce((a, b) => a + b) / fundamentals.length;
    const formattedFund = fromFreq(averageFundamental, true);
    results.push({ partialNums: partialNums, fundamental: formattedFund });
  }
  return results;
};

export const getNumbersFromTextInput = (text: string): number[] => {
  const nums: number[] = [];
  if (text === "") return nums;
  const arr = text.trim().split(/\s+/);
  for (const s of arr) {
    const num = Number(s);
    if (isNaN(num)) {
      return nums;
    }
    nums.push(num);
  }
  return nums;
};

export const formatFreqMidiNoteCentsIntoASingleString = (
  input: FreqMidiNoteCents
): string => {
  let addCents = "";
  if (input.addCents > 1 || input.addCents < -1) {
    addCents = Math.round(input.addCents) + "¢";
    if (input.addCents > 0) {
      addCents = "+" + addCents;
    }
  }
  return `${input.freq.toFixed(2)} Hz (${formatFreqMidiNoteCentsIntoANote(
    input
  )})`;
};

export const formatFreqMidiNoteCentsIntoANote = (
  input: FreqMidiNoteCents
): string => {
  let addCents = "";
  if (input.addCents > 1 || input.addCents < -1) {
    addCents = Math.round(input.addCents) + "¢";
    if (input.addCents > 0) {
      addCents = "+" + addCents;
    }
  }
  return `${input.noteName}${input.octave}${addCents}`;
};

export const centsToFreq = (cents: number) => {
  return midiToFreq(cents * 0.01);
};

const ratioToCents = (
  numerator: number,
  denominator: number,
  baseCents: number = 0
) => {
  return 1200 * Math.log2(numerator / denominator) + baseCents;
};

const sanitizeScalaNoteInput = (input: string): string => {
  return input.replace(/\s+/g, ""); // remove any whitespace in the string
};

export const parseScalaNoteInput = (input: string): ScalaNote | null => {
  const sanitizedInput = sanitizeScalaNoteInput(input);
  let cents = undefined;
  const inputAsNum = Number(sanitizedInput);
  let scalaNoteType = ScalaNoteTypes.EMPTY;
  if (isNaN(inputAsNum)) {
    if (/^\d+\/\d+$/.test(sanitizedInput)) {
      const [numerator, denominator] = sanitizedInput.split("/").map(Number);
      cents = ratioToCents(numerator, denominator);
      scalaNoteType = ScalaNoteTypes.RATIO;
    }
  } else if (sanitizedInput.includes(".")) {
    // A cents value must contain a period
    cents = inputAsNum;
    scalaNoteType = ScalaNoteTypes.CENTS;
  } else if (inputAsNum != 0) {
    cents = ratioToCents(inputAsNum, 1);
    scalaNoteType = ScalaNoteTypes.RATIO;
  }
  if (cents !== undefined) {
    return { text: sanitizedInput, cents: cents, scalaNoteType: scalaNoteType };
  }
  return null;
};

export const parseScalaFileContent = (
  fileName: string,
  fileContent: string
): ScalaScale => {
  const lines = fileContent.split(/\r?\n/).map((line) => line.trim());
  let name = lines.find((line) => line && line.startsWith("!"));
  if (name !== undefined) {
    name = name.slice(1).trim();
  } else {
    name = fileName.trim();
  }
  if (name.endsWith(".scl")) {
    name = name.slice(0, -4);
  }
  name = name.trim();

  const description = lines.find((line) => line && !line.startsWith("!")) || "";
  const numOfNotesIdx = lines.findIndex(
    (line) => !line.startsWith("!") && !isNaN(Number(line))
  );
  if (numOfNotesIdx === -1) {
    throw new Error("Invalid Scala file: Unable to find the number of notes.");
  }
  // const numOfNotes = parseInt(lines[numOfNotesIdx], 10); // no point in verifying this, it just has to exist
  const notes: {
    text: string;
    cents: number;
    scalaNoteType: ScalaNoteTypes;
  }[] = [];
  for (let i = numOfNotesIdx + 1; i < lines.length; i++) {
    const note = lines[i];
    const scalaNote = parseScalaNoteInput(note);
    if (scalaNote !== null) {
      notes.push(scalaNote);
    }
  }
  return { name: name, description: description, notes: notes };
};

const exportFile = (fileName: string, fileContent: string) => {
  const blob = new Blob([fileContent], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.download = fileName;
  link.href = url;
  link.click();
};

export const exportSclFile = (scale: ScalaScale) => {
  exportFile(`${scale.name}.scl`, stringifyScalaScale(scale));
};

const stringifyScalaScale = (scale: ScalaScale): string => {
  return [
    `! ${scale.name}`,
    "!",
    scale.description,
    ` ${scale.notes.length.toString()}`,
    "!",
    ...scale.notes.map((note) => note.text),
  ].join("\n");
};
