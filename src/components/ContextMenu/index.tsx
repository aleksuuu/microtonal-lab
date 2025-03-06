import { useEffect, useRef, useState } from "react";
import { FreqMidiNoteCents, PitchType } from "../../common/types";
import {
  formatFreqMidiNoteCentsIntoANote,
  fromFormattedNoteOctaveAndCents,
  fromFreq,
  fromMidiNote,
  fromNoteNameStringAndCents,
} from "../../common/UtilityFuncs";
import "./index.scss";
import { Synth } from "tone";

interface Props {
  mousePos: { x: number; y: number };
  value: number | string;
  valueType: PitchType;
  onClose: () => void;
}

const ContextMenu = ({ mousePos, value, valueType, onClose }: Props) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [sine, setSine] = useState<Synth | null>(null);
  useEffect(() => {
    setSine(
      new Synth({
        volume: -15,
        oscillator: {
          type: "sine",
        },
        envelope: {
          attackCurve: "exponential",
          attack: 0.1,
          decay: 0.4,
          sustain: 0.8,
          release: 1.5,
        },
      }).toDestination()
    );
    return () => {
      if (sine) sine.dispose();
    };
  }, []);

  const [adjustedPosition, setAdjustedPosition] = useState(mousePos);
  // Adjust position to prevent overflow
  useEffect(() => {
    if (menuRef.current) {
      const menuHeight = menuRef.current.offsetHeight;
      const menuWidth = menuRef.current.offsetWidth;
      const windowHeight = window.innerHeight;
      const windowWidth = window.innerWidth;

      let newY = mousePos.y;
      let newX = mousePos.x;

      // Adjust Y position if the menu overflows vertically
      if (mousePos.y + menuHeight > windowHeight) {
        newY = mousePos.y - menuHeight;
      }

      // Adjust X position if the menu overflows horizontally
      if (mousePos.x + menuWidth > windowWidth) {
        newX = mousePos.x - menuWidth;
      }

      setAdjustedPosition({ x: newX, y: newY });
    }
  }, [mousePos]);

  // Close the menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    // Attach the event listeners
    document.addEventListener("keydown", handleKeyDown);

    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [onClose]);

  const [freqMidiNoteCents, setFreqMidiNoteCents] =
    useState<FreqMidiNoteCents | null>(null);

  useEffect(() => {
    setFreqMidiNoteCents(getFreqMidiNoteCents);
  }, [value]);

  const getFreqMidiNoteCents = (): FreqMidiNoteCents | null => {
    switch (valueType) {
      case PitchType.FREQUENCY:
        return fromFreq(Number(value));
      case PitchType.MIDINOTE:
        return fromMidiNote(Number(value));
      case PitchType.NOTENAME:
        return fromNoteNameStringAndCents(String(value));
      case PitchType.CENTS:
        return fromMidiNote(Number(value) * 0.01);
      case PitchType.NOTENAMEANDCENTS:
        return fromFormattedNoteOctaveAndCents(String(value));
      default:
        return null;
    }
  };
  const handleCopyAsFrequency = () => {
    if (freqMidiNoteCents) {
      navigator.clipboard.writeText(String(freqMidiNoteCents.freq));
    }
    onClose();
  };
  const handleCopyAsMidi = () => {
    if (freqMidiNoteCents) {
      navigator.clipboard.writeText(String(freqMidiNoteCents.midiNote));
    }
    onClose();
  };
  const handleCopyAsNoteName = () => {
    if (freqMidiNoteCents) {
      navigator.clipboard.writeText(
        formatFreqMidiNoteCentsIntoANote(freqMidiNoteCents)
      );
    }
    onClose();
  };
  const handleCopyAsCents = () => {
    if (freqMidiNoteCents) {
      navigator.clipboard.writeText(String(freqMidiNoteCents.midiNote * 100));
    }
    onClose();
  };
  const handlePlaySine = () => {
    if (freqMidiNoteCents && sine) {
      sine.triggerAttackRelease(freqMidiNoteCents.freq, 1);
    }
    onClose();
  };

  return (
    <div
      ref={menuRef}
      style={{
        position: "fixed",
        top: adjustedPosition.y,
        left: adjustedPosition.x,
        border: "1px solid black",
        backgroundColor: "white",
        zIndex: 1000,
      }}
    >
      <ul className="context-menu-ul">
        <li onClick={handleCopyAsFrequency}>Copy as Frequency</li>
        <li onClick={handleCopyAsMidi}>Copy as MIDI Note</li>
        <li onClick={handleCopyAsNoteName}>Copy as Note Name w/ Octave</li>
        <li onClick={handleCopyAsCents}>Copy as Cents</li>
        <li onClick={handlePlaySine}>Play Sine</li>
      </ul>
    </div>
  );
};

export default ContextMenu;
