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
