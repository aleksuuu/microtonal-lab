import { Synth, PolySynth, now } from "tone";
import scales from "./scales.json";
import { freqToMidi, centsToFreq } from "./UtilityFuncs";

export class ExerciseMaker {
  scaleName: string;
  intervalsSmallerThanOctave: boolean;
  intervalsLargerThanOctave: boolean;
  playArp: boolean;
  playSim: boolean;
  minFreq: number;
  maxFreq: number;
  numQuestions: number;
  infiniteMode: boolean;

  scale = scales.scales[0].name;

  constructor(
    scaleName: string,
    intervalsSmallerThanOctave: boolean,
    intervalsLargerThanOctave: boolean,
    playArp: boolean,
    playSim: boolean,
    minFreq: number,
    maxFreq: number,
    numQuestions: number,
    infiniteMode: boolean
  ) {
    this.scaleName = scaleName;
    this.intervalsSmallerThanOctave = intervalsSmallerThanOctave;
    this.intervalsLargerThanOctave = intervalsLargerThanOctave;
    this.playArp = playArp;
    this.playSim = playSim;
    this.minFreq = minFreq;
    this.maxFreq = maxFreq;
    this.numQuestions = numQuestions;
    this.infiniteMode = infiniteMode;
  }

  possibleIntervals: { name: string; cents: number }[] = new Array();

  currInterval?: { name: string; freq1: number; freq2: number };

  // if valid, return an empty string
  validate(): string {
    if (!this.intervalsSmallerThanOctave && !this.intervalsLargerThanOctave) {
      return "You must select at least one type of intervals.";
    }
    if (!this.playArp && !this.playSim) {
      return "You must select at least one playing modes.";
    }
    if (this.minFreq < 20) {
      return "The minimum frequency is too low.";
    }
    if (this.maxFreq > 15000) {
      return "The maximum frequency is too high.";
    }
    if (this.numQuestions < 1) {
      return "The number of questions must be at least 1.";
    }

    const scale = scales.scales.find((scale) => scale.name === this.scaleName);
    if (scale === undefined) {
      return "Can't find requested scale.";
    }
    this.possibleIntervals = scale.intervals;
    console.log(this.possibleIntervals);
    return "";
  }

  synth = new PolySynth(Synth, {
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

  quantizeToScaleDegreeAndCents(
    freq: number,
    scale: number[], // cents values
    direction: "up" | "down"
  ): { degree: number; cents: number } | null {
    if (freq <= 0) {
      return null; // Invalid frequency
    }

    // Calculate the MIDI note corresponding to the input frequency
    const midiNote = freqToMidi(freq);

    // The cents per octave of the microtonal scale
    const centsPerOctave = scale[scale.length - 1];

    // The number of midi notes per octave of the microtonal scale
    const midiNotesPerOctave = centsPerOctave / 100;

    const octaveNum = Math.floor(midiNote / midiNotesPerOctave);

    const scaleDegreeInMidi = midiNote % midiNotesPerOctave;

    const scaleDegreeInCents = scaleDegreeInMidi * 100;

    let indexOfClosest = scale.reduce(function (prev, curr, index) {
      return Math.abs(curr - scaleDegreeInCents) <
        Math.abs(prev - scaleDegreeInCents)
        ? index
        : index - 1;
    });

    let closestCents = scale[indexOfClosest];

    if (direction === "up" && closestCents < scaleDegreeInCents) {
      if (indexOfClosest < scale.length - 1) {
        indexOfClosest++;
      } else {
        indexOfClosest = 0;
      }
    } else if (direction === "down" && closestCents > scaleDegreeInCents) {
      if (indexOfClosest > 0) {
        indexOfClosest--;
      } else {
        indexOfClosest = scale.length - 1;
      }
    }

    closestCents = scale[indexOfClosest];

    return { degree: indexOfClosest, cents: closestCents * octaveNum };
  }

  get scaleCents() {
    return this.possibleIntervals.map((interval) => interval.cents);
  }
  get minDegreeAndCents() {
    return this.quantizeToScaleDegreeAndCents(
      this.minFreq,
      this.scaleCents,
      "up"
    );
  }

  get maxDegreeAndCents() {
    return this.quantizeToScaleDegreeAndCents(
      this.maxFreq,
      this.scaleCents,
      "down"
    );
  }

  get availableCents() {
    if (!this.minDegreeAndCents || !this.maxDegreeAndCents) {
      return null;
    }
    const getCentsDiffBtwTwoDegrees = (currDegree: number) => {
      const degree = currDegree % (this.scaleCents.length - 1);
      return this.scaleCents[degree + 1] - this.scaleCents[degree];
    };

    var cents: number[] = new Array();

    for (
      var d = this.minDegreeAndCents.degree, c = this.minDegreeAndCents.cents;
      c < this.maxDegreeAndCents.cents;
      d++, c += getCentsDiffBtwTwoDegrees(d)
    ) {
      cents.push(c);
    }
    return cents;
  }

  doPlayArp = (freq1: number, freq2: number) => {
    const currTime = now(); // Tone.now() gets the current time of the AudioContext
    this.synth.triggerAttackRelease(freq1, 0.7, currTime); // freq, dur, start
    this.synth.triggerAttackRelease(freq2, 1, currTime + 0.7);
  };
  doPlaySim = (freq1: number, freq2: number) => {
    this.synth.triggerAttackRelease([freq1, freq2], 1);
  };

  doPlay = (freq1: number, freq2: number) => {
    if (this.playArp && this.playSim) {
      if (Math.random() < 0.5) {
        this.doPlaySim(freq1, freq2);
      } else {
        this.doPlayArp(freq1, freq2);
      }
    } else if (this.playArp) {
      this.doPlayArp(freq1, freq2);
    } else {
      this.doPlaySim(freq1, freq2);
    }
  };

  makeInterval(
    firstNoteCents: number
  ): { intervalName: string; secondNoteCents: number } | null {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const interval =
      this.possibleIntervals[
        Math.floor(Math.random() * this.possibleIntervals.length)
      ];
    const secondNoteCents = firstNoteCents + direction * interval.cents;
    if (!this.minDegreeAndCents || !this.maxDegreeAndCents) {
      console.error("Error accessing min degree and cents");
      return null;
    }
    if (
      secondNoteCents > this.maxDegreeAndCents.cents ||
      secondNoteCents < this.minDegreeAndCents.cents
    ) {
      return this.makeInterval(firstNoteCents);
    } else {
      return { intervalName: interval.name, secondNoteCents: secondNoteCents };
    }
  }

  playInterval() {
    if (!this.availableCents) {
      return;
    }
    const firstNoteCents =
      this.availableCents[
        Math.floor(Math.random() * this.availableCents.length)
      ];
    const intervalAndSecondNoteCents = this.makeInterval(firstNoteCents);

    if (!intervalAndSecondNoteCents) {
      console.error("Error making the second note in the interval.");
      return;
    }
    this.doPlay(
      centsToFreq(firstNoteCents),
      centsToFreq(intervalAndSecondNoteCents.secondNoteCents)
    );
  }
}
