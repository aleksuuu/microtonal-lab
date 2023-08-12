import "./index.scss";
import { useState } from "react";
import NumberInput from "../NumberInput";

interface Props {
  id: string;
  initValue: number;
  onChange: (id: string, v: number) => void;
}

const FreqInput = ({ id, initValue, onChange }: Props) => {
  const [freq, setFreq] = useState(initValue);

  return (
    <>
      {/* <NumericInput
        id={id}
        min={20}
        max={10000}
        value={freq}
        step={1}
        precision={1}
        onChange={(v: number | null, s: string, h: HTMLInputElement) => {
          if (v) {
            setFreq(v);
            onChange(v, id);
          }
        }}
      /> */}
      <NumberInput
        id={id}
        initValue={initValue}
        isFreqValue={true}
        onChange={(id: string, v: number) => {
          setFreq(v);
          onChange(id, v);
        }}
      ></NumberInput>
      <span className="note-name unimportant">{noteFromPitch(freq)}</span>
    </>
  );
};

const noteFromPitch = (frequency: number): string => {
  if (!frequency || frequency === 0) {
    return "";
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
  const noteNum = 12 * (Math.log(frequency / 440) / Math.log(2));
  const roundedNoteNum = Math.round(noteNum);
  let arrow = "";
  if (noteNum - roundedNoteNum > 0.05) {
    arrow = "↑";
  } else if (noteNum - roundedNoteNum < -0.05) {
    arrow = "↓";
  }
  const midiNote = roundedNoteNum + 69;
  const noteName = noteNames[midiNote % 12];
  const octave = Math.floor(midiNote / 12) - 1;
  return noteName + octave + arrow;
};

export default FreqInput;
