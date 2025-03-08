import { useEffect, useState } from "react";
import { Output, WebMidi } from "webmidi";
import MenuOptions from "../../components/MenuOptions";
import Button from "../../components/Button";
import { BorderType, TextInputErrorType } from "../../common/types";
import NumberInput from "../../components/NumberInput";
import "./index.scss";
import { freqToMidi, getFreqFromTextInput } from "../../common/UtilityFuncs";
import TextInput from "../../components/TextInput";

const PitchToMidi = () => {
  enum MidiActions {
    NOTEON = "note-on",
    NOTEOFF = "note-off",
    ALLNOTESOFFCURRENTCHANNEL = "all-notes-off-curr-chan",
    ALLNOTESOFFALLCHANNELS = "all-notes-off-all-chans",
  }
  type MicrotonalNote = {
    currFreq: number;
    midiNote: number;
    pitchbend: number;
    isOn: boolean;
    lastNoteOn?: number; // This is for when currFreq has been changed but a noteoff hasn't been sent for the previous frequency. When a noteon is sent for currFreq, a noteoff will be sent for prevFreq. It should be midi note number of the last note on in this channel
  };
  useEffect(() => {
    WebMidi.enable().then(onWebMidiEnabled).catch(onWebMidiError);
    initMicrotonalNotes();
  }, []);
  const [midiOutputs, setMidiOutputs] = useState<
    { value: string; id: string }[]
  >([]);
  const [output, setOutput] = useState<Output | undefined>();
  const [midiEnabled, setMidiEnabled] = useState(false);
  const [microtonalNotes, setMicrotonalNotes] = useState(
    [] as MicrotonalNote[]
  );
  const [pitchBendRange, setPitchBendRange] = useState(48);
  // const [pitchInputValues, setPitchInputValues] = useState([] as number[]);
  const [pitchInputTexts, setPitchInputTexts] = useState([] as string[]);
  const [textInputErrs, setTextInputErrs] = useState(
    new Array(8).fill(TextInputErrorType.NO_ERROR)
  );

  // useEffect(() => {
  //   if (microtonalNotes) {
  //     setPitchInputValues(microtonalNotes.map((note) => note.currFreq));
  //   }
  // }, [microtonalNotes]);

  const initMicrotonalNotes = () => {
    if (microtonalNotes.length === 0) {
      const baseFreq = 110;
      for (let i = 0; i < 8; i++) {
        const freq = baseFreq * (i + 1);
        setMicrotonalNotes((prev) => {
          return prev.concat(freqToMicrotonalNote(freq, false));
        });
        setPitchInputTexts((prev) => {
          return prev.concat(String(freq));
        });
      }
    }
  };
  const onWebMidiEnabled = () => {
    setMidiOutputs(
      WebMidi.outputs.map(({ name, id }) => ({ value: name, id }))
    );
    if (WebMidi.outputs.length < 1) {
      setMidiEnabled(false);
      return;
    }
    setMidiEnabled(true);
    setOutput(WebMidi.outputs[0]);
  };
  const onWebMidiError = (err: any) => {
    console.error("WebMidi could not be enabled.", err);
    setMidiEnabled(false);
  };
  const handleMidiOutputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const outputId = e.target.selectedOptions.item(0)?.id;
    if (!outputId) {
      console.error("No output ID found.");
      setOutput(WebMidi.outputs[0]);
      return;
    }
    const output = WebMidi.getOutputById(outputId);
    if (!output) {
      console.error("No output found for ID " + outputId);
      setOutput(WebMidi.outputs[0]);
      return;
    }
    setOutput(output);
  };

  const extractTextAndChannelNumberFrom = (
    id: string
  ): [string, number] | null => {
    const match = id.match(/^(.*)-(\d+)$/);
    if (match) {
      const text = match[1];
      const number = parseInt(match[2], 10);
      return [text, number];
    }
    return null;
  };

  const extractMidiActionAndChannelNumberFrom = (
    id: string
  ): [MidiActions, number] | null => {
    const textAndChannelNumber = extractTextAndChannelNumberFrom(id);
    if (textAndChannelNumber) {
      const potentialMidiAction = textAndChannelNumber[0] as MidiActions;
      if (Object.values(MidiActions).includes(potentialMidiAction)) {
        return [potentialMidiAction, textAndChannelNumber[1]];
      }
    }
    return null;
  };

  const sendMicrotonalNoteMsg = (
    oldNote: MicrotonalNote,
    newNote: MicrotonalNote,
    channel: number
  ) => {
    if (output) {
      const outputChannel = output.channels[channel];
      if (newNote.isOn) {
        if (oldNote.isOn) {
          outputChannel.sendNoteOff(oldNote.midiNote);
        }
        outputChannel.sendPitchBend(newNote.pitchbend);
        outputChannel.sendNoteOn(newNote.midiNote);
      } else {
        outputChannel.sendNoteOff(newNote.midiNote);
      }
    }
  };

  const freqToMicrotonalNote = (
    freq: number,
    isOn: boolean
  ): MicrotonalNote => {
    const midiNoteFloat = freqToMidi(freq);
    const midiNote = Math.floor(midiNoteFloat);
    const pitchbend = (midiNoteFloat - midiNote) / pitchBendRange;
    return {
      currFreq: freq,
      midiNote: midiNote,
      pitchbend: pitchbend,
      isOn: isOn,
    };
  };

  const setOneMicrotonalNote = (
    channel: number,
    frequency?: number,
    isOn?: boolean
  ) => {
    const newMicrotonalNotes = microtonalNotes.map((oldNote, i) => {
      if (i === channel - 2) {
        let newFreq = oldNote.currFreq;
        let newIsOn = oldNote.isOn;
        if (frequency !== undefined) {
          newFreq = frequency;
        }
        if (isOn !== undefined) {
          newIsOn = isOn;
        }
        const newNote = freqToMicrotonalNote(newFreq, newIsOn);
        sendMicrotonalNoteMsg(oldNote, newNote, i + 2);
        return newNote;
      } else {
        return oldNote;
      }
    });
    setMicrotonalNotes(newMicrotonalNotes);
  };

  // const handlePitchInputBlur = (id: string, v: number) => {
  //   const textAndChannelNumber = extractTextAndChannelNumberFrom(id);
  //   if (!textAndChannelNumber) {
  //     console.error("Could not get current channel.");
  //     return;
  //   }
  //   const channel = textAndChannelNumber[1];
  //   setOneMicrotonalNote(channel, v);
  // };

  // const handlePitchInputChange = (id: string, v: number) => {
  //   const textAndChannelNumber = extractTextAndChannelNumberFrom(id);
  //   if (!textAndChannelNumber) {
  //     console.error("Could not get current channel.");
  //     return;
  //   }
  //   const channel = textAndChannelNumber[1];
  //   const newValues = pitchInputValues.map((oldV, i) => {
  //     if (i === channel - 2) {
  //       return v;
  //     } else {
  //       return oldV;
  //     }
  //   });
  //   setPitchInputValues(newValues);
  // };

  const handlePitchBendInput = (_id: string, v: number) => {
    setPitchBendRange(v);
  };

  const handleButtonOnClick = (id: string) => {
    const midiActionAndChannelNumber =
      extractMidiActionAndChannelNumberFrom(id);
    let midiAction = id;
    let channelNumber = 0;
    if (midiActionAndChannelNumber) {
      midiAction = midiActionAndChannelNumber[0];
      channelNumber = midiActionAndChannelNumber[1];
    }
    switch (midiAction) {
      case MidiActions.NOTEON:
        setOneMicrotonalNote(channelNumber, undefined, true);
        break;
      case MidiActions.NOTEOFF:
        setOneMicrotonalNote(channelNumber, undefined, false);
        break;
      case MidiActions.ALLNOTESOFFCURRENTCHANNEL:
        break;
      case MidiActions.ALLNOTESOFFALLCHANNELS:
        if (output) {
          output.sendAllNotesOff();
        }
        break;
    }
  };

  const makeNoteOnOrOffButton = (channel: number): React.ReactElement => {
    const isOn = microtonalNotes[channel - 2].isOn;
    const buttonId = `note-${isOn ? "off" : "on"}-${channel}`; // this is flipped because the id should indicate the function of the button, which is to turn on when the note is off
    const buttonBorder = isOn ? BorderType.SUCCESS : BorderType.NORMAL;
    // const buttonText = isOn ? "⏽" : "⭘";
    const buttonText = "⏻";
    return (
      <Button
        id={buttonId}
        border={buttonBorder}
        disabledColor={!isOn}
        onClick={handleButtonOnClick}
      >
        {buttonText}
      </Button>
    );
  };

  const handleTextInputOnChange = (id: string, v: string) => {
    const textAndChannelNumber = extractTextAndChannelNumberFrom(id);
    if (!textAndChannelNumber) {
      console.error("Could not get current channel.");
      return;
    }
    const channel = textAndChannelNumber[1];
    const newValues = pitchInputTexts.map((oldV, i) => {
      if (i === channel - 2) {
        return v;
      } else {
        return oldV;
      }
    });
    setPitchInputTexts(newValues);
  };

  const validatePitchInput = (id: string) => {
    const textAndChannelNumber = extractTextAndChannelNumberFrom(id);
    if (!textAndChannelNumber) {
      console.error("Could not get current channel.");
      return;
    }
    const channel = textAndChannelNumber[1];
    const parsedFreq = getFreqFromTextInput(pitchInputTexts[channel - 2]);
    if (!parsedFreq) {
      setTextInputErrs((prev) =>
        prev.map((err, i) =>
          i === channel - 2 ? TextInputErrorType.PARSING : err
        )
      );
      return;
    }
    setTextInputErrs((prev) =>
      prev.map((err, i) =>
        i === channel - 2 ? TextInputErrorType.NO_ERROR : err
      )
    );

    setOneMicrotonalNote(channel, parsedFreq);
  };

  const handleTextInputOnBlur = (id: string, _v: string) => {
    validatePitchInput(id);
  };

  const handleTextInputOnEnter = (id: string) => {
    validatePitchInput(id);
  };

  const makePitchInputRow = (channel: number): React.ReactElement => {
    return (
      <li key={channel}>
        {textInputErrs[channel - 2] !== TextInputErrorType.NO_ERROR && (
          <p>{textInputErrs[channel - 2]}</p>
        )}
        <TextInput
          id={`pitch-input-${channel}`}
          text={pitchInputTexts[channel - 2]}
          onChange={handleTextInputOnChange}
          onBlur={handleTextInputOnBlur}
          onEnter={handleTextInputOnEnter}
          className="short-input-no-text"
          border={
            textInputErrs[channel - 2] === TextInputErrorType.NO_ERROR
              ? BorderType.NORMAL
              : BorderType.FAILURE
          }
        />
        {makeNoteOnOrOffButton(channel)}
      </li>
    );
  };

  const makePitchInputRows = (numberOfFreqs: number): React.ReactElement => {
    if (microtonalNotes.length === 0) {
      return <></>;
    }
    const rows = [];
    for (let chan = 2; chan <= numberOfFreqs + 1; chan++) {
      // Reserve channel 1 for global messages
      rows.push(makePitchInputRow(chan));
    }
    return <ul className="pitch-input-rows flex-row">{rows}</ul>;
  };

  const errMsg = (
    <>
      {!midiEnabled && (
        <div>
          <h2>If you don't see any MIDI output…</h2>
          <ul>
            <li>
              - Use a supported browser, such as Chrome or Firefox (Safari is
              not natively supported).
            </li>
            <li>- Grant MIDI permissions in your browser.</li>
            <li>
              - Make sure you have MIDI devices connected. If you’d like to
              route MIDI messages to a DAW, you could use a virtual MIDI bus (
              <a href="https://support.apple.com/guide/audio-midi-setup/transfer-midi-information-between-apps-ams1013/mac">
                macOS guide
              </a>
              ).
            </li>
          </ul>
        </div>
      )}
    </>
  );

  return (
    <>
      <title>Microtonal Lab - Pitch to MIDI</title>
      {errMsg}
      <div>
        <h2>Select a MIDI output: </h2>
        <MenuOptions id="midi-outputs" onChange={handleMidiOutputChange}>
          {midiOutputs}
        </MenuOptions>
      </div>
      <div>
        <h2>Pitch bend range:</h2>
        <NumberInput
          id="pitch-bend-input"
          value={pitchBendRange}
          isFreqValue={false}
          onChange={handlePitchBendInput}
          className="short-input"
        >
          (This value should match the pitch bend range of your MIDI instrument
          (DAW/plugin/etc)).
        </NumberInput>
      </div>
      <div>
        <h2>Enter pitches: </h2>
        {makePitchInputRows(8)}
        <br />
        <Button id="all-notes-off-all-chans" onClick={handleButtonOnClick}>
          All Notes Off
        </Button>
        <p>
          (All Notes Off might not work in certain environments, such as{" "}
          <a href="https://www.logicprohelp.com/forums/topic/38157-cc123-all-notes-off-behavior/">
            Logic Pro
          </a>
          .)
        </p>
        <h2>How to enter pitches:</h2>
        <p>
          You could enter pitches in any of the following formats:
          <ul>
            <li>- Frequency values (440, 1212.12, etc.).</li>
            <li>
              - Note names with octaves and optionally cents (A4, C5+43,
              Bb3-21.21, etc.).
            </li>
            <li>
              - MIDI note numbers, beginning with the letter “m” (m60, m72.35,
              etc.).
            </li>
          </ul>
        </p>
      </div>
    </>
  );
};
export default PitchToMidi;
