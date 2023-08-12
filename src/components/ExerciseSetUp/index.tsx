import Checkbox from "../Checkbox";
import FreqInput from "../FreqInput";
import NumberInput from "../NumberInput";

const ExerciseSetUp = () => {
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log(e.target.id, e.target.checked);
  };
  const handleFreqChange = (id: string, v: number) => {
    console.log(id, v);
  };
  const handleNumQuestionsChange = (id: string, v: number) => {
    console.log(id, v);
  };

  return (
    <>
      <div>
        <h1>include intervals…</h1>
        <Checkbox id="smaller-than-octave" onChange={handleCheckboxChange}>
          smaller than an octave
        </Checkbox>
        <Checkbox id="larger-than-octave" onChange={handleCheckboxChange}>
          larger than an octave
        </Checkbox>
      </div>
      <div>
        <h1>play intervals…</h1>
        <Checkbox id="play-arp" onChange={handleCheckboxChange}>
          as arpeggios
        </Checkbox>
        <Checkbox id="play-sim" onChange={handleCheckboxChange}>
          simultaneously
        </Checkbox>
      </div>
      <div>
        <h1>range</h1>
        <p>from</p>
        <FreqInput
          id="min-freq"
          initValue={130.8}
          onChange={handleFreqChange}
        ></FreqInput>
        <p>to</p>
        <FreqInput
          id="max-freq"
          initValue={523.3}
          onChange={handleFreqChange}
        ></FreqInput>
      </div>
      <div>
        <h1>number of questions</h1>
        <NumberInput
          id="num-questions"
          initValue={5}
          onChange={handleNumQuestionsChange}
        ></NumberInput>
        <Checkbox id="infinite" onChange={handleCheckboxChange}>
          infinite mode
        </Checkbox>
      </div>
    </>
  );
};

export default ExerciseSetUp;
