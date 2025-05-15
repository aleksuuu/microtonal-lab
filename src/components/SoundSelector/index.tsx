import { OptionType, SynthOscType } from "../../common/types";
import MenuOptions from "../MenuOptions";
import { useEffect } from "react";
import { PolySynth, Sampler, Synth } from "tone";
import piano from "../../assets/piano-F4.wav";
// TODO: implement this in Interval

interface Props {
  defaultSound?: SynthOscType;
  onSoundChange: (instrument: PolySynth | Sampler) => void;
}

const SoundSelector = ({
  defaultSound = SynthOscType.TRIANGLE,
  onSoundChange,
}: Props) => {
  const initSampler = () => {
    const sampler = new Sampler({
      F4: piano,
    }).toDestination();
    sampler.release = 1;
    return sampler;
  };

  const initPolySynth = (oscType: SynthOscType = SynthOscType.TRIANGLE) => {
    if (oscType === SynthOscType.PIANO) {
      console.error("Unsupported oscillator type.");
      return;
    }
    const polySynth = new PolySynth(Synth, {
      volume: -15,
      oscillator: {
        type: oscType,
      },
      envelope: {
        attackCurve: "exponential",
        attack: 0.1,
        decay: 0.4,
        sustain: 0.8,
        release: 1.5,
      },
    }).toDestination();
    return polySynth;
  };

  const handleSoundChange = (type: SynthOscType) => {
    if (type === SynthOscType.PIANO) {
      onSoundChange(initSampler());
    } else {
      const polySynth = initPolySynth(type);
      if (polySynth) onSoundChange(polySynth);
    }
  };

  useEffect(() => {
    handleSoundChange(defaultSound);
  }, []);

  const handleMenuSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleSoundChange(e.target.value as SynthOscType);
  };
  return (
    <MenuOptions
      defaultOption={defaultSound}
      id={OptionType.OSCTYPE}
      onChange={handleMenuSelectChange}
    >
      {Object.values(SynthOscType)}
    </MenuOptions>
  );
};

export default SoundSelector;
