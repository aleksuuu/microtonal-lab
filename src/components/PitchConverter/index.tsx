import {
  BorderType,
  FreqMidiNoteCents,
  TextInputErrorType,
} from "../../common/types";
import { useState, useEffect } from "react";
import {
  fromFreq,
  fromValidNoteNameAndCents,
  fromMidiNote,
  fromNoteNameStringAndCents,
  fromDetuneCentsToSibeliusPitchBend,
} from "../../common/UtilityFuncs";
import NumberInput from "../NumberInput";
import TextInput from "../TextInput";
import VerovioRenderer from "../VerovioRenderer";
import Button from "../Button";

const PitchConverter = () => {
  const [freqMidiNoteCents, setFreqMidiNoteCents] = useState<FreqMidiNoteCents>(
    fromFreq(440, true)
  );
  const [noteName, setNoteName] = useState(
    freqMidiNoteCents.noteName + freqMidiNoteCents.octave
  );
  const [textInputErr, setTextInputErr] = useState(TextInputErrorType.NO_ERROR);
  const [sibeliusPitchBend, setSibeliusPitchBend] = useState("");
  const [isCopied, setIsCopied] = useState(false);
  useEffect(() => {
    setSibeliusPitchBend(
      fromDetuneCentsToSibeliusPitchBend(freqMidiNoteCents.addCents)
    );
  }, [freqMidiNoteCents.addCents]);

  useEffect(() => {
    setNoteName(freqMidiNoteCents.noteName + freqMidiNoteCents.octave);
  }, [freqMidiNoteCents.noteName, freqMidiNoteCents.octave]);

  const handleNumberInput = (id: string, v: number) => {
    switch (id) {
      case "pitch-converter-freq-input":
        if (v) {
          setFreqMidiNoteCents(fromFreq(v, true));
        }
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
      setTextInputErr(TextInputErrorType.NO_ERROR);
    } else {
      setTextInputErr(TextInputErrorType.PARSING);
    }
  };
  const handleTextInputOnChange = (_id: string, v: string) => {
    setNoteName(v);
  };
  const handleCopyOnClick = async () => {
    try {
      await navigator.clipboard.writeText(sibeliusPitchBend);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset state after 2 seconds
    } catch (error) {
      console.error("Failed to copy text: ", error);
    }
  };

  return (
    <div>
      <h2>Pitch Converter</h2>
      <div className="default-flexbox">
        <div className="utility-tools-input-form">
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
            border={
              textInputErr === TextInputErrorType.NO_ERROR
                ? BorderType.NORMAL
                : BorderType.FAILURE
            }
            id="pitch-converter-note-name-input"
            text={noteName}
            onChange={handleTextInputOnChange}
            onBlur={handleTextInputOnBlur}
            className="medium-input"
          >
            Note name w/ octave
          </TextInput>
          {textInputErr !== TextInputErrorType.NO_ERROR && (
            <p>{textInputErr}</p>
          )}
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
          {sibeliusPitchBend !== "" && (
            <>
              <p>Pitch bend message for Sibelius: {sibeliusPitchBend}</p>
              <Button onClick={handleCopyOnClick}>
                {isCopied ? "Copied" : "Copy Pitch Bend Message"}
              </Button>
            </>
          )}
        </div>
        {freqMidiNoteCents.freq > 0 && (
          <VerovioRenderer notes={[freqMidiNoteCents]}></VerovioRenderer>
        )}
      </div>
    </div>
  );
};

export default PitchConverter;
