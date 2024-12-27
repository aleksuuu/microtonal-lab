import { useEffect, useState } from "react";
import {
  BorderType,
  EDO12NOTENAMES,
  FreqMidiNoteCents,
} from "../../common/types";
import NumberInput from "../../components/NumberInput";
import TextInput from "../../components/TextInput";
import "./index.scss";
import {
  fromFreq,
  fromMidiNote,
  fromNoteNameStringAndCents,
  fromValidNoteNameAndCents,
} from "../../common/UtilityFuncs";

const UtilityTools = () => {
  const [freqMidiNoteCents, setFreqMidiNoteCents] = useState<FreqMidiNoteCents>(
    {
      freq: 440,
      midiNote: 69,
      noteName: EDO12NOTENAMES.A,
      octave: 4,
      addCents: 0,
    }
  );
  const [noteName, setNoteName] = useState(
    freqMidiNoteCents.noteName + freqMidiNoteCents.octave
  );
  const [textInputHasErr, setTextInputHasErr] = useState(false);

  useEffect(() => {
    setNoteName(freqMidiNoteCents.noteName + freqMidiNoteCents.octave);
  }, [freqMidiNoteCents.noteName, freqMidiNoteCents.octave]);

  const handleNumberInput = (id: string, v: number) => {
    switch (id) {
      case "freq-input":
        setFreqMidiNoteCents(fromFreq(v));
        break;
      case "add-cents-input":
        setFreqMidiNoteCents(
          fromValidNoteNameAndCents(
            freqMidiNoteCents.noteName,
            freqMidiNoteCents.octave,
            v
          )
        );
        break;
      case "midi-note-input":
        setFreqMidiNoteCents(fromMidiNote(v));
        break;
    }
  };
  const handleTextInputOnBlur = (_id: string, v: string) => {
    const output = fromNoteNameStringAndCents(v, freqMidiNoteCents.addCents);
    if (output) {
      setFreqMidiNoteCents(output);
      setTextInputHasErr(false);
      // setTextInputErr("");
    } else {
      setTextInputHasErr(true);
    }
  };
  const handleTextInputOnChange = (_id: string, v: string) => {
    setNoteName(v);
  };

  // const errorMsg = <p>{err}</p>;

  const pitchConverter = (
    <div>
      <h2>Pitch Converter</h2>
      <NumberInput
        id="freq-input"
        value={freqMidiNoteCents.freq}
        isFreqValue={true}
        onChange={handleNumberInput}
        className="medium-input"
      >
        Frequency
      </NumberInput>
      <TextInput
        border={textInputHasErr ? BorderType.Failure : BorderType.Normal}
        id="note-name-input"
        text={noteName}
        onChange={handleTextInputOnChange}
        onBlur={handleTextInputOnBlur}
        className="medium-input"
      >
        Note name w/ octave
      </TextInput>
      <br />
      <p>{textInputHasErr ? "Invalid text input." : ""}</p>
      <NumberInput
        id="add-cents-input"
        value={freqMidiNoteCents.addCents}
        isFreqValue={false}
        onChange={handleNumberInput}
        className="medium-input"
      >
        Detune in cents
      </NumberInput>
      <NumberInput
        id="midi-note-input"
        value={freqMidiNoteCents.midiNote}
        isFreqValue={false}
        onChange={handleNumberInput}
        className="medium-input"
      >
        MIDI note
      </NumberInput>
    </div>
  );
  return (
    <>
      <title>Microtonal Lab - Utility Tools</title>
      {pitchConverter}
    </>
  );
};
export default UtilityTools;
