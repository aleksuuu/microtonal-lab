import { useEffect, useState } from "react";
import { Output, WebMidi } from "webmidi";
import MenuOptions from "../../components/MenuOptions";
import Button from "../../components/Button";
import { BorderType } from "../../common/types";
import NumberInput from "../../components/NumberInput";
import "./index.scss";
import { freqToMidi } from "../../common/UtilityFuncs";

const FreqToMidi = () => {
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
  const [pitchBendRange, setPitchBendRange] = useState(2);
  const [freqInputValues, setFreqInputValues] = useState([] as number[]);

  useEffect(() => {
    if (microtonalNotes) {
      setFreqInputValues(microtonalNotes.map((note) => note.currFreq));
    }
  }, [microtonalNotes]);

  const initMicrotonalNotes = () => {
    if (microtonalNotes.length === 0) {
      const baseFreq = 110;
      for (let i = 0; i < 8; i++) {
        const freq = baseFreq * (i + 1);
        setMicrotonalNotes((prev) => {
          return prev.concat(freqToMicrotonalNote(freq, false));
        });
      }
    }
  };
  const onWebMidiEnabled = () => {
    setMidiOutputs(
      WebMidi.outputs.map(({ name, id }) => ({ value: name, id }))
    );
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
        if (oldNote.isOn && oldNote.lastNoteOn !== undefined) {
          outputChannel.sendNoteOff(oldNote.lastNoteOn);
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
    isOn: boolean,
    prevMidiNote?: number
  ): MicrotonalNote => {
    const midiNoteFloat = freqToMidi(freq);
    const midiNote = Math.floor(midiNoteFloat);
    const pitchbend = (midiNoteFloat - midiNote) / pitchBendRange;
    return {
      currFreq: freq,
      midiNote: midiNote,
      pitchbend: pitchbend,
      isOn: isOn,
      lastNoteOn: prevMidiNote,
    };
  };

  const setOneMicrotonalNote = (
    channel: number,
    frequency?: number,
    isOn?: boolean
  ) => {
    const newMicrotonalNotes = microtonalNotes.map((oldNote, i) => {
      if (i === channel - 1) {
        let newFreq = oldNote.currFreq;
        let newIsOn = oldNote.isOn;
        let newLastNoteOn = oldNote.lastNoteOn;
        if (frequency !== undefined) {
          newFreq = frequency;
        }
        if (isOn !== undefined) {
          newIsOn = isOn;
          if (isOn) {
            newLastNoteOn = oldNote.midiNote;
          }
        }
        const newNote = freqToMicrotonalNote(newFreq, newIsOn, newLastNoteOn);
        sendMicrotonalNoteMsg(oldNote, newNote, i + 1);
        return newNote;
      } else {
        return oldNote;
      }
    });
    setMicrotonalNotes(newMicrotonalNotes);
  };

  const handleFreqInputBlur = (id: string, v: number) => {
    const textAndChannelNumber = extractTextAndChannelNumberFrom(id);
    if (!textAndChannelNumber) {
      console.error("Could not get current channel.");
      return;
    }
    const channel = textAndChannelNumber[1];
    setOneMicrotonalNote(channel, v);
  };

  const handleFreqInputChange = (id: string, v: number) => {
    const textAndChannelNumber = extractTextAndChannelNumberFrom(id);
    if (!textAndChannelNumber) {
      console.error("Could not get current channel.");
      return;
    }
    const channel = textAndChannelNumber[1];
    const newValues = freqInputValues.map((oldV, i) => {
      if (i === channel - 1) {
        return v;
      } else {
        return oldV;
      }
    });
    setFreqInputValues(newValues);
  };

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
    const isOn = microtonalNotes[channel - 1].isOn;
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

  const makeFreqInputRow = (channel: number): React.ReactElement => {
    return (
      <li key={channel}>
        {/* TODO: eventually switch to FreqInput with correct styles */}
        {/* <FreqInput
          id={`freq-input-${channel}`}
          initValue={microtonalNotes[channel - 1].currFreq}
          onChange={handleFreqInput}
          numberInputClassName="short-input-no-text"
        ></FreqInput> */}
        <NumberInput
          id={`freq-input-${channel}`}
          value={freqInputValues[channel - 1]}
          isFreqValue={true}
          onChange={handleFreqInputChange}
          onBlur={handleFreqInputBlur}
          className="short-input-no-text"
        ></NumberInput>
        {makeNoteOnOrOffButton(channel)}
      </li>
    );
  };

  const makeFreqInputRows = (numberOfFreqs: number): React.ReactElement => {
    if (microtonalNotes.length === 0) {
      return <></>;
    }
    const rows = [];
    for (let chan = 1; chan <= numberOfFreqs; chan++) {
      rows.push(makeFreqInputRow(chan));
    }
    return <ul className="freq-input-rows flex-row">{rows}</ul>;
  };

  const errMsg = (): React.ReactElement => {
    return (
      <div hidden={midiEnabled}>
        <h2>If you don't see any MIDI output…</h2>
        <ul>
          <li>
            - Use a supported browser, such as Chrome or Firefox (Safari is not
            natively supported).
          </li>
          <li>- Grant MIDI permissions in your browser.</li>
          <li>
            - Make sure you have MIDI devices connected. If you’d like to route
            MIDI messages to a DAW, you could use a virtual MIDI bus (
            <a href="https://support.apple.com/guide/audio-midi-setup/transfer-midi-information-between-apps-ams1013/mac">
              macOS guide
            </a>
            ).
          </li>
        </ul>
      </div>
    );
  };

  return (
    <>
      <title>Microtonal Lab - Frequency to MIDI</title>
      {errMsg()}
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
          (This value should match the upward pitch bend range of your MIDI
          instrument (DAW/plugin/etc)).
        </NumberInput>
      </div>
      <div>
        <h2>Enter frequencies: </h2>
        {makeFreqInputRows(8)}
        <br />
        <Button id="all-notes-off-all-chans" onClick={handleButtonOnClick}>
          All Notes Off
        </Button>
      </div>
    </>
  );
};
export default FreqToMidi;
