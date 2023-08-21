import Checkbox from "../Checkbox";
import FreqInput from "../FreqInput";
import NumberInput from "../NumberInput";
import Button from "../Button";
import "./index.scss";
import { ExerciseMaker } from "../../common/ExerciseMaker";
import { useState } from "react";

interface Props {
  error: string;
  maker: ExerciseMaker;
  onClickStart: () => void;
}

const ExerciseSetUp = ({ error, maker, onClickStart }: Props) => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    switch (e.target.id) {
      case "smaller-than-octave":
        maker.intervalsSmallerThanOctave = e.target.checked;
        break;
      case "larger-than-octave":
        maker.intervalsLargerThanOctave = e.target.checked;
        break;
      case "play-arp":
        maker.playArp = e.target.checked;
        break;
      case "play-sim":
        maker.playSim = e.target.checked;
        break;
      case "infinite":
        maker.infiniteMode = e.target.checked;
        setNumQuestionsIsDisabled(maker.infiniteMode);
        if (maker.infiniteMode) {
          setNumQuestionsInitValue(maker.numQuestions); // not sure why this is necessary but it is
        }
        break;
    }
    console.log(maker);
  };
  const handleNumInputChange = (id: string, v: number) => {
    switch (id) {
      case "min-freq":
        maker.minFreq = v;
        break;
      case "max-freq":
        maker.maxFreq = v;
        break;
      case "num-questions":
        maker.numQuestions = v;
        break;
    }
  };

  const [numQuestionsIsDisabled, setNumQuestionsIsDisabled] = useState(
    maker.infiniteMode
  );
  const [numQuestionsInitValue, setNumQuestionsInitValue] = useState(
    maker.numQuestions
  );

  const restoreDefault = () => {
    window.location.reload();
  };

  return (
    <div className="exercise-set-up">
      <div>
        <h2>include intervals…</h2>
        <Checkbox
          id="smaller-than-octave"
          initValue={maker.intervalsSmallerThanOctave}
          onChange={handleCheckboxChange}
        >
          smaller than an octave
        </Checkbox>
        <Checkbox
          id="larger-than-octave"
          initValue={maker.intervalsLargerThanOctave}
          onChange={handleCheckboxChange}
        >
          larger than an octave
        </Checkbox>
      </div>
      <div>
        <h2>play intervals…</h2>
        <Checkbox
          id="play-arp"
          initValue={maker.playArp}
          onChange={handleCheckboxChange}
        >
          as arpeggios
        </Checkbox>
        <Checkbox
          id="play-sim"
          initValue={maker.playSim}
          onChange={handleCheckboxChange}
        >
          simultaneously
        </Checkbox>
      </div>

      <div>
        <h2>range (in Hz)</h2>
        <div>
          <FreqInput
            className="freq-input"
            id="min-freq"
            initValue={maker.minFreq}
            onChange={handleNumInputChange}
          >
            from
          </FreqInput>
          <FreqInput
            className="freq-input"
            id="max-freq"
            initValue={maker.maxFreq}
            onChange={handleNumInputChange}
          >
            to
          </FreqInput>
        </div>
      </div>
      <div>
        <h2>number of questions</h2>
        <NumberInput
          disabled={numQuestionsIsDisabled}
          id="num-questions"
          initValue={numQuestionsInitValue}
          onChange={handleNumInputChange}
        ></NumberInput>
        <Checkbox
          id="infinite"
          initValue={maker.infiniteMode}
          onChange={handleCheckboxChange}
        >
          infinite mode
        </Checkbox>
      </div>

      <Button onClick={restoreDefault}>restore default</Button>
      <Button onClick={onClickStart}>start</Button>

      <p>{error}</p>
    </div>
  );
};

export default ExerciseSetUp;
