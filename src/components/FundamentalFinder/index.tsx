import { BorderType, FreqMidiNoteCents } from "../../common/types";
import { useState } from "react";
import { getCommonFundamentals } from "../../common/UtilityFuncs";
import NumberInput from "../NumberInput";
import TextInput from "../TextInput";

const FundamentalFinder = () => {
  const [freqsTextInput, setFreqsTextInput] = useState("");
  const [inputFreqs, setInputFreqs] = useState<number[]>([]);
  const [minFreq, setMinFreq] = useState(20);
  const [maxFreq, setMaxFreq] = useState(220);
  const [textInputHasErr, setTextInputHasErr] = useState(false);
  const handleNumberInput = (id: string, v: number) => {
    switch (id) {
      case "fundamental-finder-min-freq":
        setMinFreq(v);
        break;
      case "fundamental-finder-max-freq":
        setMaxFreq(v);
        break;
    }
  };

  const handleTextInputOnChange = (_id: string, v: string) => {
    setFreqsTextInput(v);
  };

  const handleTextInputOnBlur = (_id: string, v: string) => {
    const freqStrs = v.split(" ");
    const freqNums = [];
    for (const freqStr of freqStrs) {
      const freqNumber = Number(freqStr);
      if (isNaN(freqNumber)) {
        setTextInputHasErr(true);
        return;
      }
      freqNums.push(freqNumber);
    }
    const roundedFreqs = freqNums.map((freq) => Math.round(freq));
    setInputFreqs(roundedFreqs);
  };

  const formatFundamental = (
    partials: number[],
    fundamental: FreqMidiNoteCents
  ): React.ReactElement => {
    let addCents = "";
    if (fundamental.addCents !== 0) {
      addCents = Math.round(fundamental.addCents) + "¢";
      if (fundamental.addCents > 0) {
        addCents = "+" + addCents;
      }
    }
    return (
      <tr key={fundamental.freq}>
        <th scope="row">
          {fundamental.freq} ({fundamental.noteName}
          {fundamental.octave}
          {addCents})
        </th>
        {partials.map((p) => (
          <td>{p}</td>
        ))}
      </tr>
    );
  };
  const getFormattedFundamentals = (): React.ReactElement => {
    const fundamentals = getCommonFundamentals(inputFreqs, minFreq, maxFreq);
    return (
      <tbody>
        {fundamentals.map((fundamental) =>
          formatFundamental(fundamental.partialNums, fundamental.fundamental)
        )}
      </tbody>
    );
  };

  const getInputFrequencies = (): React.ReactElement[] => {
    return inputFreqs.map((f) => <th scope="col">{f}</th>);
  };

  return (
    <div>
      <h2>Fundamental Finder</h2>
      <TextInput
        id="fundamental-finder-freq-input"
        text={freqsTextInput}
        onChange={handleTextInputOnChange}
        onBlur={handleTextInputOnBlur}
        border={textInputHasErr ? BorderType.Failure : BorderType.Normal}
      >
        Partial frequencies (separated by space)
      </TextInput>
      <p>{textInputHasErr ? "Error parsing frequencies." : ""}</p>
      <NumberInput
        id="fundamental-finder-min-freq"
        value={minFreq}
        isFreqValue={true}
        onChange={handleNumberInput}
        className="medium-input"
      >
        Minimum frequency for imaginary fundamentals
      </NumberInput>
      <NumberInput
        id="fundamental-finder-max-freq"
        value={maxFreq}
        isFreqValue={true}
        onChange={handleNumberInput}
        className="medium-input"
      >
        Maximum frequency for imaginary fundamentals
      </NumberInput>
      <table hidden={inputFreqs.length === 0}>
        <thead>
          <tr>
            <th scope="col">Imaginary Fundamentals/Partial Frequencies</th>
            {getInputFrequencies()}
          </tr>
        </thead>
        {getFormattedFundamentals()}
      </table>
    </div>
  );
};

export default FundamentalFinder;
