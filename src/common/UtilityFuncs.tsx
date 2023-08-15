export const midiToFreq = (midiNote: number) => {
  return Math.pow(2, (midiNote - 69) / 12) * 440;
};

export const freqToMidi = (freq: number) => {
  return 12 * Math.log2(freq / 440) + 69;
};

export const freqToNoteName = (freq: number) => {
  const midiNote = freqToMidi(freq);
  const rounded = Math.round(midiNote);
  let arrow = "";
  if (midiNote - rounded > 0.05) {
    arrow = "↑";
  } else if (midiNote - rounded < -0.05) {
    arrow = "↓";
  }
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
  const noteName = noteNames[rounded % 12];
  const octave = Math.floor(rounded / 12) - 1;
  return noteName + octave + arrow;
};

export const centsToFreq = (cents: number) => {
  return midiToFreq(cents * 0.01);
};
