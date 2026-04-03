import "./index.scss";
import ScaleSelector from "../../components/ScaleSelector";
import { Scale } from "../../common/types";
import { useEffect, useState } from "react";
import NumberInput from "../../components/NumberInput";
import Checkbox from "../../components/Checkbox";
import SoundSelector from "../../components/SoundSelector";
import { PolySynth, Sampler } from "tone";
import { fromMidiNote, freqToMidi } from "../../common/UtilityFuncs";
import { WebMidi, Output } from "webmidi"; // New Import
import MenuOptions from "../../components/MenuOptions"; // New Import

const keys: string[][] = [
  [..."1234567890-="],
  [..."QWERTYUIOP"],
  [..."ASDFGHJKL;"],
  [..."ZXCVBNM,./"],
];
const flattenedKeys: string[] = keys
  .flat()
  .filter((k) => k !== "-" && k !== "=");

const MicrotonalKeyboard = () => {
  const [scale, setScale] = useState<Scale | null>(null);
  const [activeKeys, setActiveKeys] = useState<Set<number>>(new Set());
  const [octave, setOctave] = useState(4);
  const [pressedOctaveKey, setPressedOctaveKey] = useState<null | "-" | "=">(
    null,
  );
  const [transpInCents, setTranspInCents] = useState(0.0);
  const [keyboardInputIsEnabled, setKeyboardInputIsEnabled] = useState(true);
  const [instrument, setInstrument] = useState<PolySynth | Sampler | null>(
    null,
  );

  // --- MIDI State ---
  const [midiEnabled, setMidiEnabled] = useState(false);
  const [midiOutputs, setMidiOutputs] = useState<
    { value: string; id: string }[]
  >([]);
  const [selectedMidiOutput, setSelectedMidiOutput] = useState<
    Output | undefined
  >();
  const [pitchBendRange, setPitchBendRange] = useState(48);
  const [channelMap, setChannelMap] = useState<Map<number, number>>(new Map()); // KeyIdx -> MIDI Channel
  const [nextChannel, setNextChannel] = useState(2); // Cycle 2-16

  const [activeIdxFreqMap, setActiveIdxFreqMap] = useState<Map<number, number>>(
    new Map(),
  );

  useEffect(() => {
    return () => {
      // This runs when the component is destroyed
      instrument?.releaseAll();
      instrument?.dispose();
    };
  }, [instrument]);

  // Initialize WebMidi
  useEffect(() => {
    WebMidi.enable()
      .then(() => {
        setMidiOutputs(
          WebMidi.outputs.map(({ name, id }) => ({ value: name, id })),
        );
        if (WebMidi.outputs.length > 0) {
          setMidiEnabled(true);
          setSelectedMidiOutput(WebMidi.outputs[0]);
        }
      })
      .catch((err) => console.error("WebMidi failed", err));
  }, []);

  useEffect(() => {
    if (!keyboardInputIsEnabled || !scale) return;
    const handlePhysicalKeyDownOrUp = (
      e: KeyboardEvent,
      type: "keydown" | "keyup",
    ) => {
      const key = e.key.toUpperCase();
      if (key === "-" || key === "=") {
        if (type === "keydown") {
          setPressedOctaveKey(key);
        } else {
          setPressedOctaveKey(null);
          if (key === "-") setOctave(octave - 1);
          else setOctave(octave + 1);
        }
      } else {
        const idx = flattenedKeys.findIndex((k) => k === key);
        if (idx !== -1) {
          const noteOct = getNoteAndOctaveDisplacementFromIdx(idx);
          if (noteOct) {
            if (type === "keydown") {
              handleKeyDown(
                idx,
                noteOct.note.cents,
                noteOct.octaveDisplacement,
              );
            } else {
              handleKeyUp(idx);
            }
          }
        }
      }
    };
    const handlePhysicalKeyDown = (e: KeyboardEvent) =>
      handlePhysicalKeyDownOrUp(e, "keydown");
    const handlePhysicalKeyUp = (e: KeyboardEvent) =>
      handlePhysicalKeyDownOrUp(e, "keyup");
    window.addEventListener("keydown", handlePhysicalKeyDown);
    window.addEventListener("keyup", handlePhysicalKeyUp);
    return () => {
      window.removeEventListener("keydown", handlePhysicalKeyDown);
      window.removeEventListener("keyup", handlePhysicalKeyUp);
    };
  }, [
    keyboardInputIsEnabled,
    scale,
    octave,
    activeIdxFreqMap,
    selectedMidiOutput,
    pitchBendRange,
    nextChannel,
  ]);

  const getNoteAndOctaveDisplacementFromIdx = (idx: number) => {
    if (!scale) return null;
    return {
      note: scale.notes[idx % (scale.notes.length - 1)],
      octaveDisplacement: Math.floor(idx / (scale.notes.length - 1)),
    };
  };

  const handleKeyDown = (
    idx: number,
    cents: number,
    octaveDisplacement: number,
  ) => {
    if (activeKeys.has(idx)) return;

    setActiveKeys((prev) => new Set(prev).add(idx));
    const midiNoteFloat =
      12 * (octave + 1 + octaveDisplacement) + (cents + transpInCents) / 100;
    const freq = fromMidiNote(midiNoteFloat).freq;
    setActiveIdxFreqMap((prev) => new Map(prev).set(idx, freq));

    // Internal Sound
    instrument?.triggerAttack(freq);

    // MIDI Output
    if (selectedMidiOutput) {
      const midiNote = Math.floor(midiNoteFloat);
      const pbValue = (midiNoteFloat - midiNote) / pitchBendRange;
      const chan = nextChannel;

      const outputChannel = selectedMidiOutput.channels[chan];
      outputChannel.sendPitchBend(pbValue);
      outputChannel.sendNoteOn(midiNote);

      setChannelMap((prev) => new Map(prev).set(idx, chan));
      setNextChannel(Math.max(2, (chan + 1) % 17)); // Cycle channels for MPE-like polyphony; avoiding channel 1 (usually global)
    }
  };

  const handleKeyUp = (idx: number) => {
    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });

    // Internal Sound
    const freq = activeIdxFreqMap.get(idx);
    if (freq) {
      instrument?.triggerRelease(freq);
      setActiveIdxFreqMap((prev) => {
        const next = new Map(prev);
        next.delete(idx);
        return next;
      });
    }

    // MIDI Output
    const assignedChan = channelMap.get(idx);
    if (selectedMidiOutput && assignedChan) {
      const midiNoteFloat = activeIdxFreqMap.get(idx)
        ? freqToMidi(activeIdxFreqMap.get(idx)!)
        : 60;
      selectedMidiOutput.channels[assignedChan].sendNoteOff(
        Math.floor(midiNoteFloat),
      );
      setChannelMap((prev) => {
        const next = new Map(prev);
        next.delete(idx);
        return next;
      });
    }
  };

  const makeAKey = (idxInRow: number, rowIdx: number, name: string) => {
    if (name === "-" || name === "=") {
      return (
        <button
          key={name}
          onClick={() => {
            if (name === "-") setOctave(octave - 1);
            else setOctave(octave + 1);
          }}
          className={`micro-key ${
            pressedOctaveKey === name ? "border-success" : "border-normal"
          }`}
        >
          {" "}
          <div className="micro-key-name">{name}</div>
          <div className="smufl micro-note-name">
            {name === "-" ? "Oct–" : "Oct+"}
          </div>
        </button>
      );
    } else {
      const realIdx = idxInRow + rowIdx * 10;
      const noteOct = getNoteAndOctaveDisplacementFromIdx(realIdx);
      if (!noteOct) return <button className="micro-key"></button>;
      return (
        <button
          key={name}
          onMouseDown={() =>
            handleKeyDown(
              realIdx,
              noteOct.note.cents,
              noteOct.octaveDisplacement,
            )
          }
          className={`micro-key ${
            activeKeys.has(realIdx) ? "border-success" : "border-normal"
          }`}
          onMouseUp={() => handleKeyUp(realIdx)}
        >
          <div className="micro-key-name">{name}</div>
          <div className="smufl micro-note-name">{noteOct.note.name}</div>
        </button>
      );
    }
  };
  const makeARow = (row: string[], rowIdx: number) => {
    return (
      <div
        className="micro-keyboard-row"
        key={rowIdx}
        style={{ paddingLeft: rowIdx * 40 }}
      >
        {row.map((key, idx) => makeAKey(idx, rowIdx, key))}
      </div>
    );
  };

  const handleMidiOutputChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const outputId = e.target.selectedOptions.item(0)?.id;
    if (outputId) {
      setSelectedMidiOutput(WebMidi.getOutputById(outputId));
    }
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
      <title>Microtonal Lab - Microtonal Keyboard</title>
      <div className="center">
        <div className="grid-6">
          <div>
            <h2>Internal Sound: </h2>
            <SoundSelector
              onSoundChange={(inst) => {
                instrument?.releaseAll();
                instrument?.dispose();
                setInstrument(inst);
              }}
            />
          </div>
          {/* New MIDI Section */}
          <div>
            <h2>MIDI Output: </h2>
            <MenuOptions id="midi-outputs" onChange={handleMidiOutputChange}>
              {[{ value: "None", id: "none" }, ...midiOutputs]}
            </MenuOptions>
            {selectedMidiOutput && (
              <div style={{ marginTop: "10px" }}>
                <label>PB Range: </label>
                <NumberInput
                  id="pb-range"
                  value={pitchBendRange}
                  onChange={(_, v) => setPitchBendRange(v)}
                  className="short-input"
                />
              </div>
            )}
          </div>
          <div>
            <h2>Select a scale: </h2>
            <ScaleSelector onScaleChange={setScale} />
          </div>
          <div>
            <h2>Keyboard input</h2>
            <Checkbox
              id="microtonal-keyboard-keyinput"
              checked={keyboardInputIsEnabled}
              onChange={(e) => setKeyboardInputIsEnabled(e.target.checked)}
            >
              Enable
            </Checkbox>
          </div>
          <div>
            <h2>Octave</h2>
            <NumberInput
              id="microtonal-keyboard-octave"
              value={octave}
              onChange={(_, v) => setOctave(v)}
              className="short-input"
            />
          </div>
          <div>
            <h2>Transposition</h2>
            <NumberInput
              id="microtonal-keyboard-transp"
              value={transpInCents}
              min={-4800}
              max={4800}
              onChange={(_, v) => setTranspInCents(v)}
              className="medium-input"
            />
          </div>
        </div>

        <div className="micro-keyboard-grid">
          {keys.map((r, rowIdx) => makeARow(r, rowIdx))}
        </div>

        <button
          onClick={() => {
            instrument?.releaseAll();
            selectedMidiOutput?.sendAllNotesOff();
          }}
        >
          All Notes Off
        </button>
      </div>
      {errMsg}
    </>
  );
};

export default MicrotonalKeyboard;
