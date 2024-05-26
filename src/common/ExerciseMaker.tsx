import { Synth, PolySynth, now } from "tone";
import scales from "./scales.json";
import { freqToMidi, centsToFreq } from "./UtilityFuncs";

type Note = {
  name: string;
  cents: number;
};

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

  questionIndex = 0;
  correctAnswers = 0;

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
  );
  // ) {
  //   this.scaleName = scaleName;
  //   this.intervalsSmallerThanOctave = intervalsSmallerThanOctave;
  //   this.intervalsLargerThanOctave = intervalsLargerThanOctave;
  //   this.playArp = playArp;
  //   this.playSim = playSim;
  //   this.minFreq = minFreq;
  //   this.maxFreq = maxFreq;
  //   this.numQuestions = numQuestions;
  //   this.infiniteMode = infiniteMode;
  // }
  constructor();

  constructor(...params: any[]) {
    if (params.length === 9) {
      this.scaleName = params[0];
      this.intervalsSmallerThanOctave = params[1];
      this.intervalsLargerThanOctave = params[2];
      this.playArp = params[3];
      this.playSim = params[4];
      this.minFreq = params[5];
      this.maxFreq = params[6];
      this.numQuestions = params[7];
      this.infiniteMode = params[8];
    } else {
      this.scaleName = "default";
      this.intervalsSmallerThanOctave = true;
      this.intervalsLargerThanOctave = false;
      this.playArp = true;
      this.playSim = true;
      this.minFreq = 220;
      this.maxFreq = 659.3;
      this.numQuestions = 5;
      this.infiniteMode = true;
    }
  }

  possibleIntervals: { name: string; cents: number }[] = new Array();
  notesInScale: { name: string; cents: number }[] = new Array();

  currInterval?: {
    name: string;
    note1: Note;
    note2: Note;
    playArp: boolean;
  };

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
    if (this.intervalsSmallerThanOctave && this.intervalsLargerThanOctave) {
      const smallerThanOctave = scale.intervals;
      const largerThanOctave = scale.intervals.map((interval) => ({
        name: interval.name,
        cents: interval.cents + 1200,
      }));
      this.possibleIntervals = smallerThanOctave.concat(largerThanOctave);
    } else if (this.intervalsSmallerThanOctave) {
      this.possibleIntervals = scale.intervals;
    } else {
      this.possibleIntervals = scale.intervals.map((interval) => ({
        name: interval.name,
        cents: interval.cents + 1200,
      }));
      console.log(this.possibleIntervals);
    }
    this.notesInScale = scale.notes;
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
    direction: "up" | "down"
  ): { degree: number; cents: number } | null {
    if (freq <= 0) {
      return null; // Invalid frequency
    }

    // Calculate the MIDI note corresponding to the input frequency
    const midiNote = freqToMidi(freq);

    // The cents per octave of the microtonal scale
    // const centsPerEquave = scale[scale.length - 1];

    // The number of midi notes per octave of the microtonal scale
    const midiNotesPerEquave = this.centsPerEquave / 100;

    const octaveNum = Math.floor(midiNote / midiNotesPerEquave);

    const scaleDegreeInMidi = midiNote % midiNotesPerEquave;

    const scaleDegreeInCents = scaleDegreeInMidi * 100;

    let indexOfClosest = this.scaleCents.reduce(function (prev, curr, index) {
      return Math.abs(curr - scaleDegreeInCents) <
        Math.abs(prev - scaleDegreeInCents)
        ? index
        : index - 1;
    });

    let closestCents = this.scaleCents[indexOfClosest];

    if (direction === "up" && closestCents < scaleDegreeInCents) {
      if (indexOfClosest < this.scaleCents.length - 1) {
        indexOfClosest++;
      } else {
        indexOfClosest = 0;
      }
    } else if (direction === "down" && closestCents > scaleDegreeInCents) {
      if (indexOfClosest > 0) {
        indexOfClosest--;
      } else {
        indexOfClosest = this.scaleCents.length - 1;
      }
    }

    closestCents = this.scaleCents[indexOfClosest];

    return { degree: indexOfClosest, cents: closestCents * octaveNum };
  }

  get centsPerEquave() {
    return this.scaleCents[this.scaleCents.length - 1];
  }

  get scaleCents() {
    return this.notesInScale.map((note) => note.cents);
  }
  get minDegreeAndCents() {
    return this.quantizeToScaleDegreeAndCents(this.minFreq, "up");
  }

  get maxDegreeAndCents() {
    return this.quantizeToScaleDegreeAndCents(this.maxFreq, "down");
  }

  get availableNotes() {
    if (!this.minDegreeAndCents || !this.maxDegreeAndCents) {
      return null;
    }
    const getCentsDiffBtwTwoDegrees = (currDegree: number) => {
      const degree = currDegree % (this.scaleCents.length - 1);
      return this.scaleCents[degree + 1] - this.scaleCents[degree];
    };

    var notes: Note[] = new Array();

    for (
      var d = this.minDegreeAndCents.degree, c = this.minDegreeAndCents.cents;
      c < this.maxDegreeAndCents.cents;
      d++, c += getCentsDiffBtwTwoDegrees(d)
    ) {
      const currNote = this.notesInScale[d % (this.notesInScale.length - 1)];
      notes.push({ name: currNote.name, cents: c });
    }
    return notes;
  }

  doPlayArp = (freq1: number, freq2: number) => {
    const currTime = now(); // Tone.now() gets the current time of the AudioContext
    this.synth.triggerAttackRelease(freq1, 0.7, currTime); // freq, dur, start
    this.synth.triggerAttackRelease(freq2, 1, currTime + 0.7);
  };
  doPlaySim = (freq1: number, freq2: number) => {
    this.synth.triggerAttackRelease([freq1, freq2], 1);
  };

  // recursive
  private getIntervalNameAndNote2(
    note1: Note
  ): { intervalName: string; note2: Note } | null {
    const direction = Math.random() > 0.5 ? 1 : -1;
    const interval =
      this.possibleIntervals[
        Math.floor(Math.random() * this.possibleIntervals.length)
      ];
    const note2Cents = note1.cents + direction * interval.cents;
    if (!this.minDegreeAndCents || !this.maxDegreeAndCents) {
      console.error("Error accessing min degree and cents");
      return null;
    }

    const note2 = this.availableNotes?.filter(
      (note) => note.cents == note2Cents
    )[0];

    if (
      !note2 ||
      note2Cents > this.maxDegreeAndCents.cents ||
      note2Cents < this.minDegreeAndCents.cents
    ) {
      return this.getIntervalNameAndNote2(note1);
    } else {
      return { intervalName: interval.name, note2: note2 };
    }
  }

  makeInterval() {
    if (!this.availableNotes) {
      return;
    }
    const note1Index = Math.floor(Math.random() * this.availableNotes.length);
    let note1 = this.availableNotes[note1Index];
    const intervalAndNote2 = this.getIntervalNameAndNote2(note1);
    if (!intervalAndNote2) {
      return;
    }
    let playArp = true;
    if (this.playArp && this.playSim) {
      playArp = Math.random() > 0.5;
    } else if (this.playSim) {
      playArp = false;
    }
    // if playing simultaneously, sort the notes from low to high so that note1.cents < note2.cents
    if (!playArp) {
      if (note1.cents > intervalAndNote2.note2.cents) {
        const tmp = note1;
        note1 = intervalAndNote2.note2;
        intervalAndNote2.note2 = tmp;
      }
    }
    this.currInterval = {
      name: intervalAndNote2.intervalName,
      note1: note1,
      note2: intervalAndNote2.note2,
      playArp: playArp,
    };
    this.questionIndex++;
  }

  playInterval() {
    if (!this.currInterval) {
      console.error("Error accessing current interval.");
      return;
    }
    const freq1 = centsToFreq(this.currInterval.note1.cents);
    const freq2 = centsToFreq(this.currInterval.note2.cents);
    if (this.currInterval.playArp) {
      this.doPlayArp(freq1, freq2);
    } else {
      this.doPlaySim(freq1, freq2);
    }
  }

  private getEquaveFromCents(cents: number) {
    return Math.floor(cents / this.centsPerEquave);
  }

  verifyAnswer(answer: string) {
    if (!this.currInterval) {
      console.error("Error accessing current interval.");
      return;
    }
    if (answer == this.currInterval.name) {
      this.correctAnswers++;
      return true;
    }
    return false;
  }

  get currentNotes() {
    if (!this.currInterval) {
      console.error("Error accessing current notes.");
      return;
    }
    const note1 = this.currInterval?.note1;
    const note2 = this.currInterval?.note2;

    return (
      note1.name +
      this.getEquaveFromCents(note1.cents) +
      ", " +
      note2.name +
      this.getEquaveFromCents(note2.cents)
    );
  }
}
