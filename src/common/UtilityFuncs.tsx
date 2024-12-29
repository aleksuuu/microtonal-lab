import {
  noteDegrees,
  EDO12NOTENAMES,
  FreqMidiNoteCents,
  ScalaScale,
  ScalaNote,
} from "./types";

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

export const getCommonFundamentals = (
  freqs: number[],
  min: number = 20,
  max: number = 220
): { partialNums: number[]; fundamental: FreqMidiNoteCents }[] => {
  const results = [] as {
    partialNums: number[];
    fundamental: FreqMidiNoteCents;
  }[];
  if (freqs.length < 1) {
    return results;
  }
  const roundedFreqs = freqs.map((freq) => Math.round(freq));
  if (Math.min(...roundedFreqs) < min) {
    return results;
  }
  let roundedMax = Math.round(max);
  const roundedMin = Math.round(min);
  if (roundedMax > Math.max(...roundedFreqs)) {
    roundedMax = roundedFreqs[roundedFreqs.length - 1];
  }
  for (
    let potentialFund = roundedMin;
    potentialFund <= roundedMax;
    potentialFund++
  ) {
    let isCommonFactor = true;
    for (const f of roundedFreqs) {
      if (f % potentialFund !== 0) {
        isCommonFactor = false;
        break;
      }
    }
    if (isCommonFactor) {
      const partialNums = roundedFreqs.map((f) => f / potentialFund);
      results.push({
        partialNums: partialNums,
        fundamental: fromFreq(potentialFund),
      });
    }
  }
  return results;
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
  console.log(inputAsNum);
  if (isNaN(inputAsNum)) {
    if (/^\d+\/\d+$/.test(sanitizedInput)) {
      const [numerator, denominator] = sanitizedInput.split("/").map(Number);
      cents = ratioToCents(numerator, denominator);
    }
  } else if (sanitizedInput.includes(".")) {
    // A cents value must contain a period
    cents = inputAsNum;
  } else if (inputAsNum != 0) {
    cents = ratioToCents(inputAsNum, 1);
  }
  if (cents !== undefined) {
    return { text: sanitizedInput, cents: cents };
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
  const notes: { text: string; cents: number }[] = [];
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
