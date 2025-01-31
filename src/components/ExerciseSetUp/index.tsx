import Checkbox from "../Checkbox";
import FreqInput from "../FreqInput";
import NumberInput from "../NumberInput";
import Button from "../Button";
import MenuOptions from "../MenuOptions";
import "./index.scss";
import { useState } from "react";
import {
  OptionType,
  AllowedScales,
  SynthOscType,
  ExerciseOptions,
} from "../../common/types";

interface Props {
  options: ExerciseOptions;
  error: string;
  handleChange: (id: OptionType, v: number | string | boolean) => void;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  reset: () => void;
}

const ExerciseSetUp = ({
  options,
  error,
  handleChange,
  handleSubmit,
  reset,
}: Props) => {
  const [numQuestionsIsDisabled, setNumQuestionsIsDisabled] = useState(true);

  const handleMenuSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    handleChange(e.target.id as OptionType, e.target.value);
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.id === OptionType.INFINITEMODE) {
      setNumQuestionsIsDisabled(e.target.checked);
    }
    handleChange(e.target.id as OptionType, e.target.checked);
  };

  const handleNumInputChange = (id: string, v: number) => {
    handleChange(id as OptionType, v);
  };

  return (
    <form className="exercise-set-up" method="post" onSubmit={handleSubmit}>
      <div>
        <h2>Select a sound:</h2>
        <MenuOptions
          defaultOption={options.oscType}
          id={OptionType.OSCTYPE}
          onChange={handleMenuSelectChange}
        >
          {Object.values(SynthOscType)}
        </MenuOptions>
      </div>
      <div>
        <h2>Select a scale:</h2>
        <MenuOptions
          defaultOption={options.scaleName}
          id={OptionType.SCALENAME}
          onChange={handleMenuSelectChange}
        >
          {Object.values(AllowedScales)}
        </MenuOptions>
      </div>
      <div>
        <h2>Include intervals…</h2>
        <Checkbox
          id={OptionType.SMALLERTHANEQUAVE}
          checked={options.smallerThanEquave}
          onChange={handleCheckboxChange}
        >
          smaller than an equave
        </Checkbox>
        <Checkbox
          id={OptionType.LARGERTHANEQUAVE}
          checked={options.largerThanEquave}
          onChange={handleCheckboxChange}
        >
          larger than an equave
        </Checkbox>
      </div>
      <div>
        <h2>Play intervals…</h2>
        <Checkbox
          id={OptionType.PLAYARP}
          checked={options.playArp}
          onChange={handleCheckboxChange}
        >
          as arpeggios
        </Checkbox>
        <Checkbox
          id={OptionType.PLAYSIM}
          checked={options.playSim}
          onChange={handleCheckboxChange}
        >
          simultaneously
        </Checkbox>
      </div>

      <div>
        <h2>Range (in Hz)</h2>
        <div>
          <FreqInput
            id={OptionType.MINFREQ}
            freq={options.minFreq}
            onChange={handleNumInputChange}
          >
            from
          </FreqInput>
          <FreqInput
            id={OptionType.MAXFREQ}
            freq={options.maxFreq}
            onChange={handleNumInputChange}
          >
            to
          </FreqInput>
        </div>
      </div>
      <div>
        <h2>How many questions?</h2>
        <NumberInput
          className={OptionType.NUMQUESTIONS}
          disabled={numQuestionsIsDisabled}
          id={OptionType.NUMQUESTIONS}
          value={options.numQuestions}
          onChange={handleNumInputChange}
        ></NumberInput>
        <Checkbox
          id={OptionType.INFINITEMODE}
          checked={options.infiniteMode}
          onChange={handleCheckboxChange}
        >
          infinite mode
        </Checkbox>
      </div>

      <Button type="button" onClick={reset}>
        restore default
      </Button>
      <Button type="submit">start</Button>

      <p>{error}</p>
    </form>
  );
};

export default ExerciseSetUp;
