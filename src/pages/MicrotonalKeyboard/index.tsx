import "./index.scss";
import ScaleSelector from "../../components/ScaleSelector";
import { Scale } from "../../common/types";
import { useEffect, useState } from "react";
import NumberInput from "../../components/NumberInput";
import Checkbox from "../../components/Checkbox";
import SoundSelector from "../../components/SoundSelector";
import { PolySynth, Sampler } from "tone";
import { fromMidiNote } from "../../common/UtilityFuncs";

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
    null
  );
  const [transpInCents, setTranspInCents] = useState(0.0);
  const [keyboardInputIsEnabled, setKeyboardInputIsEnabled] = useState(false);
  const [instrument, setInstrument] = useState<PolySynth | Sampler | null>(
    null
  );
  const [activeIdxFreqMap, setActiveIdxFreqMap] = useState<Map<number, number>>(
    new Map()
  );
  useEffect(() => {
    if (!keyboardInputIsEnabled || !scale) return;
    const handlePhysicalKeyDownOrUp = (
      e: KeyboardEvent,
      type: "keydown" | "keyup"
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
                noteOct.octaveDisplacement
              );
            } else {
              handleKeyUp(idx);
            }
          }
        }
      }
    };
    const handlePhysicalKeyDown = (e: KeyboardEvent) => {
      handlePhysicalKeyDownOrUp(e, "keydown");
    };
    const handlePhysicalKeyUp = (e: KeyboardEvent) => {
      handlePhysicalKeyDownOrUp(e, "keyup");
    };
    window.addEventListener("keydown", handlePhysicalKeyDown);
    window.addEventListener("keyup", handlePhysicalKeyUp);
    return () => {
      window.removeEventListener("keydown", handlePhysicalKeyDown);
      window.removeEventListener("keyup", handlePhysicalKeyUp);
    };
  }, [keyboardInputIsEnabled, scale, octave, activeIdxFreqMap]);

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
    octaveDisplacement: number
  ) => {
    if (activeKeys.has(idx)) return; // avoid browser auto-repeat

    setActiveKeys((prev) => new Set(prev).add(idx));
    const midiNote =
      12 * (octave + 1 + octaveDisplacement) + (cents + transpInCents) / 100;
    const freq = fromMidiNote(midiNote).freq;
    setActiveIdxFreqMap((prev) => new Map(prev).set(idx, freq));
    instrument?.triggerAttack(freq);
  };
  const handleKeyUp = (idx: number) => {
    setActiveKeys((prev) => {
      const next = new Set(prev);
      next.delete(idx);
      return next;
    });
    const freq = activeIdxFreqMap.get(idx);
    if (freq) {
      instrument?.triggerRelease(freq);
      setActiveIdxFreqMap((prev) => {
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
              noteOct.octaveDisplacement
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
  const handleScaleChange = (scale: Scale) => {
    setScale(scale);
  };
  const handleSoundChange = (instrument: PolySynth | Sampler) => {
    instrument?.releaseAll();
    setInstrument(instrument);
  };

  return (
    <div className="center">
      <div className="grid-5">
        <div>
          <h2>Select a sound: </h2>
          <SoundSelector onSoundChange={handleSoundChange} />
        </div>
        <div>
          <h2>Select a scale: </h2>
          <ScaleSelector onScaleChange={handleScaleChange} />
        </div>
        <div>
          <h2>Keyboard input</h2>
          <Checkbox
            id="microtonal-keyboard-keyinput"
            checked={keyboardInputIsEnabled}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              setKeyboardInputIsEnabled(e.target.checked);
            }}
          >
            Enable
          </Checkbox>
        </div>
        <div>
          <h2>Octave: </h2>
          <NumberInput
            id="microtonal-keyboard-octave"
            value={octave}
            isFreqValue={false}
            onChange={(_id: string, v: number) => {
              setOctave(v);
            }}
            className="short-input"
          ></NumberInput>
        </div>
        <div>
          <h2>Transposition in cents: </h2>
          <NumberInput
            id="microtonal-keyboard-transp"
            value={transpInCents}
            isFreqValue={false}
            min={-4800}
            max={4800}
            onChange={(_id: string, v: number) => {
              setTranspInCents(v);
            }}
            className="medium-input"
          ></NumberInput>
        </div>
      </div>

      <div className="micro-keyboard-grid">
        {keys.map((r, rowIdx) => makeARow(r, rowIdx))}
      </div>
      <button
        onClick={() => {
          instrument?.releaseAll();
        }}
      >
        All Notes Off
      </button>
    </div>
  );
};

export default MicrotonalKeyboard;
