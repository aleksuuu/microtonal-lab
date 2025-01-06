export enum BorderType {
  HIDDEN = "border-hidden",
  NORMAL = "border-normal",
  SUCCESS = "border-success",
  FAILURE = "border-failure",
}

export enum OptionType {
  OSCTYPE = "osc-type",
  SCALENAME = "scale-name",
  SMALLERTHANEQUAVE = "smaller-than-equave",
  LARGERTHANEQUAVE = "larger-than-equave",
  PLAYARP = "play-arp",
  PLAYSIM = "play-sim",
  MINFREQ = "min-freq",
  MAXFREQ = "max-freq",
  NUMQUESTIONS = "num-questions",
  INFINITEMODE = "infinite-mode",
}

export enum AllowedScales {
  EDO_12 = "12edo",
  EDO_19 = "19edo",
  EDO_24 = "24edo",
  EDO_31 = "31edo",
}

export enum SynthOscType {
  SINE = "sine",
  TRIANGLE = "triangle",
  SQUARE = "square",
  SAWTOOTH = "sawtooth",
}

export enum EDO12NOTENAMES {
  C = "C",
  C_SHARP = "C♯",
  D_FLAT = "D♭",
  D = "D",
  D_SHARP = "D♯",
  E_FLAT = "E♭",
  E = "E",
  F_FLAT = "F♭",
  E_SHARP = "E♯",
  F = "F",
  F_SHARP = "F♯",
  G_FLAT = "G♭",
  G = "G",
  G_SHARP = "G♯",
  A_FLAT = "A♭",
  A = "A",
  A_SHARP = "A♯",
  B_FLAT = "B♭",
  B = "B",
  C_FLAT = "C♭",
  B_SHARP = "B♯",
}

export const noteDegrees: Record<EDO12NOTENAMES, number> = {
  [EDO12NOTENAMES.C]: 0,
  [EDO12NOTENAMES.C_SHARP]: 1,
  [EDO12NOTENAMES.D_FLAT]: 1,
  [EDO12NOTENAMES.D]: 2,
  [EDO12NOTENAMES.D_SHARP]: 3,
  [EDO12NOTENAMES.E_FLAT]: 3,
  [EDO12NOTENAMES.E]: 4,
  [EDO12NOTENAMES.F_FLAT]: 4,
  [EDO12NOTENAMES.E_SHARP]: 5,
  [EDO12NOTENAMES.F]: 5,
  [EDO12NOTENAMES.F_SHARP]: 6,
  [EDO12NOTENAMES.G_FLAT]: 6,
  [EDO12NOTENAMES.G]: 7,
  [EDO12NOTENAMES.G_SHARP]: 8,
  [EDO12NOTENAMES.A_FLAT]: 8,
  [EDO12NOTENAMES.A]: 9,
  [EDO12NOTENAMES.A_SHARP]: 10,
  [EDO12NOTENAMES.B_FLAT]: 10,
  [EDO12NOTENAMES.B]: 11,
  [EDO12NOTENAMES.C_FLAT]: 11,
  [EDO12NOTENAMES.B_SHARP]: 0,
};

export enum ScalaNoteTypes {
  EMPTY = "",
  INVALID = "(invalid input)",
  RATIO = "(ratio)",
  CENTS = "(cents)",
}

export type ExerciseOptions = {
  oscType: { type: OptionType.OSCTYPE; v: SynthOscType };
  scaleName: { type: OptionType.SCALENAME; v: AllowedScales };
  smallerThanEquave: { type: OptionType.SMALLERTHANEQUAVE; v: boolean };
  largerThanEquave: { type: OptionType.LARGERTHANEQUAVE; v: boolean };
  playArp: { type: OptionType.PLAYARP; v: boolean };
  playSim: { type: OptionType.PLAYSIM; v: boolean };
  minFreq: { type: OptionType.MINFREQ; v: number };
  maxFreq: { type: OptionType.MAXFREQ; v: number };
  numQuestions: { type: OptionType.NUMQUESTIONS; v: number };
  infiniteMode: { type: OptionType.INFINITEMODE; v: boolean };
};

export type IntervalWithNotes = {
  name: string;
  firstNote: Note;
  secondNote: Note;
  playArpForThisInterval: boolean;
};

export type Note = {
  name: string;
  cents: number;
};

export type Interval = { name: string; cents: number };

export type StatsPerQuestion = {
  interval: IntervalWithNotes | null;
  numCorrect: number;
  numWrong: number;
};

export type FreqMidiNoteCents = {
  freq: number;
  midiNote: number;
  noteName: EDO12NOTENAMES;
  octave: number;
  addCents: number;
};

export type ScalaNote = {
  text: string;
  cents: number;
  scalaNoteType: ScalaNoteTypes;
};

export type ScalaScale = {
  name: string;
  description: string;
  notes: ScalaNote[];
};

export type CommonFundamental = {
  partialNums: number[];
  fundamental: FreqMidiNoteCents;
};

export type CommonPartial = {
  partialNums: number[];
  partial: FreqMidiNoteCents;
};
