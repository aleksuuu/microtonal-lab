import Checkbox from "../Checkbox";
import FreqInput from "../FreqInput";
import NumberInput from "../NumberInput";
import Button from "../Button";
import "./index.scss";
import { useState } from "react";
import { OptionType, AllowedScales } from "../../common/types";

// TODO: right now the options are hard-coded. Refactor so that they can be generated by the options argument

interface Props {
  error: string;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleMenuSelectChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNumInputChange: (id: string, v: number) => void;
  reset: () => void;
}

const ExerciseSetUp = ({
  error,
  handleSubmit,
  handleMenuSelectChange,
  handleCheckboxChange,
  handleNumInputChange,
  reset,
}: Props) => {
  const [numQuestionsIsDisabled, setNumQuestionsIsDisabled] = useState(true);

  const makeScaleOptions = (
    defaultScale: AllowedScales
  ): React.ReactElement => {
    const options = [];
    const scaleArr = Object.values(AllowedScales); // otherwise the for loop will give me the keys of the enum not the values
    for (const scale of scaleArr) {
      if (scale === defaultScale) {
        options.push(
          <option value={scale} selected>
            {scale}
          </option>
        );
      } else {
        options.push(<option value={scale}>{scale}</option>);
      }
    }
    return (
      <select id={OptionType.SCALENAME} onChange={handleMenuSelectChange}>
        {options}
      </select>
    );
  };

  return (
    <form className="exercise-set-up" method="post" onSubmit={handleSubmit}>
      <div>
        <h2>Select a scale:</h2>
        {makeScaleOptions(AllowedScales.EDO_24)}
      </div>
      <div>
        <h2>Include intervals…</h2>
        <Checkbox
          id={OptionType.SMALLERTHANEQUAVE}
          initValue={true}
          onChange={handleCheckboxChange}
        >
          smaller than an equave
        </Checkbox>
        <Checkbox
          id={OptionType.LARGERTHANEQUAVE}
          initValue={false}
          onChange={handleCheckboxChange}
        >
          larger than an equave
        </Checkbox>
      </div>
      <div>
        <h2>Play intervals…</h2>
        <Checkbox
          id={OptionType.PLAYARP}
          initValue={true}
          onChange={handleCheckboxChange}
        >
          as arpeggios
        </Checkbox>
        <Checkbox
          id={OptionType.PLAYSIM}
          initValue={true}
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
            initValue={220}
            onChange={handleNumInputChange}
          >
            from
          </FreqInput>
          <FreqInput
            id={OptionType.MAXFREQ}
            initValue={659.3}
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
          initValue={5}
          onChange={handleNumInputChange}
        ></NumberInput>
        <Checkbox
          id={OptionType.INFINITEMODE}
          initValue={true}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            handleCheckboxChange(e);
            setNumQuestionsIsDisabled(e.target.checked);
          }}
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
