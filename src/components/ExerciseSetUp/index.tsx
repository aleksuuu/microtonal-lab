import Checkbox from "../Checkbox";
import FreqInput from "../FreqInput";
import NumberInput from "../NumberInput";
import Button from "../Button";
import "./index.scss";
import { ExerciseMaker } from "../../common/ExerciseMaker";
import { Option } from "../../common/types";

interface Props {
  options: Option[];
  error: string;
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  maker: ExerciseMaker;
  numQuestionsIsDisabled: boolean;
  onClickStart: () => void;
  onCheckboxChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onNumInputChange: (id: string, v: number) => void;
}

const ExerciseSetUp = ({
  options,
  error,
  handleSubmit,
  maker,
  numQuestionsIsDisabled,
  onClickStart,
  onCheckboxChange,
  onNumInputChange,
}: Props) => {
  // const [numQuestionsIsDisabled, setNumQuestionsIsDisabled] = useState(
  //   maker.infiniteMode
  // );
  // const [numQuestionsInitValue, setNumQuestionsInitValue] = useState(
  //   maker.numQuestions
  // );

  const restoreDefault = () => {
    window.location.reload();
  };

  return (
    <form className="exercise-set-up" method="post" onSubmit={handleSubmit}>
      <div>
        <h2>include intervals…</h2>
        <Checkbox
          id="smaller-than-octave"
          initValue={Boolean(
            options.find((o) => (o.id = "smaller-than-octave"))?.v
          )}
          onChange={onCheckboxChange}
        >
          smaller than an octave
        </Checkbox>
        <Checkbox
          id="larger-than-octave"
          initValue={maker.intervalsLargerThanOctave}
          onChange={onCheckboxChange}
        >
          larger than an octave
        </Checkbox>
      </div>
      <div>
        <h2>play intervals…</h2>
        <Checkbox
          id="play-arp"
          initValue={maker.playArp}
          onChange={onCheckboxChange}
        >
          as arpeggios
        </Checkbox>
        <Checkbox
          id="play-sim"
          initValue={maker.playSim}
          onChange={onCheckboxChange}
        >
          simultaneously
        </Checkbox>
      </div>

      <div>
        <h2>range (in Hz)</h2>
        <div>
          <FreqInput
            id="min-freq"
            initValue={maker.minFreq}
            onChange={onNumInputChange}
          >
            from
          </FreqInput>
          <FreqInput
            id="max-freq"
            initValue={maker.maxFreq}
            onChange={onNumInputChange}
          >
            to
          </FreqInput>
        </div>
      </div>
      <div>
        <h2>number of questions</h2>
        <NumberInput
          className="num-questions"
          disabled={numQuestionsIsDisabled}
          id="num-questions"
          initValue={maker.numQuestions}
          onChange={onNumInputChange}
        ></NumberInput>
        <Checkbox
          id="infinite"
          initValue={maker.infiniteMode}
          onChange={onCheckboxChange}
        >
          infinite mode
        </Checkbox>
      </div>

      <Button onClick={restoreDefault}>restore default</Button>
      <Button onClick={onClickStart} type="submit">
        start
      </Button>

      <p>{error}</p>
    </form>
  );
};

export default ExerciseSetUp;
