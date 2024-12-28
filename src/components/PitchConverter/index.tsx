import {
  BorderType,
  EDO12NOTENAMES,
  FreqMidiNoteCents,
} from "../../common/types";
import { useState, useEffect } from "react";
import {
  fromFreq,
  fromValidNoteNameAndCents,
  fromMidiNote,
  fromNoteNameStringAndCents,
} from "../../common/UtilityFuncs";
import NumberInput from "../NumberInput";
import TextInput from "../TextInput";

const PitchConverter = () => {
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
      case "pitch-converter-freq-input":
        setFreqMidiNoteCents(fromFreq(v));
        break;
      case "pitch-converter-add-cents-input":
        setFreqMidiNoteCents(
          fromValidNoteNameAndCents(
            freqMidiNoteCents.noteName,
            freqMidiNoteCents.octave,
            v
          )
        );
        break;
      case "pitch-converter-midi-note-input":
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

  return (
    <div>
      <h2>Pitch Converter</h2>
      <NumberInput
        id="pitch-converter-freq-input"
        value={freqMidiNoteCents.freq}
        isFreqValue={true}
        onChange={handleNumberInput}
        className="medium-input"
      >
        Frequency
      </NumberInput>
      <TextInput
        border={textInputHasErr ? BorderType.Failure : BorderType.Normal}
        id="pitch-converter-note-name-input"
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
        id="pitch-converter-add-cents-input"
        value={freqMidiNoteCents.addCents}
        isFreqValue={false}
        onChange={handleNumberInput}
        className="medium-input"
      >
        Detune in cents
      </NumberInput>
      <NumberInput
        id="pitch-converter-midi-note-input"
        value={freqMidiNoteCents.midiNote}
        isFreqValue={false}
        onChange={handleNumberInput}
        className="medium-input"
      >
        MIDI note
      </NumberInput>
    </div>
  );
};

export default PitchConverter;
