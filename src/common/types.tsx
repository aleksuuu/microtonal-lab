export enum OptionType {
  SCALENAME = "scale-name",
  SMALLERTHANOCTAVE = "smaller-than-octave",
  LARGERTHANOCTAVE = "larger-than-octave",
  PLAYARP = "play-arp",
  PLAYSIM = "play-sim",
  MINFREQ = "min-freq",
  MAXFREQ = "max-freq",
  NUMQUESTIONS = "num-questions",
  INFINITEMODE = "infinite-mode",
}

export type ExerciseOptions = {
  scaleName: { type: OptionType.SCALENAME; v: string };
  smallerThanOctave: { type: OptionType.SMALLERTHANOCTAVE; v: boolean };
  largerThanOctave: { type: OptionType.LARGERTHANOCTAVE; v: boolean };
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
