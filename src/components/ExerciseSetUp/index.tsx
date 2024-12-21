import Checkbox from "../Checkbox";
import FreqInput from "../FreqInput";
import NumberInput from "../NumberInput";
import Button from "../Button";
import "./index.scss";
import { useState } from "react";
import { OptionType } from "../../common/types";

// TODO: right now the options are hard-coded. Refactor so that they can be generated by the options argument

interface Props {
  error: string;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  handleCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleNumInputChange: (id: string, v: number) => void;
}

const ExerciseSetUp = ({
  error,
  handleSubmit,
  handleCheckboxChange,
  handleNumInputChange,
}: Props) => {
  // const [numQuestionsIsDisabled, setNumQuestionsIsDisabled] = useState(
  //   maker.infiniteMode
  // );
  // const [numQuestionsInitValue, setNumQuestionsInitValue] = useState(
  //   maker.numQuestions
  // );
  const [numQuestionsIsDisabled, setNumQuestionsIsDisabled] = useState(true);

  const restoreDefault = () => {
    window.location.reload();
  };

  return (
    <form className="exercise-set-up" method="post" onSubmit={handleSubmit}>
      <div>
        <h2>include intervals…</h2>
        <Checkbox
          // id="smaller-than-equave"
          id={OptionType.smallerThanEquave}
          initValue={true}
          onChange={handleCheckboxChange}
        >
          smaller than an equave
        </Checkbox>
        <Checkbox
          id={OptionType.largerThanEquave}
          initValue={false}
          onChange={handleCheckboxChange}
        >
          larger than an equave
        </Checkbox>
      </div>
      <div>
        <h2>play intervals…</h2>
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
        <h2>range (in Hz)</h2>
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
        <h2>number of questions</h2>
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

      <Button onClick={restoreDefault}>restore default</Button>
      <Button type="submit">start</Button>

      <p>{error}</p>
    </form>
  );
};

export default ExerciseSetUp;
