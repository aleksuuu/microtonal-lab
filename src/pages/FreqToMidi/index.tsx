import { useEffect, useState } from "react";
import { Output, OutputChannel, WebMidi } from "webmidi";
import MenuOptions from "../../components/MenuOptions";
import Button from "../../components/Button";
import NumberInput from "../../components/NumberInput";
import "./index.scss";

const FreqToMidi = () => {
  enum MidiActions {
    NOTEON = "note-on",
    NOTEOFF = "note-off",
    ALLNOTESOFFCURRENTCHANNEL = "all-notes-off-curr-chan",
    ALLNOTESOFFALLCHANNELS = "all-notes-off-all-chans",
  }
  useEffect(() => {
    WebMidi.enable()
      .then(onWebMidiEnabled)
      .catch((err) => console.error("WebMidi could not be enabled.", err));
  }, []);
  const [midiOutputs, setMidiOutputs] = useState<
    { value: string; id: string }[]
  >([]);
  const [output, setOutput] = useState<Output | undefined>();
  const freqs = [110, 220, 330, 440, 550, 660, 770, 880];
  const pitchBendRange = 2; // semitones
  const onWebMidiEnabled = () => {
    setMidiOutputs(
      WebMidi.outputs.map(({ name, id }) => ({ value: name, id }))
    );
    setOutput(WebMidi.outputs[0]);
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

  const sendMicrotonalNoteOn = (
    midiNoteFloat: number,
    outputChannel: OutputChannel
  ) => {
    const actualMidiNote = Math.floor(midiNoteFloat);
    const pitchBend = (midiNoteFloat - actualMidiNote) / pitchBendRange;
    outputChannel.sendPitchBend(pitchBend);
    outputChannel.sendNoteOn(actualMidiNote);
  };
  const sendNoteOnForChannel = (channel: number) => {
    if (output) {
      const freq = freqs[channel - 1];
      const midiNoteFloat = ftom(freq);
      const outputChannel = output.channels[channel];
      sendMicrotonalNoteOn(midiNoteFloat, outputChannel);
    }
  };

  const sendNoteOffForChannel = (channel: number) => {
    if (output) {
      const freq = freqs[channel - 1];
      const midiNote = Math.floor(ftom(freq));
      const outputChannel = output.channels[channel];
      outputChannel.sendNoteOff(midiNote);
    }
  };

  const handleFreqInput = (id: string, v: number) => {
    const textAndChannelNumber = extractTextAndChannelNumberFrom(id);
    if (!textAndChannelNumber) {
      console.error("Could not get current channel.");
      return;
    }
    const channel = textAndChannelNumber[1];
    freqs[channel - 1] = v;
  };
  const ftom = (freq: number): number => {
    return 12 * Math.log2(freq / 440) + 69;
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
        sendNoteOnForChannel(channelNumber);
        break;
      case MidiActions.NOTEOFF:
        sendNoteOffForChannel(channelNumber);
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

  const makeFreqInputRow = (channel: number): React.ReactElement => {
    return (
      <li key={channel}>
        <NumberInput
          id={`freq-input-${channel}`}
          initValue={freqs[channel - 1]}
          onChange={handleFreqInput}
        >
          {`Frequency ${channel}`}
        </NumberInput>
        <Button id={`note-on-${channel}`} onClick={handleButtonOnClick}>
          Note On
        </Button>
        <Button id={`note-off-${channel}`} onClick={handleButtonOnClick}>
          Note Off
        </Button>
      </li>
    );
  };

  const makeFreqInputRows = (numberOfFreqs: number): React.ReactElement => {
    const rows = [];
    for (let chan = 1; chan <= numberOfFreqs; chan++) {
      rows.push(makeFreqInputRow(chan));
    }
    return <ul className="freq-input-rows">{rows}</ul>;
  };

  return (
    <>
      <div>
        <h2>Select a MIDI output: </h2>
        <MenuOptions id="midi-outputs" onChange={handleMidiOutputChange}>
          {midiOutputs}
        </MenuOptions>
        <h2>Enter Frequencies: </h2>
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
